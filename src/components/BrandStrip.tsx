export default function BrandStrip() {
  return (
    <div className="w-10 shrink-0 bg-ink text-white flex flex-col items-center justify-between py-3 border-r border-black/40">
      <div className="w-6 h-6 rounded-full border border-white/70 flex items-center justify-center text-[10px] font-mono">
        Q
      </div>
      <div
        className="text-[11px] tracking-[0.18em] font-mono whitespace-nowrap text-white/80"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        Virtual Employee Platform &nbsp;→&nbsp; Powered by the Ontology
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
    </div>
  );
}
