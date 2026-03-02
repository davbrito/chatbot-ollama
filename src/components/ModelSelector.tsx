import { useChatStore } from '../store/chatStore';

export function ModelSelector() {
  const { model, models, setModel } = useChatStore();

  if (models.length === 0) return null;

  return (
    <select
      value={model}
      onChange={(e) => setModel(e.target.value)}
      className="text-sm rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    >
      {models.map((m) => (
        <option key={m.name} value={m.name}>
          {m.name}
        </option>
      ))}
    </select>
  );
}
