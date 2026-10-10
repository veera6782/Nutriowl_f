import http from 'node:http';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databasePath = path.join(__dirname, '..', 'data', 'nutriowl.json');
const port = Number(process.env.API_PORT || 3002);
const scrypt = promisify(scryptCallback);
const sessionDurationMs = 30 * 24 * 60 * 60 * 1000;

const defaultGoals = [
  { id: 'scan', title: 'Scan a meal', type: 'count', unit: 'meal scanned', target: 1, progress: 0, daily: true },
  { id: 'protein', title: 'Eat enough proteins', type: 'number', unit: 'g', target: 50, progress: 0, daily: true },
  { id: 'fruits', title: 'Eat fruits', type: 'count', unit: 'servings', target: 2, progress: 0, daily: true },
  { id: 'water', title: 'Hydration reminder: 9 glasses', type: 'count', unit: 'glasses', target: 9, progress: 0, daily: true },
  { id: 'active', title: 'Be active 5 days this week', type: 'count', unit: 'days', target: 5, progress: 0, daily: false },
  { id: 'healthyMeals', title: 'Make healthy food choices', type: 'count', unit: 'healthy meals', target: 20, progress: 0, daily: false }
];

async function readDatabase() {
  try {
    return JSON.parse(await fs.readFile(databasePath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return { users: {} };
  }
}

async function writeDatabase(database) {
  await fs.mkdir(path.dirname(databasePath), { recursive: true });
  await fs.writeFile(databasePath, JSON.stringify(database, null, 2));
}

function send(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
  });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) body += chunk;
  return body ? JSON.parse(body) : {};
}

function sessionToken(request) {
  const authorization = String(request.headers.authorization || '');
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
}

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

function createSession(database, email) {
  database.sessions ||= {};
  const token = randomBytes(32).toString('base64url');
  database.sessions[tokenHash(token)] = {
    email,
    expiresAt: Date.now() + sessionDurationMs
  };
  return token;
}

function authenticatedEmail(request, database) {
  const token = sessionToken(request);
  if (!token || !database.sessions) return null;

  const sessionKey = tokenHash(token);
  const session = database.sessions[sessionKey];
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    delete database.sessions[sessionKey];
    return null;
  }
  return session.email;
}

function validEmail(email) {
  return typeof email === 'string' && email.length <= 254 && /^\S+@\S+\.\S+$/.test(email);
}

async function hashPassword(password, salt) {
  return scrypt(password, salt, 64);
}

async function authenticate(request, response, database, url) {
  const input = await readBody(request);

  if (url.pathname === '/api/auth/signup' && request.method === 'POST') {
    const email = String(input.email || '').trim().toLowerCase();
    const password = input.password;
    if (!validEmail(email)) return send(response, 400, { error: 'Enter a valid email address.' });
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return send(response, 400, { error: 'Password must be between 8 and 128 characters.' });
    }
    if (database.users?.[email]) return send(response, 409, { error: 'An account with this email already exists. Sign in instead.' });

    const salt = randomBytes(16).toString('hex');
    const passwordHash = await hashPassword(password, salt);
    database.users ||= {};
    const user = newUser({ email, onboardingCompleted: false });
    user.passwordSalt = salt;
    user.passwordHash = passwordHash.toString('hex');
    database.users[email] = user;
    const token = createSession(database, email);
    await writeDatabase(database);
    return send(response, 201, { token, profile: user.profile });
  }

  if (url.pathname === '/api/auth/signin' && request.method === 'POST') {
    const email = String(input.email || '').trim().toLowerCase();
    const password = input.password;
    const user = database.users?.[email];
    if (!validEmail(email) || typeof password !== 'string' || !user?.passwordSalt || !user?.passwordHash) {
      return send(response, 401, { error: 'Email or password is incorrect.' });
    }

    const candidateHash = await hashPassword(password, user.passwordSalt);
    const storedHash = Buffer.from(user.passwordHash, 'hex');
    if (candidateHash.length !== storedHash.length || !timingSafeEqual(candidateHash, storedHash)) {
      return send(response, 401, { error: 'Email or password is incorrect.' });
    }

    const token = createSession(database, email);
    await writeDatabase(database);
    return send(response, 200, { token, profile: user.profile });
  }

  if (url.pathname === '/api/auth/signout' && request.method === 'POST') {
    const token = sessionToken(request);
    const email = authenticatedEmail(request, database);
    if (!email) return send(response, 401, { error: 'Please sign in to continue.' });
    delete database.sessions[tokenHash(token)];
    await writeDatabase(database);
    return send(response, 200, { success: true });
  }

  return false;
}

