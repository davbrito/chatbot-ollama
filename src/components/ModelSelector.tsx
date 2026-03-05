import { useChatStore } from "../store/chatStore";

export function ModelSelector() {
  const { models, sessions, activeSessionId, setActiveSessionModel } =
    useChatStore();
  const activeSession = sessions.find(
    (session) => session.id === activeSessionId,
  );
  const model = activeSession?.model ?? "";

  if (models.length === 0) return null;

  return (
    <select
      value={model}
      onChange={(e) => setActiveSessionModel(e.target.value)}
      disabled={!activeSessionId}
      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
    >
      {models
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .map((m) => (
          <option key={m.name} value={m.name}>
            {m.name}
          </option>
        ))}
    </select>
  );
}
