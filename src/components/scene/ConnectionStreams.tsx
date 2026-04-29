import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  fromY: number;
  toY: number;
  positions: [number, number][]; // [x, z] of each stream
  count?: number;
  speed?: number;
  color?: string;
};

export default function ConnectionStreams({
  fromY,
  toY,
  positions,
  count = 6,
  speed = 0.35,
  color = "#111111",
}: Props) {
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const ref = useRef<THREE.InstancedMesh>(null);

  const offsets = useMemo(() => {
    const arr: { x: number; z: number; o: number }[] = [];
    for (const [x, z] of positions) {
      for (let i = 0; i < count; i++) {
        arr.push({ x, z, o: i / count });
      }
    }
    return arr;
  }, [positions, count]);
  const total = offsets.length;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const distance = fromY - toY;
    for (let i = 0; i < offsets.length; i++) {
      const { x, z, o } = offsets[i];
      const phase = (t * speed + o) % 1;
      const y = fromY - phase * distance;
      dummy.position.set(x, y, z);
      const s = 0.5 + 0.5 * Math.sin(phase * Math.PI);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {positions.map(([x, z], i) => (
        <Line
          key={i}
          points={[
            [x, fromY, z],
            [x, toY, z],
          ]}
          color={color}
          transparent
          opacity={0.18}
          dashed
          dashSize={0.12}
          gapSize={0.14}
          lineWidth={1}
        />
      ))}
      <instancedMesh ref={ref} args={[undefined, undefined, total]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={color} />
      </instancedMesh>
    </group>
  );
}
