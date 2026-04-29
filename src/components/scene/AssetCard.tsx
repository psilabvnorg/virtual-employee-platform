import { Html } from "@react-three/drei";
import { useAppStore } from "../../store/useAppStore";
import { DEPARTMENT_BY_ID } from "../../data/departments";

export default function AssetCard() {
  const { selectedDepartmentId } = useAppStore();
  const dept =
    selectedDepartmentId != null ? DEPARTMENT_BY_ID[selectedDepartmentId] : null;

  // Anchor the card just above the ontology plate, on the left side.
  return (
    <Html
      position={[-7.0, 1.2, -1.6]}
      distanceFactor={9}
      style={{ pointerEvents: "none" }}
    >
      <div className="bg-white border border-black/20 shadow-sm w-[150px] text-black/80">
        <div className="flex items-center justify-between px-2 py-1 border-b border-black/15">
          <span className="text-[9px] font-mono tracking-[0.2em] text-black/55">
            EMPLOYEE
          </span>
          <span className="text-[10px] font-mono">№ 731</span>
        </div>
        <div className="px-2 py-1.5 space-y-1">
          <Row k="Role" v={dept ? dept.shortLabel : "Engineer"} />
          <Row k="Region" v="JP-14" />
          <Row k="Location" v="35.4142700°" />
          <div className="flex items-center justify-between pt-1 border-t border-black/10 mt-1">
            <span className="text-[9px] font-mono text-black/50 tracking-wider">
              Health Score
            </span>
            <span className="flex items-center gap-1 text-[14px] font-semibold">
              89
              <svg width="12" height="11" viewBox="0 0 12 11" fill="none">
                <path
                  d="M6 10 L1.5 5.8 C-0.2 4 1.2 1 3.6 1.6 L6 3 L8.4 1.6 C10.8 1 12.2 4 10.5 5.8 Z"
                  stroke="#e11d48"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Html>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between text-[10px]">
      <span className="font-mono text-black/50">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}
