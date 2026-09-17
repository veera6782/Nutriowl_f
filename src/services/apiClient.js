const profileStorageKey = 'nutriowl_profile';

function currentEmail() {
  try {
    const profile = JSON.parse(localStorage.getItem(profileStorageKey) || '{}');
    return String(profile.email || '').trim().toLowerCase();
  } catch {
    return '';
  }
}

async function request(path, options = {}) {
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
