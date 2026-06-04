export function ScanPreview() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
      {/* Laser HUD Frame */}
      <div className="w-[75%] h-[75%] max-w-[260px] max-h-[260px] border border-white/5 rounded-3xl relative shadow-[0_0_40px_rgba(255,255,255,0.01)]">
        {/* Subtle HUD crosshair target sights */}
        <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-white/5 -translate-y-1/2" />
        <div className="absolute left-1/2 top-4 bottom-4 w-[1px] bg-white/5 -translate-x-1/2" />

        {/* Center reticle */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 border border-red-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="w-0.5 h-0.5 bg-red-500 rounded-full animate-ping" />
        </div>

        {/* Framing brackets (neon green/red corners) */}
        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-red-500/70 rounded-tl-xl" />
        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-red-500/70 rounded-tr-xl" />
        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-red-500/70 rounded-bl-xl" />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-red-500/70 rounded-br-xl" />
      </div>

      {/* Target status tag */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#070913]/90 border border-white/[0.06] rounded px-3 py-1 text-[7px] font-mono tracking-widest uppercase text-[var(--color-exoa-text-dim)] font-bold">
        ALIGMENT SENSOR ACTIVE
      </div>
    </div>
  );
}
export default ScanPreview;
