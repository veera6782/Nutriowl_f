// Conversation helpers for NutriOwl chat. The backend is stateless, so the
// frontend owns the history: it is stored per user and sent with every request.

// The backend only reads the last 20 messages; trim before sending.
export const MAX_API_MESSAGES = 20;
// Keep storage bounded for long-running conversations.
const MAX_STORED_MESSAGES = 200;
// Pre-AI chat stored canned messages under this key; it is no longer used.
const LEGACY_STORAGE_KEY = 'nutriowl_chat_messages';

export function chatStorageKey(email) {
  return `nutriowl_chat_v2:${email || 'guest'}`;
}

function isChatMessage(message) {
  return Boolean(message)
    && (message.role === 'user' || message.role === 'assistant')
    && typeof message.content === 'string'
    && message.content.trim() !== '';
}

// The request body's `messages`: oldest first, newest user message last, no UI-only fields.
export function toApiMessages(messages) {
  return messages
    .filter(isChatMessage)
    .map(({ role, content }) => ({ role, content }))
    .slice(-MAX_API_MESSAGES);
}

export function loadChat(email) {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const parsed = JSON.parse(localStorage.getItem(chatStorageKey(email)) || '[]');
    return Array.isArray(parsed) ? parsed.filter(isChatMessage) : [];
  } catch {
    return [];
  }
}

export function saveChat(email, messages) {
  try {
    if (messages.length) {
      localStorage.setItem(chatStorageKey(email), JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
    } else {
      localStorage.removeItem(chatStorageKey(email));
    }
  } catch {
    // Storage full or unavailable: the conversation still works for this visit.
  }
}

export function clearChat(email) {
  try {
    localStorage.removeItem(chatStorageKey(email));
  } catch {
    // Nothing stored to clear.
  }
}
