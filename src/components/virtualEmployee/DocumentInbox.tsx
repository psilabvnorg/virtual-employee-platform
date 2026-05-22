import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { API_BASE } from "../../data/virtualEmployees";

interface JournalLine {
  account: string;
  debit: number;
  credit: number;
  description?: string;
}

interface EmployeeRecord {
  id: string;
  fileId: string;
  driveUrl: string;
  category: string;
  normalizedJson: Record<string, unknown>;
  suggestions: JournalLine[];
  confidence: number;
  status: "pending" | "approved" | "rejected";
  reviewNote?: string;
  createdAt: string;
}

export default function DocumentInbox({ employeeId }: { employeeId: string }) {
  const [records, setRecords] = useState<EmployeeRecord[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const url = filter === "all"
        ? `${API_BASE}/employees/${employeeId}/records`
        : `${API_BASE}/employees/${employeeId}/records?status=${filter}`;
      const res = await fetch(url);
      setRecords(await res.json());
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [employeeId, filter]);

  const act = async (id: string, action: "approve" | "reject") => {
    await fetch(`${API_BASE}/employees/${employeeId}/records/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    fetchRecords();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-emerald-100 text-emerald-700",
      rejected: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${map[s] ?? "bg-black/5"}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex gap-2">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono tracking-wide transition-colors ${
              filter === f ? "bg-black text-white" : "bg-black/5 hover:bg-black/10 text-black/60"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
        <button
          onClick={fetchRecords}
          className="ml-auto px-2.5 py-1 rounded text-[11px] font-mono bg-black/5 hover:bg-black/10 text-black/60"
        >
          REFRESH
        </button>
      </div>

      {loading && (
        <div className="text-[12px] font-mono text-black/40 py-4 text-center">Loading...</div>
      )}

      {!loading && records.length === 0 && (
        <div className="border border-dashed border-black/15 rounded-md p-6 text-center">
          <div className="text-[11px] font-mono text-black/40">NO RECORDS FOUND</div>
          <div className="text-[12px] text-black/50 mt-1">
            Upload documents to start processing
          </div>
        </div>
      )}

      {records.map((r) => (
        <div key={r.id} className="border border-black/10 rounded-md overflow-hidden">
          {/* Row header */}
          <div className="flex items-center gap-3 px-3 py-2.5 bg-white">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-1.5 py-0.5 bg-black/5 rounded uppercase">
                  {r.category}
                </span>
                {statusBadge(r.status)}
                <span className="text-[10px] font-mono text-black/30">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-[12px] text-black/70 mt-1 truncate">
                {(r.normalizedJson?.vendor as string) ||
                  (r.normalizedJson?.contractNumber as string) ||
                  (r.normalizedJson?.employeeName as string) ||
                  r.fileId}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {r.status === "pending" && (
                <>
                  <button
                    onClick={() => act(r.id, "approve")}
                    className="p-1 rounded hover:bg-emerald-50 text-emerald-600"
                    title="Approve"
                  >
                    <CheckCircle size={15} />
                  </button>
                  <button
                    onClick={() => act(r.id, "reject")}
                    className="p-1 rounded hover:bg-red-50 text-red-500"
                    title="Reject"
                  >
                    <XCircle size={15} />
                  </button>
                </>
              )}
              <button
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="p-1 rounded hover:bg-black/5 text-black/40"
              >
                {expanded === r.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {/* Expanded detail */}
          {expanded === r.id && (
            <div className="border-t border-black/8 bg-black/[0.02] px-3 py-3 space-y-3">
              {/* Extracted fields */}
              <div>
                <div className="text-[10px] font-mono tracking-[0.18em] text-black/40 mb-1.5">
                  EXTRACTED DATA
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(r.normalizedJson).map(([k, v]) =>
                    typeof v !== "object" ? (
                      <div key={k} className="flex gap-1.5 text-[11px]">
                        <span className="text-black/40 font-mono shrink-0">{k}:</span>
                        <span className="text-black/80 truncate">{String(v)}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              {/* Journal suggestions */}
              {r.suggestions.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono tracking-[0.18em] text-black/40 mb-1.5">
                    JOURNAL ENTRY SUGGESTION
                  </div>
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-black/40 font-mono">
                        <th className="text-left pb-1">Account</th>
                        <th className="text-right pb-1">Debit</th>
                        <th className="text-right pb-1">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.suggestions.map((line, i) => (
                        <tr key={i} className="border-t border-black/5">
                          <td className="py-1 text-black/70">{line.account}</td>
                          <td className="py-1 text-right font-mono">
                            {line.debit ? line.debit.toLocaleString() : "—"}
                          </td>
                          <td className="py-1 text-right font-mono">
                            {line.credit ? line.credit.toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Source link */}
              {r.driveUrl && (
                <a
                  href={r.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-accent underline hover:opacity-70"
                >
                  View source document ↗
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
