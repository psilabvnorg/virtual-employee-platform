import { Search, Bell } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function TopBar() {
  const { selectedMenuPath } = useAppStore();
  const path = selectedMenuPath ?? ["Department"];

  return (
    <div className="h-12 shrink-0 flex items-center justify-between px-5 border-b border-black/10 bg-bg/80 backdrop-blur">
      <div className="flex items-center gap-3 text-[12px] font-mono text-black/60">
        {path.map((segment, i) => (
          <span key={i} className="flex items-center gap-2">
            <span
              className={
                i === path.length - 1
                  ? "text-black tracking-tight"
                  : "tracking-tight"
              }
            >
              {segment}
            </span>
            {i < path.length - 1 && <span className="text-black/30">/</span>}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/5 text-[12px] text-black/60 w-72">
          <Search size={13} />
          <input
            placeholder="Search PSI, employees, integrations…"
            className="bg-transparent outline-none flex-1 placeholder:text-black/40 text-black"
          />
          <span className="text-[10px] font-mono text-black/40 px-1 py-0.5 border border-black/15 rounded">
            ⌘K
          </span>
        </div>
        <button className="p-1.5 rounded-md hover:bg-black/5 text-black/60">
          <Bell size={15} />
        </button>
        <div className="flex items-center gap-2 text-[11px] font-mono text-black/60">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
          PSI · LIVE
        </div>
      </div>
    </div>
  );
}
