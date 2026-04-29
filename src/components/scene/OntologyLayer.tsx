import { useMemo } from "react";
import { Html, Line } from "@react-three/drei";
import Platform from "./Platform";
import DepartmentNode from "./DepartmentNode";
import AssetCard from "./AssetCard";
import { DEPARTMENTS, DEPARTMENT_BY_ID } from "../../data/departments";
import { useAppStore } from "../../store/useAppStore";
import type { DepartmentId } from "../../types";

export default function OntologyLayer() {
  const { selectedDepartmentId, hoveredDepartmentId } = useAppStore();

  const edges = useMemo(() => {
    const seen = new Set<string>();
    const out: { a: DepartmentId; b: DepartmentId; verb: string }[] = [];
    for (const d of DEPARTMENTS) {
      for (const r of d.relations) {
        const key = [d.id, r.to].sort().join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ a: d.id, b: r.to, verb: r.verb });
      }
    }
    return out;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      <Platform position={[0, 0, 0]} size={[13, 0.25, 6]} label="ONTOLOGY" labelOffset={0.7} />

      {/* relationship edges between departments */}
      {edges.map((e) => {
        const a = DEPARTMENT_BY_ID[e.a].position;
        const b = DEPARTMENT_BY_ID[e.b].position;
        const active =
          selectedDepartmentId === e.a ||
          selectedDepartmentId === e.b ||
          hoveredDepartmentId === e.a ||
          hoveredDepartmentId === e.b;
        const color = active ? "#00d97e" : "#222";
        const opacity = active ? 1 : 0.35;
        const mid: [number, number, number] = [
          (a[0] + b[0]) / 2,
          0.18,
          (a[2] + b[2]) / 2,
        ];
        return (
          <group key={`${e.a}-${e.b}`}>
            <Line
              points={[
                [a[0], 0.18, a[2]],
                [mid[0], 0.18, mid[2]],
                [b[0], 0.18, b[2]],
              ]}
              color={color}
              transparent
              opacity={opacity}
              dashed
              dashSize={0.18}
              gapSize={0.12}
              lineWidth={active ? 1.6 : 1}
            />
            {active && (
              <Html
                position={[mid[0], 0.35, mid[2]]}
                center
                distanceFactor={10}
                style={{ pointerEvents: "none" }}
              >
                <div className="px-1.5 py-0.5 text-[9px] font-mono rounded-full bg-accent text-black whitespace-nowrap">
                  {e.verb}
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {DEPARTMENTS.map((d) => (
        <DepartmentNode key={d.id} dept={d} />
      ))}

      <AssetCard />
    </group>
  );
}
