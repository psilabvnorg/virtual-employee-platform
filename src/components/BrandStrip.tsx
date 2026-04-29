export default function BrandStrip() {
  return (
    <div className="w-[5.5rem] shrink-0 bg-ink text-white flex flex-col items-center justify-between py-3 border-r border-black/40">
      <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-white/10 flex items-center justify-center">
        <img src="/logo.png" alt="PSI" className="w-[3.75rem] h-[3.75rem]" style={{ filter: "invert(1)" }} />
      </div>
      <div
        className="text-[11px] tracking-[0.18em] font-mono whitespace-nowrap text-white/80"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        Virtual Employee Platform &nbsp;→&nbsp; Powered by the PSI
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
    </div>
  );
}
