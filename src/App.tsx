import BrandStrip from "./components/BrandStrip";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import DetailPanel from "./components/DetailPanel";
import Scene from "./components/scene/Scene";
import { useAppStore } from "./store/useAppStore";

export default function App() {
  const panelOpen = useAppStore((s) => s.panelOpen);

  return (
    <div className="h-full w-full flex bg-bg text-ink">
      <BrandStrip />
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 relative dot-grid">
            <Scene />
            <SceneOverlay />
          </div>
          {panelOpen && <DetailPanel />}
        </div>
      </main>
    </div>
  );
}

function SceneOverlay() {
  return (
    <>
      {/* corner ticks / hud */}
      <div className="pointer-events-none absolute inset-0">
        <CornerTicks />
        <div className="absolute top-3 left-4 text-[10px] font-mono tracking-[0.22em] text-black/45">
          VIEW · ISOMETRIC · 30°
        </div>
        <div className="absolute top-3 right-4 text-[10px] font-mono tracking-[0.22em] text-black/45 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
          STREAM · 1.0×
        </div>
        <div className="absolute bottom-3 left-4 text-[10px] font-mono text-black/45">
          drag to orbit · click a department to inspect
        </div>
        <div className="absolute bottom-3 right-4 text-[10px] font-mono text-black/45 tracking-[0.18em]">
          ONTOLOGY GRAPH · 9 NODES · 12 EDGES
        </div>
      </div>
    </>
  );
}

function CornerTicks() {
  const tickStyle = "absolute w-3 h-3 border-black/30";
  return (
    <>
      <div className={`${tickStyle} top-2 left-2 border-t border-l`} />
      <div className={`${tickStyle} top-2 right-2 border-t border-r`} />
      <div className={`${tickStyle} bottom-2 left-2 border-b border-l`} />
      <div className={`${tickStyle} bottom-2 right-2 border-b border-r`} />
    </>
  );
}
