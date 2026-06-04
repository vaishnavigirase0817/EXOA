import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { EmergencyStatus } from '../types';

interface EmergencyBannerProps {
  status: EmergencyStatus;
  currentNode: string | null;
  exitNode: string | null;
  distance: number;
  nodeLabel?: string;
  exitLabel?: string;
  floor?: number;
}

/**
 * Emergency status banner displayed at the top of the navigation view.
 * Shows current status, distance to exit, and navigation info.
 */
export function EmergencyBanner({
  status,
  currentNode,
  exitNode,
  distance,
  nodeLabel,
  exitLabel,
  floor,
}: EmergencyBannerProps) {
  const navigate = useNavigate();
  const statusConfig = {
    normal: {
      bg: 'bg-[var(--color-exoa-surface-2)]',
      border: 'border-[var(--color-exoa-border)]',
      icon: '🏢',
      title: 'INDOOR NAVIGATION',
      subtitle: 'Scan a QR code to begin navigation',
      color: 'text-[var(--color-exoa-text-muted)]',
    },
    alert: {
      bg: 'bg-[#7f1d1d20]',
      border: 'border-[var(--color-exoa-danger)]',
      icon: '⚠️',
      title: 'ROUTE NOT FOUND',
      subtitle: 'Unable to calculate exit route. Seek assistance.',
      color: 'text-[var(--color-exoa-danger)]',
    },
    evacuation: {
      bg: 'bg-[#7f1d1d15]',
      border: 'border-[var(--color-exoa-danger)]',
      icon: '🚨',
      title: 'EMERGENCY EVACUATION ROUTE',
      subtitle: 'Follow the highlighted path to the nearest exit',
      color: 'text-[var(--color-exoa-danger)]',
    },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      className={`${config.bg} border-b ${config.border} px-4 py-3 z-30 relative`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={
        status === 'evacuation'
          ? { boxShadow: '0 2px 20px rgba(239, 68, 68, 0.15)' }
          : undefined
      }
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Status */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl flex-shrink-0">{config.icon}</span>
          <div className="min-w-0">
            <div
              className={`text-xs font-bold tracking-widest ${config.color} flex items-center gap-2`}
            >
              {config.title}
              {status === 'evacuation' && (
                <motion.span
                  className="inline-block w-2 h-2 rounded-full bg-[var(--color-exoa-danger)]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>
            <div className="text-[var(--color-exoa-text-muted)] text-[11px] mt-0.5 truncate">
              {config.subtitle}
            </div>
          </div>
        </div>

        {/* Right: Route Info */}
        {status === 'evacuation' && currentNode && (
          <motion.div
            className="flex items-center gap-4 flex-shrink-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Current Location */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-exoa-accent)] flex-shrink-0" />
              <div>
                <div className="text-[9px] text-[var(--color-exoa-text-dim)] uppercase tracking-wider">
                  From
                </div>
                <div className="text-xs text-[var(--color-exoa-text)] font-semibold">
                  {nodeLabel || currentNode}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <span className="hidden sm:inline text-[var(--color-exoa-text-dim)] text-lg">→</span>

            {/* Exit */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-exoa-success)] flex-shrink-0" />
              <div>
                <div className="text-[9px] text-[var(--color-exoa-text-dim)] uppercase tracking-wider">
                  Exit
                </div>
                <div className="text-xs text-[var(--color-exoa-text)] font-semibold">
                  {exitLabel || exitNode}
                </div>
              </div>
            </div>

            {/* Distance badge */}
            <div className="glass-card px-3 py-1.5 text-center">
              <div className="text-[9px] text-[var(--color-exoa-text-dim)] uppercase tracking-wider">
                Distance
              </div>
              <div className="text-sm font-bold text-[var(--color-exoa-route)] font-mono">
                ~{distance}
                <span className="text-[10px] ml-0.5">units</span>
              </div>
            </div>

            {/* Floor Transition Buttons */}
            {floor === 3 && exitNode && (exitNode === 'T_STAIR_01' || exitNode === 'T_STAIR_02') && (
              <motion.button
                onClick={() => {
                  const targetStair = exitNode === 'T_STAIR_01' ? 'S_STAIR_01' : 'S_STAIR_02';
                  navigate(`/nav?node=${targetStair}`);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-amber-400/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>🚶 Go to 2nd Floor Map</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">2F</span>
              </motion.button>
            )}

            {floor === 2 && exitNode && (exitNode === 'S_STAIR_01' || exitNode === 'S_STAIR_02') && (
              <motion.button
                onClick={() => {
                  const targetStair = exitNode === 'S_STAIR_01' ? 'STAIR_01' : 'STAIR_02';
                  navigate(`/nav?node=${targetStair}`);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-orange-400/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>🚶 Go to 1st Floor Map</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">1F</span>
              </motion.button>
            )}

            {floor === 1 && (currentNode === 'STAIR_01' || currentNode === 'STAIR_02') && (
              <motion.button
                onClick={() => {
                  const targetStair = currentNode === 'STAIR_01' ? 'G_STAIR_01' : 'G_STAIR_02';
                  navigate(`/nav?node=${targetStair}`);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-emerald-400/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>🚶 Go to Ground Floor Map</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">GF</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
