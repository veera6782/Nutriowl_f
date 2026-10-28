import goalsService from './goalsService';
import profileService from './profileService';
import { clearChat, toApiMessages } from './chatHistory';

const AUTH_TOKEN_KEY = 'nutriowl_auth_token';
const AUTH_EMAIL_KEY = 'nutriowl_auth_email';
// The backend gives up on the AI provider after ~25s; allow for that plus network time.
const CHAT_TIMEOUT_MS = 35000;

const sessionExpiredListeners = new Set();
// True from the moment a stored token is rejected until the next sign-in, so pages
// opened afterwards (e.g. chat) can still tell the user why they were signed out.
let sessionExpired = false;

// The stored token, or '' when there is no usable one. Blank values and the strings
// "undefined"/"null" count as no token: sending them would always get a 401.
function authToken() {
  const token = (localStorage.getItem(AUTH_TOKEN_KEY) || '').trim();
  return token && token !== 'undefined' && token !== 'null' ? token : '';
}

export function isSignedIn() {
  return Boolean(authToken());
}

export function wasSessionExpired() {
  return sessionExpired;
}

export function getCurrentEmail() {
  return localStorage.getItem(AUTH_EMAIL_KEY) || '';
}

// Ends the session on this device, including the signed-in user's saved chat and cached profile.
export function clearSession() {
  clearChat(getCurrentEmail());
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EMAIL_KEY);
  profileService.clearProfile();
}

// Called when the backend rejects a stored token, e.g. so protected pages can redirect to sign-in.
export function onSessionExpired(listener) {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

// A 401 for a token we sent means the session is over. Only act if that token is still the
// stored one, so several requests failing together clear the session and notify just once.
function handleRejectedToken(sentToken) {
  if (authToken() !== sentToken) return;
  sessionExpired = true;
  clearSession();
  sessionExpiredListeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.warn('Session-expired listener failed', error);
    }
  });
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

// `auth: false` sends the request without the Authorization header even when signed in.
async function request(path, { auth = true, ...options } = {}) {
  const token = auth ? authToken() : '';
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  if (response.status === 401 && token) handleRejectedToken(token);

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
  // Never send a leftover token with a sign-in attempt.
  const result = await request(path, { method: 'POST', auth: false, body: JSON.stringify({ email, password }) });
  if (typeof result.token !== 'string' || !result.token) {
    throw apiError(500, 'The NutriOwl backend returned an unexpected response.');
  }
  localStorage.setItem(AUTH_TOKEN_KEY, result.token);
  localStorage.setItem(AUTH_EMAIL_KEY, result.profile.email);
  sessionExpired = false;
  return result.profile;
}

export function signUp(email, password) {
  return startSession('/api/auth/signup', email, password);
}

export function signIn(email, password) {
  return startSession('/api/auth/signin', email, password);
}

// Signs out locally first, then revokes the token on the server. The revoke bypasses the
// session-expired handling: a deliberate sign-out shouldn't show an "expired" message.
export async function signOut() {
  const token = authToken();
  clearSession();
  if (!token) return;
  await request('/api/auth/signout', { method: 'POST', auth: false, headers: { Authorization: `Bearer ${token}` } });
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
// Chat also works signed out, so if the stored token is rejected (the session is then
// cleared by request()), the same request is retried once anonymously and the result
// is flagged with sessionExpired: true.
export async function sendChat(messages) {
  const send = auth => request('/api/chat', {
    method: 'POST',
    auth,
    body: JSON.stringify({ messages: toApiMessages(messages) }),
    signal: AbortSignal.timeout(CHAT_TIMEOUT_MS)
  });
  const sentToken = isSignedIn();
  try {
    return await send(true);
  } catch (error) {
    if (error.status !== 401 || !sentToken) throw error;
    return { ...(await send(false)), sessionExpired: true };
  }
}

// Checks a stored token in the background on app start, so a stale one is cleared
// (via request()'s 401 handling) before it breaks other requests. Never throws.
export function validateStoredSession() {
  if (!isSignedIn()) return Promise.resolve();
  return request('/api/profile').then(() => undefined, () => undefined);
}
