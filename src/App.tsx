import { useEffect, useMemo, useRef } from 'react';
import { useChat } from '@tanstack/ai-react';
import { useModelStore } from './store/chatStore';
import { createOllamaConnection } from './lib/ollama';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';

function ChatContainer({ model }: { model: string }) {
  const connection = useMemo(() => createOllamaConnection(model), [model]);
  const { messages, sendMessage, stop, isLoading, error, clear } = useChat({ connection });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastMessage = messages.at(-1);
  const lastIsAssistantLoading =
    isLoading && lastMessage?.role === 'assistant';

  return (
    <>
      <ChatHeader hasMessages={messages.length > 0} onClear={clear} />

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <strong>Error:</strong> {error instanceof Error ? error.message : String(error)}
            </div>
          )}

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
              <p className="text-sm font-medium">Start a conversation</p>
              <p className="text-xs mt-1">Type a message below to chat with {model}</p>
            </div>
          )}

          {messages.map((message, idx) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLastLoading={lastIsAssistantLoading && idx === messages.length - 1}
            />
          ))}

          <div ref={bottomRef} />
        </div>
      </main>

      <ChatInput model={model} isLoading={isLoading} onSend={sendMessage} onStop={stop} />
    </>
  );
}

export default function App() {
  const { model, models, fetchModels, error: modelsError } = useModelStore();

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {modelsError && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm text-center">
          <strong>Error:</strong> {modelsError}
        </div>
      )}

      {models.length === 0 && !modelsError ? (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3 animate-spin">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <p className="text-sm">Connecting to Ollama...</p>
        </div>
      ) : model ? (
        <ChatContainer key={model} model={model} />
      ) : null}
    </div>
  );
}
