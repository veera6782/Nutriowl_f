import goalsService from './goalsService';
import profileService from './profileService';

const profileStorageKey = 'nutriowl_profile';

function currentEmail() {
  try {
    const profile = JSON.parse(localStorage.getItem(profileStorageKey) || '{}');
    return String(profile.email || '').trim().toLowerCase();
  } catch {
    return '';
  }
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
    const saved = profileService.saveProfile(payload);
    return saved;
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
  try {
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': currentEmail(),
        ...(options.headers || {})
      }
    });
    const responseText = await response.text();
    let body = null;
    if (responseText.trim()) {
      try {
        body = JSON.parse(responseText);
      } catch {
        body = null;
      }
    }
    if (!body) {
      throw new Error(`The NutriOwl backend returned an unexpected response (${response.status}).`);
    }
    if (!response.ok) throw new Error(body.error || 'The NutriOwl backend request failed.');
    return body;
  } catch (error) {
    const localFallback = fallbackRequest(path, options);
    if (localFallback !== undefined) {
      console.warn(`NutriOwl backend unavailable for ${path}; using local storage fallback.`, error);
      return localFallback;
    }
    throw error;
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
