import {
  PlusIcon,
  Trash2Icon,
  Edit2Icon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useChatStore } from "../store/chatStore";
import { Button } from "./ui/button";

export function ChatSidebar() {
  const {
    sessions,
    activeSessionId,
    createSession,
    deleteSession,
    setActiveSession,
    setSessionTitle,
    models,
  } = useChatStore();

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId,
  );
  const activeModel = activeSession?.model ?? models[0]?.name ?? "";

  const sortedSessions = [...sessions].sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  const handleCreateSession = () => {
    if (!activeModel) return;
    createSession(activeModel);
  };

  const startEditing = (id: string, currentTitle: string) => {
    setEditingSessionId(id);
    setEditTitleValue(currentTitle || "Nuevo chat");
  };

  const saveEditing = (id: string) => {
    setSessionTitle(id, editTitleValue);
    setEditingSessionId(null);
  };

  const cancelEditing = () => {
    setEditingSessionId(null);
    setEditTitleValue("");
  };

  return (
    <aside className="flex w-72 flex-col border-r border-gray-200 bg-white">
      <div className="flex flex-col border-b border-gray-200 p-3">
        <Button
          type="button"
          onClick={handleCreateSession}
          disabled={!activeModel}
          size="lg"
        >
          <PlusIcon className="h-4 w-4" />
          Nuevo chat
        </Button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {sortedSessions.map((session) => (
          <div
            key={session.id}
            className={`group flex w-full items-center rounded-lg border text-sm transition-colors ${
              session.id === activeSessionId
                ? "border-indigo-100 bg-indigo-50 text-indigo-700"
                : "border-transparent text-gray-700 hover:bg-gray-100"
            }`}
          >
            {editingSessionId === session.id ? (
              <div className="flex flex-1 items-center gap-1 px-2 py-1">
                <input
                  type="text"
                  autoFocus
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEditing(session.id);
                    if (e.key === "Escape") cancelEditing();
                  }}
                  className="w-full flex-1 rounded border border-indigo-300 bg-white px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => saveEditing(session.id)}
                  className="text-green-600 hover:bg-green-600/10 hover:text-green-600"
                >
                  <CheckIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={cancelEditing}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive/80"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSession(session.id)}
                  className="min-w-0 flex-1 px-3 py-2 text-left"
                >
                  <span className="block truncate">
                    {session.title || "Nuevo chat"}
                  </span>
                </button>
                <div className="flex flex-row opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => startEditing(session.id, session.title)}
                    className="hover:text-accent text-gray-400"
                    aria-label="Renombrar chat"
                    title="Renombrar"
                  >
                    <Edit2Icon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => deleteSession(session.id)}
                    className="hover:text-destructive text-gray-400"
                    aria-label="Eliminar chat"
                    title="Eliminar chat"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
