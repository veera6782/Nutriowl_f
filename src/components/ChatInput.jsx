import React, { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSend, disabled = false }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    // keep placeholder accessible
    if (!textareaRef.current) return;
  }, []);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function send() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  }

  return (
    <div className="w-full bg-transparent">
      <div className="flex w-full items-center gap-2 rounded-full border border-green-200 bg-white/90 p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-green-300">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask NutriOwl anything..."
          aria-label="Chat input"
          className="min-h-10 min-w-0 flex-1 resize-none rounded-full bg-transparent px-3 py-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={!text.trim() || disabled}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 p-0 text-white shadow-md transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-send">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}
