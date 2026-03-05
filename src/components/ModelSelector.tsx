import { useChatStore } from "../store/chatStore";
import useConfigStore from "../store/configStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function ModelSelector() {
  const { models, sessions, activeSessionId, setActiveSessionModel } =
    useChatStore();
  const setDefaultModel = useConfigStore((s) => s.setDefaultModel);
  const activeSession = sessions.find(
    (session) => session.id === activeSessionId,
  );
  const model = activeSession?.model ?? "";

  if (models.length === 0) return null;

  return (
    <Select
      value={model}
      onValueChange={(value) => {
        setActiveSessionModel(value!);
        setDefaultModel(value!);
      }}
      disabled={!activeSessionId}
    >
      <SelectTrigger className="min-w-40 border-none bg-transparent">
        <SelectValue placeholder="Selecciona un modelo" />
      </SelectTrigger>
      <SelectContent>
        {models
          .toSorted((a, b) => a.name.localeCompare(b.name))
          .map((m) => (
            <SelectItem key={m.name} value={m.name}>
              {m.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
