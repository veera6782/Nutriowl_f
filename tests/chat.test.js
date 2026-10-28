import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chatStorageKey, clearChat, loadChat, saveChat, toApiMessages, MAX_API_MESSAGES } from '../src/services/chatHistory';
import * as apiClient from '../src/services/apiClient';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: key => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: key => data.delete(key),
    clear: () => data.clear()
  };
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

const conversation = [
  { id: '1', role: 'user', content: 'What should I eat for breakfast?', timestamp: 't1' },
  { id: '2', role: 'assistant', content: 'Try **oats** with fruit.', timestamp: 't2', source: 'ai' },
  { id: '3', role: 'user', content: 'What about for dinner?', timestamp: 't3' }
];

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('toApiMessages', () => {
  it('keeps prior turns in order with the newest user message last, without UI fields', () => {
    expect(toApiMessages(conversation)).toEqual([
      { role: 'user', content: 'What should I eat for breakfast?' },
      { role: 'assistant', content: 'Try **oats** with fruit.' },
      { role: 'user', content: 'What about for dinner?' }
    ]);
  });

  it('drops other roles and empty messages', () => {
    const messages = [
      { role: 'system', content: 'ignore me' },
      { role: 'user', content: '   ' },
      { role: 'user', content: 'Hi' }
    ];
    expect(toApiMessages(messages)).toEqual([{ role: 'user', content: 'Hi' }]);
  });

  it('sends only the last 20 messages', () => {
    const long = Array.from({ length: 25 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }));
    const sent = toApiMessages(long);
    expect(sent).toHaveLength(MAX_API_MESSAGES);
    expect(sent[0].content).toBe('m5');
    expect(sent.at(-1).content).toBe('m24');
  });
});

describe('chat storage', () => {
  it('stores conversations per user and clears one user without touching another', () => {
    saveChat('a@example.test', conversation);
    saveChat('b@example.test', conversation.slice(0, 1));
    expect(loadChat('a@example.test')).toHaveLength(3);
    clearChat('a@example.test');
    expect(loadChat('a@example.test')).toEqual([]);
    expect(loadChat('b@example.test')).toHaveLength(1);
  });

  it('removes the key when the conversation is emptied and ignores corrupt data', () => {
    saveChat('', conversation);
    saveChat('', []);
    expect(localStorage.getItem(chatStorageKey(''))).toBeNull();
    localStorage.setItem(chatStorageKey('x@example.test'), '{not json');
    expect(loadChat('x@example.test')).toEqual([]);
  });

  it('survives storage that throws', () => {
    vi.stubGlobal('localStorage', { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } });
    expect(loadChat('a@example.test')).toEqual([]);
    expect(() => saveChat('a@example.test', conversation)).not.toThrow();
  });
});

describe('apiClient.sendChat', () => {
  it('sends the bearer token and the full conversation when signed in', async () => {
    localStorage.setItem('nutriowl_auth_token', 'token-123');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { response: 'Grilled fish.', source: 'ai' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.sendChat(conversation)).resolves.toEqual({ response: 'Grilled fish.', source: 'ai' });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/chat');
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Bearer token-123');
    expect(JSON.parse(options.body)).toEqual({ messages: toApiMessages(conversation) });
  });

  it('omits the Authorization header entirely when signed out', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { response: 'Hi!', source: 'fallback' }));
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.sendChat(conversation);

    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
  });

  it.each([
    [429, "You have reached today's chat limit. Please try again tomorrow."],
    [401, 'A valid bearer token is required.'],
    [500, 'The NutriOwl backend could not complete that request.']
  ])('rejects with status %i and the server message', async (status, error) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(status, { error })));
    await expect(apiClient.sendChat(conversation)).rejects.toMatchObject({ status, message: error });
  });

  it('rejects without a status on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const error = await apiClient.sendChat(conversation).catch(e => e);
    expect(error).toBeInstanceOf(TypeError);
    expect(error.status).toBeUndefined();
  });
});

describe('apiClient.clearSession', () => {
  it('signs out locally and clears that user\'s saved chat', () => {
    localStorage.setItem('nutriowl_auth_token', 'token-123');
    localStorage.setItem('nutriowl_auth_email', 'a@example.test');
    saveChat('a@example.test', conversation);

    apiClient.clearSession();

    expect(localStorage.getItem('nutriowl_auth_token')).toBeNull();
    expect(apiClient.getCurrentEmail()).toBe('');
    expect(loadChat('a@example.test')).toEqual([]);
  });
});
