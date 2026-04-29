import { useState } from "react";
import {
  Activity,
  Building2,
  ChevronRight,
  Plug,
  Settings,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { MENU } from "../data/menu";
import { useAppStore } from "../store/useAppStore";

const ICONS: Record<string, LucideIcon> = {
  Building2,
  UserCircle,
  Plug,
  Settings,
  Activity,
};

export default function Sidebar() {
  const { selectedMenuPath, setMenuSelection } = useAppStore();
  const [open, setOpen] = useState<Record<string, boolean>>({
    Department: true,
    "Employee Profile": false,
    Integration: false,
  });

  return (
    <aside className="w-64 shrink-0 bg-ink text-white/90 flex flex-col border-r border-black/40 thin-scroll overflow-y-auto">
      <div className="px-4 pt-5 pb-4 border-b border-white/5">
        <div className="text-[10px] tracking-[0.22em] text-white/40 font-mono">
          PLATFORM
        </div>
        <div className="text-base font-semibold tracking-tight mt-1">
          Virtual Employees
        </div>
        <div className="text-[11px] text-white/40 mt-0.5 font-mono">
          v0.1 · placeholder
        </div>
      </div>

      <nav className="flex-1 py-2">
        {MENU.map((section) => {
          const Icon = ICONS[section.icon] ?? Building2;
          const isOpen = open[section.label] ?? false;
          const hasChildren = !!section.children?.length;
          const isSectionSelected =
            selectedMenuPath?.[0] === section.label && !selectedMenuPath?.[1];

          return (
            <div key={section.label} className="px-2">
              <button
                onClick={() => {
                  if (hasChildren) {
                    setOpen((s) => ({ ...s, [section.label]: !isOpen }));
                  } else {
                    setMenuSelection([section.label]);
                  }
                }}
                className={`w-full group flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] tracking-tight transition-colors ${
                  isSectionSelected
                    ? "bg-white/5 text-white"
                    : "text-white/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={15} className="text-white/60 group-hover:text-accent transition-colors" />
                <span className="flex-1 text-left">{section.label}</span>
                {hasChildren && (
                  <ChevronRight
                    size={14}
                    className={`text-white/40 transition-transform ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  />
                )}
              </button>

              {hasChildren && isOpen && (
                <ul className="ml-3 my-1 border-l border-white/10">
                  {section.children!.map((leaf) => {
                    const selected =
                      selectedMenuPath?.[0] === section.label &&
                      selectedMenuPath?.[1] === leaf.label;
                    return (
                      <li key={leaf.label}>
                        <button
                          onClick={() =>
                            setMenuSelection([section.label, leaf.label])
                          }
                          className={`w-full flex items-center gap-2 pl-4 pr-2 py-1.5 text-[12.5px] tracking-tight transition-colors relative ${
                            selected
                              ? "text-white"
                              : "text-white/55 hover:text-white"
                          }`}
                        >
                          {selected && (
                            <span className="absolute left-[-1px] top-1.5 bottom-1.5 w-[2px] bg-accent rounded-r" />
                          )}
                          <span
                            className={`w-1 h-1 rounded-full ${
                              selected ? "bg-accent" : "bg-white/20"
                            }`}
                          />
                          <span>{leaf.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-white/5 text-[11px] font-mono text-white/40 flex items-center justify-between">
        <span>OPERATOR</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          j.simmons
        </span>
      </div>
    </aside>
  );
}
