import { motion, AnimatePresence } from 'framer-motion';
import type { HazardInfo } from '../../hooks/useDashboard';

interface HazardPanelProps {
  hazards: HazardInfo[];
}

export function HazardPanel({ hazards }: HazardPanelProps) {
  return (
    <div className="glass-card p-6 h-full flex flex-col border border-white/[0.04]">
      <div className="flex items-center justify-between mb-4.5 border-b border-white/[0.06] pb-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-exoa-text-muted)] flex items-center gap-2">
          🔥 Active Corridor Hazards
        </h3>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono tracking-wider ${
          hazards.length > 0 
            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
            : 'bg-green-500/10 text-green-400 border border-green-500/20'
        }`}>
          {hazards.length} Blocked
        </span>
      </div>

      <div className="flex-grow overflow-y-auto max-h-[220px] pr-1.5 flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {hazards.length === 0 ? (
            <motion.div
              key="no-hazards"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="w-11 h-11 rounded-full bg-green-500/5 flex items-center justify-center text-base text-green-400 border border-green-500/15 mb-3 shadow-inner">
                ✓
              </div>
              <p className="text-xs font-semibold text-[var(--color-exoa-text)] tracking-wide">
                All Corridors Walkable
              </p>
              <p className="text-[9px] text-[var(--color-exoa-text-dim)] mt-1 opacity-90 leading-relaxed max-w-[200px]">
                No active smoke, fire, or physical debris blockages reported.
              </p>
            </motion.div>
          ) : (
            hazards.map((hazard, index) => (
              <motion.div
                key={hazard.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="glass-card border border-red-500/15 p-3.5 bg-red-500/[0.02] relative overflow-hidden flex items-start gap-3"
                style={{ boxShadow: 'none' }}
              >
                {/* Visual danger line on left */}
                <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-red-500/40" />
                
                <span className="text-xs mt-0.5 select-none opacity-90">⚠️</span>
                <div className="min-w-0">
                  <div className="text-[9px] font-bold text-red-400 tracking-widest uppercase">
                    Blocked Route Segment
                  </div>
                  <div className="text-xs text-[var(--color-exoa-text)] font-medium mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[var(--color-exoa-text-muted)] truncate max-w-[120px]">
                      {hazard.fromNode.label || hazard.fromNode.id}
                    </span>
                    <span className="text-[var(--color-exoa-text-dim)] font-normal">↔</span>
                    <span className="text-[var(--color-exoa-text-muted)] truncate max-w-[120px]">
                      {hazard.toNode.label || hazard.toNode.id}
                    </span>
                  </div>
                  <div className="text-[9px] text-[var(--color-exoa-text-dim)] mt-1.5 font-mono opacity-85">
                    Link: {hazard.fromNode.id} — {hazard.toNode.id}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
