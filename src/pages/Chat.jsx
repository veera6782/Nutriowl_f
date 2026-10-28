import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import ChatMessage, { TypingIndicator } from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { useI18n } from '../i18n/LanguageContext';
import * as apiClient from '../services/apiClient';
import { loadChat, saveChat } from '../services/chatHistory';
import BottomNavigation from '../components/BottomNavigation';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function makeMessage(role, content, source) {
  return { id: makeId(), role, content, timestamp: new Date().toISOString(), ...(source ? { source } : {}) };
}

export default function Chat() {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  // The conversation is stored per signed-in user (or as "guest" when signed out).
  const [email, setEmail] = useState(() => apiClient.getCurrentEmail());
  const [messages, setMessages] = useState(() => loadChat(email));
  const [sending, setSending] = useState(false);
  // UI-only notices; never part of the history sent to the API.
  // { kind: 'limit', text } | { kind: 'error' } | { kind: 'unauthorized' }
  const [notice, setNotice] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    saveChat(email, messages);
  }, [email, messages]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, sending, notice]);

  async function requestReply(history) {
    setSending(true);
    setNotice(null);
    try {
      const { response, source } = await apiClient.sendChat(history);
      setMessages(current => [...current, makeMessage('assistant', response, source)]);
    } catch (error) {
      if (error.status === 429) {
        setNotice({ kind: 'limit', text: error.message });
      } else if (error.status === 401) {
        // Same as signing out: the session and this user's saved chat are cleared.
        apiClient.clearSession();
        setEmail('');
        setMessages([]);
        setNotice({ kind: 'unauthorized' });
      } else {
        console.error('NutriOwl chat request failed', error);
        setNotice({ kind: 'error' });
      }
    } finally {
      setSending(false);
    }
  }

  function sendMessage(text) {
    if (sending || !text.trim()) return;
    const history = [...messages, makeMessage('user', text.trim())];
    setMessages(history);
    requestReply(history);
  }

  function handleNewChat() {
    setMessages([]);
    setNotice(null);
  }

  let noticeText = null;
  if (notice?.kind === 'limit') noticeText = language === 'en' && notice.text ? notice.text : t('chat.dailyLimit');
  if (notice?.kind === 'error') noticeText = t('chat.networkError');
  if (notice?.kind === 'unauthorized') noticeText = t('chat.sessionExpired');

  return (
    <div className="h-dvh overflow-hidden bg-cream">
      <div className="mx-auto flex h-full max-w-3xl flex-col px-6 pt-6 pb-28">
        <header className="mb-4 flex shrink-0 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800">{t('chat.title')}</h1>
            <p className="text-gray-600">{t('chat.subtitle')}</p>
          </div>
          <div className="w-28 h-28 overflow-hidden rounded-full bg-[#edf8ed] p-1 shadow-[0_8px_16px_rgba(46,94,62,0.08)]">
            <img src="/nutriowl_mascot_full.jpg" alt={t('common.mascotAlt')} className="w-full h-full object-cover rounded-full" />
          </div>
        </header>

        <section className="mb-4 shrink-0 rounded-2xl bg-green-50 p-4 shadow-inner">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-white p-1 shadow-sm">
              <img src="/nutriowl_mascot_full.jpg" alt={t('common.mascotAlt')} className="h-full w-full rounded-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-green-800">{t('chat.greeting')}</div>
              <div className="text-gray-600">{t('chat.intro')}</div>
            </div>
          </div>
        </section>

        <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-white p-4 shadow-sm">
          {messages.length > 0 && (
            <div className="flex shrink-0 justify-end">
              <button
                type="button"
                onClick={handleNewChat}
                disabled={sending}
                className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-800 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiPlus aria-hidden="true" />
                {t('chat.newChat')}
              </button>
            </div>
          )}

          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto py-2" aria-live="polite">
            {messages.map(m => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {sending && <TypingIndicator />}
            {notice && (
              <div role="alert" className="mx-auto mb-4 max-w-[90%] rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800">
                <p>{noticeText}</p>
                {notice.kind === 'error' && (
                  <button type="button" onClick={() => requestReply(messages)} className="mt-2 rounded-full bg-white px-4 py-1.5 font-medium text-red-800 shadow-sm ring-1 ring-red-200">
                    {t('chat.retry')}
                  </button>
                )}
                {notice.kind === 'unauthorized' && (
                  <button type="button" onClick={() => navigate('/')} className="mt-2 rounded-full bg-[#4CAF50] px-4 py-1.5 font-medium text-white shadow-sm">
                    {t('chat.signIn')}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 shrink-0 border-t border-green-50 bg-white pt-3">
            <ChatInput onSend={sendMessage} disabled={sending} />
            <p className="mt-2 text-center text-xs text-gray-500">{t('chat.disclaimer')}</p>
          </div>
        </div>

        <BottomNavigation active="chat" />
      </div>
    </div>
  );
}
