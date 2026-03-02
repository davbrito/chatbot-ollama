import type { UIMessage } from '@tanstack/ai-react';

interface ChatMessageProps {
  message: UIMessage;
  isLastLoading?: boolean;
}

export function ChatMessage({ message, isLastLoading }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const textContent = message.parts
    .filter((p) => p.type === 'text')
    .map((p) => p.content)
    .join('');

  const showTypingIndicator = isLastLoading && !isUser && textContent === '';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3 mt-1">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
        }`}
      >
        {showTypingIndicator ? (
          <div className="flex gap-1 items-center h-5">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{textContent}</p>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-3 mt-1">
          <span className="text-gray-700 text-xs font-bold">You</span>
        </div>
      )}
    </div>
  );
}
