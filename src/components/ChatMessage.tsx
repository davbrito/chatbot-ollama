import { useState } from "react";
import type { UIMessage } from "@tanstack/ai-react";

interface ChatMessageProps {
  message: UIMessage;
  isLastLoading?: boolean;
}

export function ChatMessage({ message, isLastLoading }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [thinkingOpen, setThinkingOpen] = useState(false);

  const textThinking = message.parts
    .filter((p) => p.type === "thinking")
    .map((p) => p.content)
    .join("");

  const textContent = message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.content)
    .join("");

  const showTypingIndicator = isLastLoading && !isUser && textContent === "";
  const isThinking = isLastLoading && !isUser && textContent === "" && textThinking !== "";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3 mt-1">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-indigo-600 text-white rounded-tr-sm"
            : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
        }`}
      >
        {!isUser && textThinking && (
          <div className="mb-2">
            <button
              onClick={() => setThinkingOpen((v) => !v)}
              className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
            >
              <span
                className={`inline-block transition-transform duration-200 ${thinkingOpen ? "rotate-90" : ""}`}
              >
                ▶
              </span>
              {isThinking ? (
                <span className="animate-pulse">Pensando...</span>
              ) : (
                <span>Razonamiento</span>
              )}
            </button>
            {thinkingOpen && (
              <div className="mt-2 text-xs text-gray-500 italic bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {textThinking}
              </div>
            )}
          </div>
        )}
        {showTypingIndicator && !isThinking ? (
          <div className="flex gap-1 items-center h-5">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {textContent}
          </p>
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
