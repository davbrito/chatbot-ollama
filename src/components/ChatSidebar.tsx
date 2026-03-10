import {
  CheckIcon,
  Edit2Icon,
  PlusIcon,
  SettingsIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useChatStore } from "../store/chatStore";
import { SettingsDialog } from "./SettingsDialog";
import { Button } from "./ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

export function ChatSidebar() {
  const sessionOrder = useChatStore((state) => state.sessionOrder);
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const deleteSession = useChatStore((state) => state.deleteSession);
  const setActiveSession = useChatStore((state) => state.setActiveSession);
  const setSessionTitle = useChatStore((state) => state.setSessionTitle);

  const handleCreateSession = () => {
    setActiveSession(null);
  };
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col border-b border-amber-200/15 p-3">
        <p className="cinema-title hidden text-[10px] tracking-[0.3em] text-amber-100/70 uppercase md:block">
          Archivo
        </p>
        <Button
          type="button"
          onClick={handleCreateSession}
          size="lg"
          className="justify-center md:justify-start"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="hidden md:inline">Nuevo chat</span>
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="gap-2 p-2">
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
        </SidebarMenu>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SettingsDialog
                  trigger={
                    <SidebarMenuButton>
                      <SettingsIcon /> Configuración
                    </SidebarMenuButton>
                  }
                ></SettingsDialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
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
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        className={`group flex border pr-0.5 transition-colors ${
          isActive
            ? "border-amber-300/40 text-amber-50"
            : "border-transparent text-amber-100/75 hover:bg-amber-200/10"
        }`}
      >
        {isEditing ? (
          <>
            <input
              type="text"
              autoFocus
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") cancelEditing();
              }}
              className="w-0 flex-1 rounded border border-amber-300/40 bg-zinc-950/80 px-2 py-0.5 text-amber-50 focus:ring-1 focus:ring-amber-300 focus:outline-none"
            />

            <div className="flex flex-row">
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
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onSelect}
              className="min-w-0 flex-1 px-3 py-2 text-left"
            >
              <span className="truncate text-[11px] tracking-[0.14em]">
                {title || "Nuevo chat"}
              </span>
            </button>

            <div className="flex flex-row transition-opacity group-hover:opacity-100 focus-within:opacity-100 md:opacity-0">
              <Button
                size="icon"
                variant="ghost"
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setEditTitleValue(title);
                }}
                className="text-amber-100/40 hover:text-amber-100"
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
                className="hover:text-destructive text-amber-100/40"
                aria-label="Eliminar chat"
                title="Eliminar chat"
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
