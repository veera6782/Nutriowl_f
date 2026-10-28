import goalsService from './goalsService';
import profileService from './profileService';
import { clearChat, toApiMessages } from './chatHistory';

const AUTH_TOKEN_KEY = 'nutriowl_auth_token';
const AUTH_EMAIL_KEY = 'nutriowl_auth_email';
// The backend gives up on the AI provider after ~25s; allow for that plus network time.
const CHAT_TIMEOUT_MS = 35000;

function authToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

export function getCurrentEmail() {
  return localStorage.getItem(AUTH_EMAIL_KEY) || '';
}

// Ends the session on this device, including the signed-in user's saved chat.
export function clearSession() {
  clearChat(getCurrentEmail());
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EMAIL_KEY);
}

// Errors from the API carry the HTTP status so callers can tell 401/429/5xx apart.
function apiError(status, message) {
  return Object.assign(new Error(message), { status });
}

function readLocalProfile() {
  try {
    return profileService.loadProfile();
  } catch (error) {
    console.warn('Unable to read local profile fallback', error);
    return null;
  }
}

function readLocalGoalsState() {
  try {
    const state = goalsService.getState();
    return {
      ...state,
      goals: Array.isArray(state?.goals) ? state.goals : [],
      fruitPreference: state?.fruitPreference || { servings: 2 },
      hydrationReminder: state?.hydrationReminder || 9,
      wellnessPlan: state?.wellnessPlan || null
    };
  } catch (error) {
    console.warn('Unable to read local goals fallback', error);
    return {
      goals: [],
      fruitPreference: { servings: 2 },
      hydrationReminder: 9,
      wellnessPlan: null
    };
  }
}

function fallbackRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  if (path === '/api/profile' && method === 'GET') {
    return readLocalProfile();
  }

  if (path === '/api/profile' && method === 'POST') {
    const payload = options.body ? JSON.parse(options.body) : {};
    return profileService.saveProfile(payload);
  }

  if (path === '/api/goals' && method === 'GET') {
    const goalState = readLocalGoalsState();
    return { ...goalState, goals: goalState.goals || [] };
  }

  if (path === '/api/goals/generate' && method === 'POST') {
    const state = readLocalGoalsState();
    return { ...state, goals: state.goals || [] };
  }

  if (path === '/api/goals/preferences' && method === 'PATCH') {
    const payload = options.body ? JSON.parse(options.body) : {};
    const current = readLocalGoalsState();
    const servings = Math.max(1, Number(payload?.fruitPreference?.servings ?? current.fruitPreference?.servings ?? 2));
    const nextGoals = (current.goals || []).map(goal => goal.id === 'fruits' ? { ...goal, target: servings } : goal);
    const nextState = {
      ...current,
      goals: nextGoals,
      fruitPreference: { servings },
      hydrationReminder: current.hydrationReminder || 9,
      wellnessPlan: current.wellnessPlan || null
    };
    goalsService.saveGoals(nextGoals);
    return nextState;
  }

  if (path.startsWith('/api/goals/') && method === 'PATCH') {
    const id = path.split('/').filter(Boolean).pop();
    const patch = options.body ? JSON.parse(options.body) : {};
    const current = readLocalGoalsState();
    const nextGoals = (current.goals || []).map(goal => {
      if (goal.id !== id) return goal;
      if (patch.target !== undefined) {
        return { ...goal, target: Math.max(1, Number(patch.target)) };
      }
      if (patch.increment !== undefined) {
        const nextProgress = Math.min(goal.target, (goal.progress || 0) + Math.max(0, Number(patch.increment)));
        return { ...goal, progress: nextProgress };
      }
      return goal;
    });
    goalsService.saveGoals(nextGoals);
    return { ...current, goals: nextGoals };
  }

  return undefined;
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken() ? { Authorization: `Bearer ${authToken()}` } : {}),
        ...(options.headers || {})
      }
    });
  } catch (error) {
    const localFallback = fallbackRequest(path, options);
    if (localFallback !== undefined) {
      console.warn(`NutriOwl backend unavailable for ${path}; using local storage fallback.`, error);
      return localFallback;
    }
    throw error;
  }

  const responseText = await response.text();
  let body = null;
  if (responseText.trim()) {
    try {
      body = JSON.parse(responseText);
    } catch {
      throw apiError(response.status, `The NutriOwl backend returned an unexpected response (${response.status}).`);
    }
  }
  if (!response.ok) throw apiError(response.status, body?.error || 'The NutriOwl backend request failed.');
  if (!body) throw apiError(response.status, `The NutriOwl backend returned an unexpected response (${response.status}).`);
  return body;
}

async function startSession(path, email, password) {
  const result = await request(path, { method: 'POST', body: JSON.stringify({ email, password }) });
  localStorage.setItem(AUTH_TOKEN_KEY, result.token);
  localStorage.setItem(AUTH_EMAIL_KEY, result.profile.email);
  return result.profile;
}

export function signUp(email, password) {
  return startSession('/api/auth/signup', email, password);
}

export function signIn(email, password) {
  return startSession('/api/auth/signin', email, password);
}

export async function signOut() {
  try {
    await request('/api/auth/signout', { method: 'POST' });
  } finally {
    clearSession();
  }
}

export function saveProfile(profile) {
  return request('/api/profile', { method: 'POST', body: JSON.stringify(profile) });
}

export function getProfile() {
  return request('/api/profile');
}

export function getGoals() {
  return request('/api/goals');
}

export function generateGoals() {
  return request('/api/goals/generate', { method: 'POST' });
}

export function updateGoal(id, patch) {
  return request(`/api/goals/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
}

export function updateGoalPreferences(preferences) {
  return request('/api/goals/preferences', { method: 'PATCH', body: JSON.stringify(preferences) });
}

// Sends the conversation (oldest first, newest user message last) and resolves to
// { response, source } where source is "ai", "fallback" or "safety".
export function sendChat(messages) {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages: toApiMessages(messages) }),
    signal: AbortSignal.timeout(CHAT_TIMEOUT_MS)
  });
}