function profileForStorage(input) {
  return {
    name: String(input.name || '').trim(),
    email: String(input.email || '').trim().toLowerCase(),
    age: Number(input.age),
    heightCm: Number(input.heightCm ?? input.height),
    weightKg: Number(input.weightKg ?? input.weight),
    activityLevel: String(input.activityLevel || '').trim(),
    goal: Array.isArray(input.goals) ? input.goals[0] || '' : String(input.goal || '').trim(),
    onboardingCompleted: input.onboardingCompleted === true
  };
}

function normalizeActivity(value) {
  const activity = String(value || '').toLowerCase();
  if (activity === 'high' || activity.includes('high')) return 'high';
  if (activity === 'moderate' || activity.includes('moderate')) return 'moderate';
  return 'low';
}

function buildPlan(profile, fruitPreference, hydrationReminder) {
  const activity = normalizeActivity(profile.activityLevel);
  const goal = String(profile.goal || 'balanced').toLowerCase();
  const weightRelated = goal.includes('weight') || goal.includes('fat') || goal.includes('loss');
  const activityText = activity === 'high'
    ? 'Include enough meals, hydration and recovery foods around active days.'
    : activity === 'moderate'
      ? 'Keep regular meals and snacks available to fuel everyday activity.'
      : 'Add gradual everyday movement, such as walking, play or active breaks.';
  const goalText = weightRelated
    ? 'Because you are still growing, changes to weight or nutrition targets should be discussed with a parent or guardian and a qualified healthcare professional.'
    : goal.includes('strength') || goal.includes('performance')
      ? 'Choose regular protein-containing foods and balanced recovery meals.'
      : goal.includes('energy')
        ? 'Regular meals, snacks and hydration can support steady energy.'
        : 'Build variety by including different foods across the day.';

  return {
    breakfast: ['Whole grain or starch', 'Fruit', 'Eggs, yogurt, beans, paneer or tofu', 'Milk or a suitable alternative'],
    morningSnack: ['Fruit or vegetables', 'Yogurt, nuts, seeds or another protein-containing food'],
    lunch: ['Grain or starch', 'Vegetables', 'Beans, lentils, paneer, tofu, fish or chicken where appropriate', 'Fruit'],
    afternoonSnack: ['A fruit or vegetable option', 'Whole-grain food with yogurt, hummus, nuts or seeds'],
    dinner: ['Grain or starch', 'Vegetables', 'A protein-containing food', 'A healthy fat source such as avocado, olive oil, nuts or seeds'],
    hydration: `Hydration reminder: ${hydrationReminder} glasses. Drink regularly and more during heat or activity.`,
    activityHabit: `${activityText} ${goalText}`,
    tips: ['Try different colors and food groups through the week.', 'Avoid skipping meals; ask a trusted adult for help with food choices.', 'These are general wellness ideas, not medical advice.'],
    generatedAt: new Date().toISOString()
  };
}

