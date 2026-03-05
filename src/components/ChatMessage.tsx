import "katex/dist/katex.min.css";

import {
  ChevronRightIcon,
  LoaderCircleIcon,
  StopCircleIcon,
  Volume2Icon,
} from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import {
  sanitizeForSpeech,
  speak,
  isSpeaking as ttsIsSpeaking,
  stop as ttsStop,
} from "../lib/tts";
import type { CustomMessage } from "../store/chatStore";
import { Button } from "./ui/button";

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

  const timeString = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const [isSpeaking, setIsSpeaking] = useState(false);

  async function toggleSpeak() {
    if (ttsIsSpeaking()) {
      ttsStop();
      setIsSpeaking(false);
      return;
    }

    const text = sanitizeForSpeech(message.content || "");
    if (!text) return;

    try {
      setIsSpeaking(true);
      await speak(text);
    } catch (e) {
      console.error("TTS error:", e);
    } finally {
      setIsSpeaking(false);
    }
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="mt-1 mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600">
          <span className="text-xs font-bold text-white">AI</span>
        </div>
      )}
      <div
        className={`max-w-full rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "rounded-tr-sm bg-indigo-600 text-white"
            : "rounded-tl-sm border border-gray-100 bg-white text-gray-800"
        }`}
      >
        {!isUser && textThinking && (
          <div className="mb-2">
            <button
              onClick={() => setThinkingOpen((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-indigo-500 transition-colors hover:text-indigo-700"
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
              {isLastLoading && (
                <LoaderCircleIcon size={12} className={`animate-spin`} />
              )}
            </button>
            {thinkingOpen && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap text-gray-500 italic">
                {textThinking}
              </div>
            )}
          </div>
        )}
        {showTypingIndicator ? (
          <div className="flex h-5 items-center gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
          </div>
        ) : isUser ? (
          textContent
        ) : (
          <div className="prose prose-sm max-w-none">
            <Markdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeHighlight, rehypeKatex]}
              components={{
                table({ node, ...props }) {
                  return (
                    <div className="my-2 overflow-hidden overflow-x-auto rounded-xl border border-gray-200">
                      <table
                        {...props}
                        className="m-0! w-full border-collapse divide-y divide-gray-200 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_th]:bg-gray-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&>tbody]:divide-y [&>tbody]:divide-gray-100"
                      />
                    </div>
                  );
                },
              }}
            >
              {textContent}
            </Markdown>
          </div>
        )}
        {timeString && (
          <div className="mt-1 flex items-center gap-2">
            <div
              className={`text-[11px] ${
                isUser
                  ? "text-right text-indigo-100"
                  : "text-left text-gray-400"
              }`}
            >
              {timeString}
            </div>
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={toggleSpeak}
              aria-label={isSpeaking ? "Detener lectura" : "Leer en voz alta"}
            >
              {isSpeaking ? (
                <StopCircleIcon className={"animate-pulse"} />
              ) : (
                <Volume2Icon className={isSpeaking ? "animate-pulse" : ""} />
              )}
            </Button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="mt-1 ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300">
          <span className="text-xs font-bold text-gray-700">Tú</span>
        </div>
      )}
    </div>
  );
}
