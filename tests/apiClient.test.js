import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as apiClient from '../src/services/apiClient';
import { loadChat, saveChat } from '../src/services/chatHistory';
import { jsonResponse, memoryStorage } from './helpers';

const conversation = [{ role: 'user', content: 'What is a good breakfast?', timestamp: 't1' }];
const authHeader = call => call[1].headers.Authorization;

function signIn(token = 'good-token', email = 'a@example.test') {
  localStorage.setItem('nutriowl_auth_token', token);
  localStorage.setItem('nutriowl_auth_email', email);
}

let unsubscribe;

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
});

afterEach(() => {
  unsubscribe?.();
  unsubscribe = undefined;
  vi.unstubAllGlobals();
});

describe('Authorization header', () => {
  it('is sent when a real token is stored', async () => {
    signIn('good-token');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { goals: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.getGoals();

    expect(authHeader(fetchMock.mock.calls[0])).toBe('Bearer good-token');
  });

  it.each([['missing', null], ['empty', ''], ['blank', '   '], ['"undefined"', 'undefined'], ['"null"', 'null']])(
    'is omitted when the stored token is %s',
    async (_label, stored) => {
      if (stored !== null) localStorage.setItem('nutriowl_auth_token', stored);
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { goals: [] }));
      vi.stubGlobal('fetch', fetchMock);

      await apiClient.getGoals();

      expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
      expect(apiClient.isSignedIn()).toBe(false);
    }
  );

  it('is never sent with sign-in, even if an old token is stored', async () => {
    signIn('stale-token');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { token: 'new-token', profile: { email: 'a@example.test' } }));
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.signIn('a@example.test', 'secure-password-123');

    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
    expect(apiClient.isSignedIn()).toBe(true);
  });

  it('does not store a missing token from a malformed sign-in response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { profile: { email: 'a@example.test' } })));

    await expect(apiClient.signIn('a@example.test', 'secure-password-123')).rejects.toThrow();
    expect(localStorage.getItem('nutriowl_auth_token')).toBeNull();
  });
});

describe('401 handling', () => {
  it('clears the token, cached profile and saved chat, and notifies once', async () => {
    signIn('stale-token');
    localStorage.setItem('nutriowl_profile', JSON.stringify({ name: 'Asha' }));
    saveChat('a@example.test', conversation);
    const expired = vi.fn();
    unsubscribe = apiClient.onSessionExpired(expired);
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(jsonResponse(401, { error: 'A valid bearer token is required.' }))));

    // Two requests failing together (as on the Goals page) must not notify twice.
    const results = await Promise.allSettled([apiClient.getProfile(), apiClient.getGoals()]);

    expect(results.map(r => r.reason?.status)).toEqual([401, 401]);
    expect(expired).toHaveBeenCalledTimes(1);
    expect(apiClient.isSignedIn()).toBe(false);
    expect(apiClient.getCurrentEmail()).toBe('');
    expect(localStorage.getItem('nutriowl_profile')).toBeNull();
    expect(loadChat('a@example.test')).toEqual([]);
  });

  it('remembers the expiry until the next sign-in', async () => {
    signIn('stale-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { error: 'A valid bearer token is required.' })));
    await apiClient.getGoals().catch(() => {});
    expect(apiClient.wasSessionExpired()).toBe(true);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { token: 'new-token', profile: { email: 'a@example.test' } })));
    await apiClient.signIn('a@example.test', 'secure-password-123');
    expect(apiClient.wasSessionExpired()).toBe(false);
  });

  it('does not treat a 401 as an expired session when no token was sent', async () => {
    const expired = vi.fn();
    unsubscribe = apiClient.onSessionExpired(expired);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { error: 'Invalid email or password.' })));

    await expect(apiClient.signIn('a@example.test', 'wrong-password')).rejects.toMatchObject({ status: 401 });
    expect(expired).not.toHaveBeenCalled();
  });

  it('does not retry ordinary requests', async () => {
    signIn('stale-token');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401, { error: 'A valid bearer token is required.' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.getGoals()).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('signing out with a stale token clears locally without an "expired" notification', async () => {
    signIn('stale-token');
    const expired = vi.fn();
    unsubscribe = apiClient.onSessionExpired(expired);
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401, { error: 'A valid bearer token is required.' }));
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.signOut().catch(() => {});

    expect(authHeader(fetchMock.mock.calls[0])).toBe('Bearer stale-token');
    expect(apiClient.isSignedIn()).toBe(false);
    expect(expired).not.toHaveBeenCalled();
  });
});

describe('sendChat with a rejected token', () => {
  it('clears the token and retries the same request once without the header', async () => {
    signIn('stale-token');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(401, { error: 'A valid bearer token is required.' }))
      .mockResolvedValueOnce(jsonResponse(200, { response: 'Try oats.', source: 'ai' }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiClient.sendChat(conversation);

    expect(result).toEqual({ response: 'Try oats.', source: 'ai', sessionExpired: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(authHeader(fetchMock.mock.calls[0])).toBe('Bearer stale-token');
    expect(fetchMock.mock.calls[1][1].headers).not.toHaveProperty('Authorization');
    expect(fetchMock.mock.calls[1][1].body).toBe(fetchMock.mock.calls[0][1].body);
    expect(apiClient.isSignedIn()).toBe(false);
  });

  it('keeps other errors from the anonymous retry (e.g. 429)', async () => {
    signIn('stale-token');
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse(401, { error: 'A valid bearer token is required.' }))
      .mockResolvedValueOnce(jsonResponse(429, { error: "You have reached today's chat limit. Please try again tomorrow." })));

    await expect(apiClient.sendChat(conversation)).rejects.toMatchObject({ status: 429 });
  });

  it('does not retry a 401 when no token was sent', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401, { error: 'A valid bearer token is required.' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.sendChat(conversation)).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('validateStoredSession', () => {
  it('does nothing when signed out', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await apiClient.validateStoredSession();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('clears a token the backend rejects', async () => {
    signIn('stale-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { error: 'A valid bearer token is required.' })));
    await expect(apiClient.validateStoredSession()).resolves.toBeUndefined();
    expect(apiClient.isSignedIn()).toBe(false);
  });

  it('keeps a valid token, and keeps it when the backend is unreachable', async () => {
    signIn('good-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { email: 'a@example.test' })));
    await apiClient.validateStoredSession();
    expect(apiClient.isSignedIn()).toBe(true);

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await apiClient.validateStoredSession();
    expect(apiClient.isSignedIn()).toBe(true);
  });
});
