import { Edges, Html } from "@react-three/drei";

type Props = {
  position: [number, number, number];
  size: [number, number, number];
  label?: string;
  labelOffset?: number;
  fill?: string;
  edgeColor?: string;
  children?: React.ReactNode;
};

export default function Platform({
  position,
  size,
  label,
  labelOffset = 0.45,
  fill = "#ffffff",
  edgeColor = "#111111",
  children,
}: Props) {
  return (
    <group position={position}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={fill} roughness={0.9} metalness={0} />
        <Edges color={edgeColor} threshold={1} />
      </mesh>
      {label && (
        <Html
          position={[0, -size[1] / 2 - labelOffset, 0]}
          center
          distanceFactor={10}
          style={{ pointerEvents: "none" }}
        >
          <div className="text-[10px] tracking-[0.32em] font-mono text-black/70 whitespace-nowrap">
            {label}
          </div>
        </Html>
      )}
      {children}
    </group>
  );
}
