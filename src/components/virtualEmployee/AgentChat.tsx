import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { API_BASE } from "../../data/virtualEmployees";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AgentChat({ employeeId }: { employeeId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your accounting assistant. Ask me about invoices, contracts, payments, or any accounting questions based on approved records.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/employees/${employeeId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json() as { reply: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't reach the Ollama service. Make sure it's running." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[420px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 thin-scroll-dark">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-[12px] leading-relaxed ${
                m.role === "user"
                  ? "bg-black text-white"
                  : "bg-black/5 text-black/80 border border-black/10"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-black/5 border border-black/10 rounded-lg px-3 py-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-black/30 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2 border-t border-black/10 pt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about invoices, payments, tax..."
          className="flex-1 bg-black/5 border border-black/10 rounded-md px-3 py-2 text-[12px] outline-none focus:border-black/30 placeholder:text-black/30"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="p-2 rounded-md bg-black text-white hover:bg-black/80 disabled:opacity-40 transition-opacity"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
