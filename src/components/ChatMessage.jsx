import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useI18n } from '../i18n/LanguageContext';

// Styling for the light Markdown the assistant uses (paragraphs, lists, bold, links).
const markdownComponents = {
  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
  ul: ({ node, ...props }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...props} />,
  ol: ({ node, ...props }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
  h1: ({ node, ...props }) => <p className="mb-2 font-semibold" {...props} />,
  h2: ({ node, ...props }) => <p className="mb-2 font-semibold" {...props} />,
  h3: ({ node, ...props }) => <p className="mb-2 font-semibold" {...props} />,
  code: ({ node, ...props }) => <code className="rounded bg-gray-100 px-1" {...props} />,
  a: ({ node, ...props }) => <a className="text-green-700 underline" target="_blank" rel="noopener noreferrer" {...props} />
};

function OwlAvatar() {
  return (
    <div className="mr-3 h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-[#edf8ed] shadow-sm">
      <img src="/nutriowl_mascot_full.jpg" alt="NutriOwl" className="h-full w-full object-cover" />
    </div>
  );
}

export default function ChatMessage({ message }) {
  const { t, locale } = useI18n();
  const isUser = message.role === 'user';
  const isSafety = message.source === 'safety';
  const time = new Date(message.timestamp).toLocaleTimeString(locale ?? [], { hour: '2-digit', minute: '2-digit' });

  const bubbleClass = isUser
    ? 'bg-green-50 text-gray-900 rounded-br-none'
    : isSafety
      ? 'border border-amber-200 bg-amber-50 text-gray-900 rounded-bl-none'
      : 'bg-white text-gray-800 rounded-bl-none';

  return (
    <div className={`mb-4 flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <OwlAvatar />}

      <div className={`max-w-[78%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block rounded-2xl p-4 text-left shadow-sm ${bubbleClass}`}>
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          ) : (
            // Raw HTML in model output is dropped, never rendered; images are not shown.
            <div className="break-words">
              <ReactMarkdown skipHtml disallowedElements={['img']} unwrapDisallowed components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <div className={`mt-1 text-xs text-gray-400 ${isUser ? 'text-right' : 'text-left'}`}>
          {time}
          {message.source === 'fallback' && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">{t('chat.limitedMode')}</span>}
          {isSafety && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">{t('chat.supportMessage')}</span>}
        </div>
      </div>

      {isUser && <div className="ml-3 h-10 w-10 flex-shrink-0" aria-hidden />}
    </div>
  );
}

export function TypingIndicator() {
  const { t } = useI18n();
  return (
    <div className="mb-4 flex w-full justify-start" role="status">
      <OwlAvatar />
      <div className="inline-flex items-center gap-1 rounded-2xl rounded-bl-none bg-white p-4 shadow-sm">
        <span className="sr-only">{t('chat.thinking')}</span>
        {[0, 150, 300].map(delay => (
          <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-green-500" style={{ animationDelay: `${delay}ms` }} aria-hidden="true" />
        ))}
      </div>
    </div>
  );
}
