import { useState } from "react";
import { Bot, Inbox, MessageSquare, FileText } from "lucide-react";
import DocumentInbox from "./DocumentInbox";
import AgentChat from "./AgentChat";
import PromptEditor from "./PromptEditor";
import { VIRTUAL_EMPLOYEES } from "../../data/virtualEmployees";

type Tab = "inbox" | "chat" | "prompts";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "inbox", label: "Inbox", icon: <Inbox size={12} /> },
  { id: "chat", label: "Chat", icon: <MessageSquare size={12} /> },
  { id: "prompts", label: "Prompts", icon: <FileText size={12} /> },
];

export default function VirtualEmployeePanel({ employeeId }: { employeeId: string }) {
  const [tab, setTab] = useState<Tab>("inbox");
  const employee = VIRTUAL_EMPLOYEES.find((e) => e.id === employeeId);

  if (!employee) {
    return (
      <div className="px-5 py-4 text-[13px] text-black/50">
        Unknown virtual employee: {employeeId}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Employee info */}
      <div className="px-5 py-4 border-b border-black/10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center">
            <Bot size={14} className="text-accent" />
          </div>
          <div className="text-[10px] font-mono tracking-[0.18em] text-black/40">
            AI EMPLOYEE · {employee.id.toUpperCase()}
          </div>
        </div>
        <p className="text-[11px] text-black/50 leading-relaxed mt-1">
          {employee.description}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-black/10 px-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-mono tracking-wide border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? "border-black text-black"
                : "border-transparent text-black/40 hover:text-black/60"
            }`}
          >
            {t.icon}
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 thin-scroll-dark">
        {tab === "inbox" && <DocumentInbox employeeId={employeeId} />}
        {tab === "chat" && <AgentChat employeeId={employeeId} />}
        {tab === "prompts" && <PromptEditor employeeId={employeeId} />}
      </div>
    </div>
  );
}
