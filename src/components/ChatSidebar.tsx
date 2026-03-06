import {
  CheckIcon,
  Edit2Icon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useChatStore } from "../store/chatStore";
import useConfigStore from "../store/configStore";
import { Button } from "./ui/button";

export function ChatSidebar() {
  const sessionOrder = useChatStore((state) => state.sessionOrder);
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const createSession = useChatStore((state) => state.createSession);
  const deleteSession = useChatStore((state) => state.deleteSession);
  const setActiveSession = useChatStore((state) => state.setActiveSession);
  const setSessionTitle = useChatStore((state) => state.setSessionTitle);

  const defaultModel = useConfigStore((s) => s.getDefaultModel());

  const handleCreateSession = () => {
    if (!defaultModel) return;
    createSession(defaultModel);
  };

  return (
    <aside className="flex w-72 flex-col border-r border-gray-200 bg-white">
      <div className="flex flex-col border-b border-gray-200 p-3">
        <Button
          type="button"
          onClick={handleCreateSession}
          disabled={!defaultModel}
          size="lg"
        >
          <PlusIcon className="h-4 w-4" />
          Nuevo chat
        </Button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {sessionOrder.map((sessionId) => {
          return (
            <SessionItem
              key={sessionId}
              id={sessionId}
              isActive={sessionId === activeSessionId}
              onDelete={() => deleteSession(sessionId)}
              onSelect={() => setActiveSession(sessionId)}
              onUpdateTitle={(title) => setSessionTitle(sessionId, title)}
            />
          );
        })}
      </div>
    </aside>
  );
}

function SessionItem({
  id,
  isActive,
  onDelete,
  onSelect,
  onUpdateTitle,
}: {
  id: string;
  isActive: boolean;
  onDelete: () => void;
  onSelect: () => void;
  onUpdateTitle: (title: string) => void;
}) {
  const [editTitleValue, setEditTitleValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const title = useChatStore((state) => state.sessionsById[id]?.title);

  const handleSave = () => {
    onUpdateTitle(editTitleValue);
    cancelEditing();
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditTitleValue("");
  };

  return (
    <div
      className={`group flex w-full items-center rounded-lg border text-sm transition-colors ${
        isActive
          ? "border-indigo-100 bg-indigo-50 text-indigo-700"
          : "border-transparent text-gray-700 hover:bg-gray-100"
      }`}
    >
      {isEditing ? (
        <div className="flex flex-1 items-center gap-1 px-2 py-1">
          <input
            type="text"
            autoFocus
            value={editTitleValue}
            onChange={(e) => setEditTitleValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") cancelEditing();
            }}
            className="w-full flex-1 rounded border border-indigo-300 bg-white px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
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
            onClick={onSelect}
            className="min-w-0 flex-1 px-3 py-2 text-left"
          >
            <span className="block truncate">{title || "Nuevo chat"}</span>
          </button>
          <div className="flex flex-row opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button
              size="icon"
              variant="ghost"
              type="button"
              onClick={() => {
                setIsEditing(true);
                setEditTitleValue(title);
              }}
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
              onClick={onDelete}
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
  );
}
