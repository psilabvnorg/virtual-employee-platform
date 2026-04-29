import { Edges, Html } from "@react-three/drei";
import Platform from "./Platform";

const SLABS = [
  { id: "data", label: "DATA", x: -3.2, icons: "data" as const },
  { id: "models", label: "MODELS", x: 3.2, icons: "models" as const },
];

export default function BottomLayer() {
  const y = -5;
  return (
    <group>
      {SLABS.map((s) => (
        <group key={s.id} position={[s.x, y, 0]}>
          <Platform position={[0, 0, 0]} size={[3.6, 0.18, 2.4]} label={s.label} labelOffset={0.55}>
            <PlateIcons variant={s.icons} />
          </Platform>
        </group>
      ))}
    </group>
  );
}

function PlateIcons({ variant }: { variant: "data" | "models" }) {
  const positions: [number, number][] = [
    [-1.2, -0.55],
    [-0.4, -0.55],
    [0.4, -0.55],
    [1.2, -0.55],
    [-0.8, 0.4],
    [0.0, 0.4],
    [0.8, 0.4],
  ];
  return (
    <group>
      {positions.slice(0, 5).map((p, i) => (
        <group key={i} position={[p[0], 0.16, p[1]]}>
          <mesh>
            <boxGeometry args={[0.55, 0.04, 0.55]} />
            <meshStandardMaterial color="#ffffff" />
            <Edges color="#111" />
          </mesh>
          <Html
            position={[0, 0.03, 0]}
            center
            distanceFactor={10}
            rotation={[-Math.PI / 2, 0, 0]}
            transform
            style={{ pointerEvents: "none" }}
          >
            <div className="w-[28px] h-[28px] flex items-center justify-center">
              {variant === "data" ? <DataGlyph idx={i} /> : <ModelGlyph idx={i} />}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

function DataGlyph({ idx }: { idx: number }) {
  const stroke = "#111";
  switch (idx % 5) {
    case 0:
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M2 4 H20 M2 8 H20 M2 12 H20 M2 16 H20" stroke={stroke} />
        </svg>
      );
    case 1:
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <ellipse cx="11" cy="5" rx="8" ry="2.5" stroke={stroke} />
          <path d="M3 5 V17 C3 18.5 7 19.5 11 19.5 C15 19.5 19 18.5 19 17 V5" stroke={stroke} />
        </svg>
      );
    case 2:
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="3" width="16" height="16" stroke={stroke} />
        </svg>
      );
    case 3:
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 4 }).map((_, c) => (
              <rect
                key={`${r}-${c}`}
                x={3 + c * 4}
                y={3 + r * 4}
                width="3"
                height="3"
                stroke={stroke}
              />
            ))
          )}
        </svg>
      );
    default:
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <ellipse cx="11" cy="11" rx="8" ry="3" stroke={stroke} />
          <ellipse cx="11" cy="11" rx="3" ry="8" stroke={stroke} />
        </svg>
      );
  }
}

function ModelGlyph({ idx }: { idx: number }) {
  const stroke = "#111";
  switch (idx % 5) {
    case 0:
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="5" cy="11" r="2" stroke={stroke} />
          <circle cx="17" cy="5" r="2" stroke={stroke} />
          <circle cx="17" cy="17" r="2" stroke={stroke} />
          <path d="M7 11 L15 6 M7 11 L15 16" stroke={stroke} />
        </svg>
      );
    case 1:
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M2 19 L7 11 L11 14 L19 4" stroke={stroke} />
        </svg>
      );
    case 2:
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          {Array.from({ length: 3 }).map((_, r) =>
            Array.from({ length: 3 }).map((_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={5 + c * 6}
                cy={5 + r * 6}
                r="1.4"
                stroke={stroke}
              />
            ))
          )}
        </svg>
      );
    case 3:
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="6" stroke={stroke} />
          <path d="M11 5 V17 M5 11 H17" stroke={stroke} />
        </svg>
      );
    default:
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 17 L7 9 L11 13 L19 5" stroke={stroke} />
          <path d="M3 17 H19" stroke={stroke} />
        </svg>
      );
  }
}
