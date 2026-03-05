import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import type { CustomMessage } from "../store/chatStore";

interface ChatMessageProps {
  message: CustomMessage;
  isLastLoading?: boolean;
}

export function ChatMessage({ message, isLastLoading }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [thinkingOpen, setThinkingOpen] = useState(false);

  const textThinking = message.thinking;

  const textContent = message.content;

  const showTypingIndicator = isLastLoading && !isUser && textContent === "";
  const isThinking =
    isLastLoading && !isUser && textContent === "" && textThinking !== "";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3 mt-1">
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
                <ChevronRightIcon size={14} />
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
        {showTypingIndicator ? (
          <div className="flex gap-1 items-center h-5">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              table({ node, ...props }) {
                return (
                  <div className="overflow-x-auto my-2 overflow-hidden border border-gray-200 rounded-xl">
                    <table
                      {...props}
                      className="w-full  border-collapse divide-y divide-gray-200 [&>tbody]:divide-y [&>tbody]:divide-gray-100 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_th]:bg-gray-50 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm"
                    />
                  </div>
                );
              },
            }}
          >
            {textContent}
          </Markdown>
        )}
      </div>
      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-3 mt-1">
          <span className="text-gray-700 text-xs font-bold">Tú</span>
        </div>
      )}
    </div>
  );
}
