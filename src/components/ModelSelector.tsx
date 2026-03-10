import { useChatStore } from "../store/chatStore";
import useConfigStore from "../store/configStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function ModelSelector({ model }: { model: string }) {
  const models = useChatStore((state) => state.models);
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const setActiveSessionModel = useChatStore(
    (state) => state.setActiveSessionModel,
  );
  const setDefaultModel = useConfigStore((s) => s.setDefaultModel);

  if (models.length === 0) return null;

  return (
    <Select
      value={model}
      onValueChange={(value) => {
        if (!value) return;
        setActiveSessionModel(value);
        setDefaultModel(value);
      }}
      disabled={!activeSessionId}
    >
      <SelectTrigger className="min-w-40 border border-amber-100/20 bg-black/35 text-amber-100 backdrop-blur-sm hover:bg-black/50">
        <SelectValue placeholder="Selecciona un modelo" />
      </SelectTrigger>
      <SelectContent className="overflow-auto">
        {models.map((m) => (
          <SelectItem key={m.name} value={m.name}>
            {m.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
