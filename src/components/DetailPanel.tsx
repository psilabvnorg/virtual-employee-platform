import { X, Users, Activity, ArrowUpRight, Layers } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { DEPARTMENT_BY_ID } from "../data/departments";
import { VIRTUAL_EMPLOYEE_LABEL_TO_ID } from "../data/virtualEmployees";
import VirtualEmployeePanel from "./virtualEmployee/VirtualEmployeePanel";

export default function DetailPanel() {
  const {
    panelOpen,
    selectedMenuPath,
    selectedDepartmentId,
    closePanel,
    setDepartmentSelection,
  } = useAppStore();

  if (!panelOpen) return null;

  const dept =
    selectedDepartmentId != null ? DEPARTMENT_BY_ID[selectedDepartmentId] : null;

  const isVirtualEmployee = selectedMenuPath?.[0] === "Virtual Employees" && selectedMenuPath?.[1];
  const virtualEmployeeId = isVirtualEmployee
    ? VIRTUAL_EMPLOYEE_LABEL_TO_ID[selectedMenuPath![1]]
    : null;

  if (virtualEmployeeId) {
    return (
      <div className="w-[380px] shrink-0 border-l border-black/10 bg-white flex flex-col overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-black/10 flex items-start justify-between shrink-0">
          <div className="text-lg font-semibold tracking-tight">
            {selectedMenuPath![1]}
          </div>
          <button onClick={closePanel} className="p-1.5 rounded-md hover:bg-black/5 text-black/50">
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <VirtualEmployeePanel employeeId={virtualEmployeeId} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-[380px] shrink-0 border-l border-black/10 bg-white flex flex-col thin-scroll-dark overflow-y-auto">
      <div className="px-5 pt-5 pb-3 border-b border-black/10 flex items-start justify-between">
        <div>
          <div className="text-[10px] tracking-[0.22em] font-mono text-black/40">
            {dept ? "DEPARTMENT" : (selectedMenuPath?.[0] ?? "ITEM").toUpperCase()}
          </div>
          <div className="text-lg font-semibold tracking-tight mt-0.5">
            {dept?.name ?? selectedMenuPath?.[selectedMenuPath.length - 1] ?? "—"}
          </div>
          {dept && (
            <div className="text-[11px] font-mono text-black/50 mt-1 flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-black/5 rounded">{dept.shortLabel}</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {dept.active}/{dept.headcount} active
              </span>
            </div>
          )}
        </div>
        <button
          onClick={closePanel}
          className="p-1.5 rounded-md hover:bg-black/5 text-black/50"
        >
          <X size={15} />
        </button>
      </div>

      {dept ? (
        <div className="px-5 py-4 space-y-5">
          <p className="text-[13px] text-black/70 leading-relaxed">
            {dept.description}
          </p>

          <div className="grid grid-cols-3 gap-2">
            <Stat label="Headcount" value={dept.headcount} icon={<Users size={12} />} />
            <Stat
              label="Utilization"
              value={`${Math.round((dept.active / dept.headcount) * 100)}%`}
              icon={<Activity size={12} />}
            />
            <Stat
              label="Tasks/24h"
              value={dept.headcount * 27}
              icon={<Layers size={12} />}
            />
          </div>

          <div>
            <SectionHeader>Roles</SectionHeader>
            <ul className="mt-2 divide-y divide-black/5">
              {dept.roles.map((r) => (
                <li
                  key={r.title}
                  className="flex items-center justify-between py-2 text-[13px]"
                >
                  <span className="tracking-tight">{r.title}</span>
                  <span className="font-mono text-[11px] text-black/50 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-black/5 rounded">{r.level}</span>
                    <span className="text-black">{r.count}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeader>Relationships</SectionHeader>
            <ul className="mt-2 space-y-1">
              {dept.relations.map((rel) => {
                const target = DEPARTMENT_BY_ID[rel.to];
                return (
                  <li key={rel.to}>
                    <button
                      onClick={() => setDepartmentSelection(rel.to)}
                      className="w-full flex items-center justify-between py-1.5 px-2 rounded hover:bg-black/5 text-[13px] group"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/15 text-emerald-700">
                          {rel.verb}
                        </span>
                        <span>{target.name}</span>
                      </span>
                      <ArrowUpRight
                        size={13}
                        className="text-black/30 group-hover:text-accent transition-colors"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <SectionHeader>Activity</SectionHeader>
            <div className="mt-2 h-16 flex items-end gap-1">
              {Array.from({ length: 28 }).map((_, i) => {
                const h =
                  18 +
                  Math.round(
                    Math.abs(Math.sin(i * 0.7 + dept.headcount)) * 38
                  );
                return (
                  <div
                    key={i}
                    className="flex-1 bg-black/70 rounded-sm"
                    style={{ height: `${h}px` }}
                  />
                );
              })}
            </div>
            <div className="text-[10px] font-mono text-black/40 mt-1">
              TASKS · LAST 28 HOURS
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 py-4 space-y-3">
          <p className="text-[13px] text-black/70 leading-relaxed">
            This is a placeholder for{" "}
            <span className="font-medium">
              {selectedMenuPath?.join(" / ") ?? "the selected item"}
            </span>
            . Hook this view up to your live data source to render real
            content here.
          </p>
          <div className="border border-dashed border-black/15 rounded-md p-4 text-[12px] font-mono text-black/50">
            <div className="flex items-center justify-between mb-2">
              <span>STATUS</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                READY
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>BACKEND</span>
              <span>not connected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] tracking-[0.22em] font-mono text-black/40 border-b border-black/10 pb-1.5">
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="border border-black/10 rounded-md p-2.5">
      <div className="text-[9px] font-mono tracking-[0.18em] text-black/40 flex items-center gap-1">
        {icon}
        {label.toUpperCase()}
      </div>
      <div className="text-base font-semibold tracking-tight mt-1">{value}</div>
    </div>
  );
}
