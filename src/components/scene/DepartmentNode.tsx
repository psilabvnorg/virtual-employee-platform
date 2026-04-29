import { useRef, useState } from "react";
import { Edges, Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Department } from "../../types";
import { useAppStore } from "../../store/useAppStore";

type Props = { dept: Department };

export default function DepartmentNode({ dept }: Props) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const {
    selectedDepartmentId,
    setDepartmentSelection,
    setHoveredDepartment,
  } = useAppStore();

  const selected = selectedDepartmentId === dept.id;
  const accent = selected || hovered;

  useFrame((_, dt) => {
    if (!group.current) return;
    const targetY = (selected ? 0.55 : hovered ? 0.25 : 0) + dept.position[1];
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      targetY,
      Math.min(1, dt * 8)
    );
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    setHoveredDepartment(dept.id);
    document.body.style.cursor = "pointer";
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    setHoveredDepartment(null);
    document.body.style.cursor = "";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setDepartmentSelection(dept.id);
  };

  const edge = accent ? "#00d97e" : "#111111";
  const fill = accent ? "#e9fbf2" : "#ffffff";

  // Different building "silhouettes" by hashing id length so departments look varied.
  const variant = dept.id.length % 3;

  return (
    <group
      ref={group}
      position={[dept.position[0], dept.position[1], dept.position[2]]}
      onPointerOver={onOver}
      onPointerOut={onOut}
      onClick={onClick}
    >
      {/* base */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.7, 0.5, 0.7]} />
        <meshStandardMaterial color={fill} roughness={0.85} />
        <Edges color={edge} />
      </mesh>

      {/* upper silhouette */}
      {variant === 0 && (
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.5, 0.4, 0.5]} />
          <meshStandardMaterial color={fill} />
          <Edges color={edge} />
        </mesh>
      )}
      {variant === 1 && (
        <>
          <mesh position={[-0.12, 0.65, 0]}>
            <boxGeometry args={[0.22, 0.3, 0.4]} />
            <meshStandardMaterial color={fill} />
            <Edges color={edge} />
          </mesh>
          <mesh position={[0.18, 0.75, 0.05]}>
            <boxGeometry args={[0.28, 0.5, 0.3]} />
            <meshStandardMaterial color={fill} />
            <Edges color={edge} />
          </mesh>
        </>
      )}
      {variant === 2 && (
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.4, 8]} />
          <meshStandardMaterial color={fill} />
          <Edges color={edge} />
        </mesh>
      )}

      {/* selection halo on plate */}
      {selected && (
        <mesh position={[0, -0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.7, 32]} />
          <meshBasicMaterial color="#00d97e" transparent opacity={0.7} />
        </mesh>
      )}

      {/* label */}
      <Html
        position={[0, 1.15, 0]}
        center
        distanceFactor={9}
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`px-1.5 py-0.5 text-[10px] font-mono rounded-full whitespace-nowrap border transition-colors ${
            accent
              ? "bg-accent text-black border-accent"
              : "bg-white/95 border-black/15 text-black/70"
          }`}
        >
          {dept.name}
        </div>
      </Html>
    </group>
  );
}