function newUser(profile) {
  const fruitPreference = { servings: 2 };
  const hydrationReminder = 9;
  return {
    profile,
    goals: {
      userId: profile.email,
      activityLevel: profile.activityLevel,
      primaryGoal: profile.goal,
      fruitPreference,
      hydrationReminder,
      wellnessPlan: buildPlan(profile, fruitPreference.servings, hydrationReminder),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    goalItems: defaultGoals.map(goal => ({ ...goal, target: goal.id === 'fruits' ? fruitPreference.servings : goal.target }))
  };
}

function getOrCreateUser(database, key) {
  if (!database.users[key]) {
    database.users[key] = newUser({ email: key, onboardingCompleted: false });
  }
  return database.users[key];
}

async function handler(request, response) {
  if (request.method === 'OPTIONS') return send(response, 204, {});
  if (!request.url.startsWith('/api/')) return send(response, 404, { error: 'Not found' });

  const database = await readDatabase();
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname.startsWith('/api/auth/')) {
    const authResponse = await authenticate(request, response, database, url);
    if (authResponse !== false) return authResponse;
  }

  const key = authenticatedEmail(request, database);
  if (!key) return send(response, 401, { error: 'Please sign in to continue.' });
  const user = database.users?.[key];
  if (!user) return send(response, 401, { error: 'Please sign in to continue.' });

  if (request.method === 'GET' && url.pathname === '/api/profile') {
    return send(response, 200, user.profile);
  }
  if (request.method === 'POST' && url.pathname === '/api/profile') {
    const input = await readBody(request);
    const nextProfile = profileForStorage(input);
    if (nextProfile.email !== key) return send(response, 400, { error: 'Profile email does not match the current user.' });
    const relevantChanged = JSON.stringify(user.profile) !== JSON.stringify(nextProfile);
    user.profile = nextProfile;
    if (relevantChanged) {
      user.goals.activityLevel = nextProfile.activityLevel;
      user.goals.primaryGoal = nextProfile.goal;
      user.goals.wellnessPlan = buildPlan(nextProfile, user.goals.fruitPreference.servings, user.goals.hydrationReminder);
      user.goals.updatedAt = new Date().toISOString();
    }
    await writeDatabase(database);
    return send(response, 200, user.profile);
  }
  if (request.method === 'GET' && url.pathname === '/api/goals') {
    return send(response, 200, { ...user.goals, goals: user.goalItems });
  }
  if (request.method === 'POST' && url.pathname === '/api/goals/generate') {
    user.goals.wellnessPlan = buildPlan(user.profile, user.goals.fruitPreference.servings, user.goals.hydrationReminder);
    user.goals.updatedAt = new Date().toISOString();
    await writeDatabase(database);
    return send(response, 200, { ...user.goals, goals: user.goalItems });
  }
  if (request.method === 'PATCH' && url.pathname === '/api/goals/preferences') {
    const input = await readBody(request);
    const servings = Math.max(1, Math.min(10, Number(input.fruitPreference?.servings ?? user.goals.fruitPreference.servings)));
    user.goals.fruitPreference = { servings };
    user.goalItems = user.goalItems.map(goal => goal.id === 'fruits' ? { ...goal, target: servings } : goal);
    user.goals.wellnessPlan = buildPlan(user.profile, servings, user.goals.hydrationReminder);
    user.goals.updatedAt = new Date().toISOString();
    await writeDatabase(database);
    return send(response, 200, { ...user.goals, goals: user.goalItems });
  }
  if (request.method === 'PATCH' && url.pathname.startsWith('/api/goals/')) {
    const id = url.pathname.split('/').pop();
    const input = await readBody(request);
    const goal = user.goalItems.find(item => item.id === id);
    if (!goal) return send(response, 404, { error: 'Goal not found.' });
    if (input.target !== undefined) goal.target = Math.max(1, Number(input.target));
    if (input.increment !== undefined) goal.progress = Math.min(goal.target, goal.progress + Math.max(0, Number(input.increment)));
    user.goals.updatedAt = new Date().toISOString();
    await writeDatabase(database);
    return send(response, 200, { ...user.goals, goals: user.goalItems });
  }

  return send(response, 404, { error: 'Not found' });
}

http.createServer((request, response) => {
  handler(request, response).catch(error => {
    console.error(error);
    send(response, 500, { error: 'The NutriOwl backend could not complete that request.' });
  });
}).listen(port, () => console.log(`NutriOwl API listening on http://localhost:${port}`));
