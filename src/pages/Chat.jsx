import React, { useEffect, useRef, useState } from 'react';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import nutriService from '../services/nutriOwlChat';
import BottomNavigation from '../components/BottomNavigation';

const STORAGE_KEY = 'nutriowl_chat_messages';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const defaultConversation = [
  {
    id: makeId(),
    sender: 'user',
    text: 'What are some high protein foods?',
    timestamp: new Date().toISOString()
  },
  {
    id: makeId(),
    sender: 'owl',
    text: 'Great question! Here are some high-protein foods you can include in your meals: eggs, chicken or fish (if you eat animal products), paneer or tofu, lentils and beans, Greek yogurt and dairy, and nuts & seeds.',
    timestamp: new Date().toISOString()
  },
  {
    id: makeId(),
    sender: 'user',
    text: 'How much water should I drink daily?',
    timestamp: new Date().toISOString()
  },
  {
    id: makeId(),
    sender: 'owl',
    text: 'A common guideline is about 6–8 cups (1.5–2 liters) per day for many adults, but needs vary with activity, climate, and body size. Drink more when exercising or in hot weather.',
    timestamp: new Date().toISOString()
  }
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load chat from storage, using default conversation', e);
    }

    setMessages(defaultConversation);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat to storage', e);
    }
  }, [messages]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  async function sendMessage(text) {
    const userMsg = { id: makeId(), sender: 'user', text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    setLoading(true);
    const placeholder = { id: 'thinking', sender: 'owl', text: 'NutriOwl is thinking...', timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, placeholder]);

    try {
      const response = await nutriService.getNutriOwlResponse(text);
      setMessages(prev => prev.filter(m => m.id !== 'thinking'));
      const owlMsg = { id: makeId(), sender: 'owl', text: response, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, owlMsg]);
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== 'thinking'));
      const errMsg = { id: makeId(), sender: 'owl', text: 'Sorry, something went wrong while preparing a response.', timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errMsg]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-dvh overflow-hidden bg-cream">
      <div className="mx-auto flex h-full max-w-3xl flex-col px-6 pt-6 pb-28">
        <header className="mb-4 flex shrink-0 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800">NutriOwl Chat</h1>
            <p className="text-gray-600">Your friendly nutrition buddy is here to help!</p>
          </div>
          <div className="w-28 h-28 overflow-hidden rounded-full bg-[#edf8ed] p-1 shadow-[0_8px_16px_rgba(46,94,62,0.08)]">
            <img src="/nutriowl_mascot_full.jpg" alt="NutriOwl mascot" className="w-full h-full object-cover rounded-full" />
          </div>
        </header>

        <section className="mb-4 shrink-0 rounded-2xl bg-green-50 p-4 shadow-inner">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-white p-1 shadow-sm">
              <img src="/nutriowl_mascot_full.jpg" alt="NutriOwl mascot" className="h-full w-full rounded-full object-cover" />
            </div>
            <div>
              <div className="font-semibold text-green-800">Hi there!</div>
              <div className="text-gray-600">Ask me anything about nutrition, healthy eating or your diet!</div>
            </div>
          </div>
        </section>

        <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-white p-4 shadow-sm">
          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto py-2">
            {messages.map(m => (
              <ChatMessage key={m.id} message={m} />
            ))}
          </div>

          <div className="mt-3 shrink-0 border-t border-green-50 bg-white pt-3">
            <ChatInput onSend={sendMessage} disabled={loading} />
          </div>
        </div>

        <BottomNavigation active="chat" />
      </div>
    </div>
  );
}
