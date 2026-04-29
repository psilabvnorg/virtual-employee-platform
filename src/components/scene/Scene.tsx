import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TopLayer from "./TopLayer";
import PSILayer from "./PSILayer";
import BottomLayer from "./BottomLayer";
import ConnectionStreams from "./ConnectionStreams";

const TOP_Y = 5;
const ONT_Y = 0.13; // top surface of PSI slab (slab y=0, height 0.25)
const BOT_TOP_Y = -4.91; // top of bottom slab (y=-5, height 0.18)
const ONT_BOTTOM_Y = -0.13;

const TOP_STREAMS: [number, number][] = [
  [-5.4, -0.5],
  [-4.6, 0.4],
  [-3.8, -0.2],
  [-1.2, 0.4],
  [0, -0.6],
  [1.2, 0.5],
  [3.8, -0.2],
  [4.6, 0.4],
  [5.4, -0.4],
];

const BOTTOM_STREAMS: [number, number][] = [
  [-4.0, -0.6],
  [-3.2, 0.5],
  [-2.4, -0.2],
  [2.4, -0.2],
  [3.2, 0.5],
  [4.0, -0.6],
];

export default function Scene() {
  return (
    <Canvas
      shadows={false}
      dpr={[1, 2]}
      camera={{ position: [10, 7.5, 13], fov: 32 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#f5f5f5"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[8, 14, 6]} intensity={0.45} />
      <hemisphereLight args={["#ffffff", "#d6d6d6", 0.4]} />

      <TopLayer />
      <PSILayer />
      <BottomLayer />

      <ConnectionStreams fromY={TOP_Y - 0.1} toY={ONT_Y} positions={TOP_STREAMS} count={5} speed={0.32} />
      <ConnectionStreams fromY={ONT_BOTTOM_Y} toY={BOT_TOP_Y} positions={BOTTOM_STREAMS} count={5} speed={0.32} />

      <OrbitControls
        target={[0, 0, 0]}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={0.55}
        maxPolarAngle={1.15}
        minAzimuthAngle={-0.55}
        maxAzimuthAngle={0.55}
        rotateSpeed={0.5}
      />
    </Canvas>
  );
}
