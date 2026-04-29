import { Edges, Html } from "@react-three/drei";
import Platform from "./Platform";
import { useAppStore } from "../../store/useAppStore";

const SLABS = [
  { id: "analytics", label: "ANALYTICS", x: -4.6, menu: null },
  { id: "workflows", label: "WORKFLOWS", x: 0, menu: null },
  { id: "integrations", label: "INTEGRATIONS", x: 4.6, menu: ["Integration"] },
];

export default function TopLayer() {
  const { selectedMenuPath, setMenuSelection } = useAppStore();
  const y = 5;

  return (
    <group>
      {SLABS.map((slab) => {
        const highlighted =
          slab.menu && selectedMenuPath?.[0] === slab.menu[0];
        return (
          <group key={slab.id} position={[slab.x, y, 0]}>
            <Platform
              position={[0, 0, 0]}
              size={[3, 0.18, 2.2]}
              label={slab.label}
              labelOffset={0.55}
              fill={highlighted ? "#e9fbf2" : "#ffffff"}
              edgeColor={highlighted ? "#00d97e" : "#111111"}
            >
              <ScreenIcons variant={slab.id as any} highlighted={!!highlighted} />
            </Platform>
            {/* invisible click target */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                if (slab.menu) setMenuSelection(slab.menu as string[]);
              }}
              position={[0, 0.4, 0]}
            >
              <boxGeometry args={[3, 0.6, 2.2]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </group>
        );
      })}

      {/* SIMULATION badge above */}
      <group position={[0, y + 1.5, 0]}>
        <Html center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div className="text-[9px] tracking-[0.3em] font-mono text-black/50 mb-1 text-center">
            SIMULATION
          </div>
          <div className="flex flex-col gap-0.5 items-center">
            {["Option 01", "Option 02", "Option 03"].map((o) => (
              <div
                key={o}
                className="text-[9px] font-mono px-2 py-0.5 border border-black/20 bg-white rounded-full text-black/70 whitespace-nowrap"
              >
                {o}
              </div>
            ))}
          </div>
        </Html>
      </group>
    </group>
  );
}

function ScreenIcons({
  variant,
  highlighted,
}: {
  variant: "analytics" | "workflows" | "integrations";
  highlighted: boolean;
}) {
  const accent = highlighted ? "#00d97e" : "#111111";
  // Three small "monitor" boxes on top of slab
  const positions: [number, number, number][] = [
    [-0.85, 0.2, 0],
    [0, 0.2, 0],
    [0.85, 0.2, 0],
  ];
  return (
    <group>
      {positions.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <boxGeometry args={[0.6, 0.42, 0.04]} />
            <meshStandardMaterial color="#ffffff" />
            <Edges color={accent} />
          </mesh>
          {/* tiny stem */}
          <mesh position={[0, -0.27, 0]}>
            <boxGeometry args={[0.06, 0.1, 0.06]} />
            <meshStandardMaterial color="#ffffff" />
            <Edges color={accent} />
          </mesh>
          <mesh position={[0, -0.34, 0]}>
            <boxGeometry args={[0.3, 0.04, 0.18]} />
            <meshStandardMaterial color="#ffffff" />
            <Edges color={accent} />
          </mesh>
          <Html
            position={[0, 0, 0.04]}
            center
            distanceFactor={10}
            style={{ pointerEvents: "none" }}
          >
            <div className="w-[44px] h-[26px] flex items-center justify-center">
              <Glyph variant={variant} index={i} accent={highlighted} />
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

function Glyph({
  variant,
  index,
  accent,
}: {
  variant: "analytics" | "workflows" | "integrations";
  index: number;
  accent: boolean;
}) {
  const stroke = accent ? "#00a86b" : "#111";
  if (variant === "analytics") {
    return (
      <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
        {index === 0 && (
          <>
            <path d="M3 18 L11 8 L18 14 L26 4 L36 12" stroke={stroke} strokeWidth="1.1" />
            <circle cx="11" cy="8" r="1.4" fill={stroke} />
            <circle cx="26" cy="4" r="1.4" fill={stroke} />
          </>
        )}
        {index === 1 && (
          <>
            <rect x="3" y="10" width="4" height="9" stroke={stroke} strokeWidth="1" />
            <rect x="10" y="6" width="4" height="13" stroke={stroke} strokeWidth="1" />
            <rect x="17" y="12" width="4" height="7" stroke={stroke} strokeWidth="1" />
            <rect x="24" y="4" width="4" height="15" stroke={stroke} strokeWidth="1" />
            <rect x="31" y="9" width="4" height="10" stroke={stroke} strokeWidth="1" />
          </>
        )}
        {index === 2 && (
          <>
            <path d="M3 18 Q12 4 20 12 T36 6" stroke={stroke} strokeWidth="1.1" fill="none" />
            <circle cx="20" cy="12" r="1.6" fill={stroke} />
          </>
        )}
      </svg>
    );
  }
  if (variant === "workflows") {
    return (
      <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
        <rect x="2" y="3" width="9" height="6" stroke={stroke} strokeWidth="1" />
        <rect x="15" y="3" width="9" height="6" stroke={stroke} strokeWidth="1" />
        <rect x="28" y="3" width="9" height="6" stroke={stroke} strokeWidth="1" />
        <path d="M11 6 H15 M24 6 H28" stroke={stroke} strokeWidth="1" />
        <rect x="9" y="14" width="22" height="6" stroke={stroke} strokeWidth="1" />
        <path d="M20 9 V14" stroke={stroke} strokeWidth="1" />
      </svg>
    );
  }
  // integrations
  return (
    <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
      <rect x="3" y="6" width="14" height="10" stroke={stroke} strokeWidth="1" />
      <rect x="23" y="6" width="14" height="10" stroke={stroke} strokeWidth="1" />
      <path d="M17 11 H23" stroke={stroke} strokeWidth="1" strokeDasharray="1.5 1.5" />
      <circle cx="10" cy="11" r="2" stroke={stroke} strokeWidth="1" />
      <circle cx="30" cy="11" r="2" stroke={stroke} strokeWidth="1" />
    </svg>
  );
}
