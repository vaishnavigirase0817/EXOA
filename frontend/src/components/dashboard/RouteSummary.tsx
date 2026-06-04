import { motion } from 'framer-motion';
import { getNodeById } from '../../data/graphData';

interface RouteSummaryProps {
  path: string[];
  found: boolean;
}

export function RouteSummary({ path, found }: RouteSummaryProps) {
  const waypoints = path
    .map((id) => getNodeById(id))
    .filter((n) => n !== null);

  return (
    <div className="glass-card p-6 h-full flex flex-col border border-white/[0.04]">
      <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-exoa-text-muted)] flex items-center gap-2">
          🗺️ Active Route Checkpoints
        </h3>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full font-mono bg-[var(--color-exoa-accent)]/10 text-[var(--color-exoa-accent)] border border-[var(--color-exoa-accent)]/20">
          {waypoints.length} Nodes
        </span>
      </div>

      <div className="flex-grow overflow-y-auto max-h-[220px] pr-1.5 flex flex-col gap-2 relative">
        {!found || waypoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-lg opacity-80">🛑</span>
            <p className="text-xs font-semibold text-[var(--color-exoa-text)] mt-2">
              Route Offline
            </p>
            <p className="text-[9px] text-[var(--color-exoa-text-dim)] mt-1 opacity-90 leading-relaxed max-w-[200px]">
              Scan a room QR code or select a location node to generate path coordinates.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pl-3.5 relative border-l border-white/[0.06] ml-2">
            {waypoints.map((node, index) => {
              const isFirst = index === 0;
              const isLast = index === waypoints.length - 1;

              return (
                <motion.div
                  key={node!.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="flex items-center gap-3 relative py-0.5"
                >
                  {/* Custom node bullet on timeline */}
                  <div
                    className={`absolute -left-[18px] w-1.5 h-1.5 rounded-full z-10 ${
                      isFirst
                        ? 'bg-[var(--color-exoa-accent)] scale-125'
                        : isLast
                        ? 'bg-[var(--color-exoa-success)] scale-125'
                        : node!.type === 'stair'
                        ? 'bg-amber-500'
                        : 'bg-white/20'
                    }`}
                  />

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[var(--color-exoa-text)] truncate opacity-90">
                        {node!.label || `Waypoint ${index + 1}`}
                      </span>
                      <span className="text-[8px] font-mono text-[var(--color-exoa-text-dim)] uppercase bg-white/[0.02] border border-white/[0.04] px-1 rounded flex-shrink-0 opacity-80">
                        {node!.type}
                      </span>
                    </div>
                    <div className="text-[9px] text-[var(--color-exoa-text-dim)] font-mono mt-0.5 opacity-80">
                      ID: {node!.id}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mini Legend footer */}
      {found && waypoints.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-white/[0.04] flex items-center justify-between text-[8px] text-[var(--color-exoa-text-dim)] font-bold uppercase tracking-widest opacity-80">
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[var(--color-exoa-accent)]" /> Source
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-amber-500" /> Staircase
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[var(--color-exoa-success)]" /> Safe Exit
          </div>
        </div>
      )}
    </div>
  );
}
