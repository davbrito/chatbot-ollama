import {
  PlusIcon,
  Trash2Icon,
  Edit2Icon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useChatStore } from "../store/chatStore";

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
    <aside className="w-72 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <button
          type="button"
          onClick={handleCreateSession}
          disabled={!activeModel}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Nuevo chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sortedSessions.map((session) => (
          <div
            key={session.id}
            className={`w-full rounded-lg border text-sm transition-colors flex items-center group ${
              session.id === activeSessionId
                ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                : "text-gray-700 hover:bg-gray-100 border-transparent"
            }`}
          >
            {editingSessionId === session.id ? (
              <div className="flex-1 flex items-center px-2 py-1 gap-1">
                <input
                  type="text"
                  autoFocus
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEditing(session.id);
                    if (e.key === "Escape") cancelEditing();
                  }}
                  className="flex-1 w-full bg-white border border-indigo-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={() => saveEditing(session.id)}
                  className="p-1 text-green-600 hover:text-green-700"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelEditing}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSession(session.id)}
                  className="flex-1 text-left px-3 py-2 min-w-0"
                >
                  <span className="block truncate">
                    {session.title || "Nuevo chat"}
                  </span>
                </button>
                <div className="flex flex-row opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => startEditing(session.id, session.title)}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    aria-label="Renombrar chat"
                    title="Renombrar"
                  >
                    <Edit2Icon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSession(session.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Eliminar chat"
                    title="Eliminar chat"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
