import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { API_BASE } from "../../data/virtualEmployees";

interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  standard: string;
  content: string;
}

export default function PromptEditor({ employeeId }: { employeeId: string }) {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/employees/${employeeId}/prompts`)
      .then((r) => r.json())
      .then((data: PromptTemplate[]) => {
        setPrompts(data);
        if (data.length > 0) {
          setSelected(data[0].name);
          setContent(data[0].content);
        }
      })
      .catch(() => {});
  }, [employeeId]);

  const onSelect = (name: string) => {
    const p = prompts.find((p) => p.name === name);
    if (p) { setSelected(name); setContent(p.content); setSaved(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/employees/${employeeId}/prompts/${selected}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      setPrompts((prev) =>
        prev.map((p) => (p.name === selected ? { ...p, content } : p))
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const current = prompts.find((p) => p.name === selected);

  return (
    <div className="space-y-3">
      {/* Prompt selector */}
      <div className="flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className="flex-1 bg-black/5 border border-black/10 rounded-md px-2.5 py-1.5 text-[12px] font-mono outline-none focus:border-black/30"
        >
          {prompts.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
        {current && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black/5 rounded text-black/50">
            {current.standard}
          </span>
        )}
      </div>

      {/* Prompt textarea */}
      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setSaved(false); }}
        rows={14}
        className="w-full bg-black/[0.02] border border-black/10 rounded-md px-3 py-2.5 text-[11px] font-mono leading-relaxed outline-none focus:border-black/30 resize-none thin-scroll-dark"
        placeholder="Paste your accounting standard rules or prompt here..."
      />

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-black/40 font-mono">
          Paste VAS / IFRS / GAAP rules here to guide extraction
        </p>
        <button
          onClick={save}
          disabled={saving || !selected}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black text-white text-[11px] font-mono hover:bg-black/80 disabled:opacity-40 transition"
        >
          <Save size={12} />
          {saving ? "SAVING..." : saved ? "SAVED ✓" : "SAVE"}
        </button>
      </div>
    </div>
  );
}
