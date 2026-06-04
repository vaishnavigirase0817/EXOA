import { motion } from 'framer-motion';
import type { EmergencyStatus } from '../../types';

interface EmergencyBannerProps {
  status: EmergencyStatus;
  currentNodeId: string | null;
  distance: number;
}

export function EmergencyBanner({
  status,
  currentNodeId,
  distance,
}: EmergencyBannerProps) {
  const configs = {
    normal: {
      bg: 'bg-gradient-to-r from-blue-950/[0.05] via-slate-900/[0.15] to-blue-950/[0.05] border-blue-500/10',
      glow: 'shadow-md',
      icon: '🛡️',
      title: 'EXOA Safety Monitor Active',
      desc: 'Indoor emergency route calculation is online. Scan a yellow door QR code or select a room to trace a real-time corridor evacuation path.',
      badgeText: 'System Normal',
      badgeColor: 'bg-blue-500/5 text-blue-400 border-blue-500/15',
    },
    alert: {
      bg: 'bg-gradient-to-r from-amber-950/[0.08] via-slate-900/[0.2] to-amber-950/[0.08] border-amber-500/20',
      glow: 'shadow-md',
      icon: '⚠️',
      title: 'Alternative Exit Required',
      desc: 'The shortest route is currently obstructed by physical blockages. Recalculating safe secondary corridors dynamically.',
      badgeText: 'Alert Active',
      badgeColor: 'bg-amber-500/5 text-amber-400 border-amber-500/15',
    },
    evacuation: {
      bg: 'bg-gradient-to-r from-red-950/[0.08] via-slate-900/[0.25] to-red-950/[0.08] border-red-500/25',
      glow: 'shadow-lg shadow-red-500/[0.02]',
      icon: '🚨',
      title: 'Active Evacuation Routing',
      desc: 'Follow the highlighted green corridor centerlines immediately. Multi-floor stairwells and exits are cleared for evacuation.',
      badgeText: 'Evacuation Mapped',
      badgeColor: 'bg-red-500/5 text-red-400 border-red-500/15 animate-pulse',
    },
  };

  const config = configs[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-4.5 border border-white/[0.04] ${config.bg} ${config.glow} flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
    >
      <div className="flex items-start md:items-center gap-3">
        <span className="text-xl mt-0.5 md:mt-0 select-none opacity-90">{config.icon}</span>
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xs font-semibold text-[var(--color-exoa-text)] uppercase tracking-wider">
              {config.title}
            </h2>
            <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${config.badgeColor}`}>
              {config.badgeText}
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-exoa-text-muted)] mt-1.5 max-w-3xl leading-relaxed opacity-90">
            {config.desc}
          </p>
        </div>
      </div>

      {status === 'evacuation' && currentNodeId && (
        <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto bg-white/[0.01] border border-white/[0.04] px-4 py-2 rounded-xl">
          <div className="text-center">
            <span className="text-[8px] font-semibold text-[var(--color-exoa-text-dim)] uppercase tracking-widest block opacity-80">
              Route Distance
            </span>
            <span className="text-sm font-bold text-[var(--color-exoa-route)] font-mono block mt-0.5">
              ~{distance} <span className="text-[9px] font-sans font-medium text-[var(--color-exoa-text-dim)] uppercase ml-0.5">units</span>
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
