import { motion } from 'framer-motion';
import type { GraphNode } from '../../types';

interface StatusCardProps {
  currentNode: GraphNode | null;
  targetExit: GraphNode | null;
  distance: number;
  formattedTime: string;
  isCalculating: boolean;
}

export function StatusCard({
  currentNode,
  targetExit,
  distance,
  formattedTime,
  isCalculating,
}: StatusCardProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } },
  };

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Detected Location Card */}
      <motion.div
        className="glass-card p-5 flex flex-col justify-between relative overflow-hidden border-white/[0.04]"
        variants={itemVariants}
        whileHover={{ translateY: -2, borderColor: 'rgba(255, 255, 255, 0.15)' }}
      >
        <div>
          <span className="text-[9px] font-semibold text-[var(--color-exoa-text-dim)] uppercase tracking-widest block opacity-80">
            📍 Current Node
          </span>
          <span className="text-[21px] font-bold tracking-tight text-white mt-1.5 block truncate">
            {currentNode?.label || 'Not Detected'}
          </span>
        </div>
        <div className="text-[9px] text-[var(--color-exoa-text-dim)] font-mono mt-3.5 opacity-75">
          ID: {currentNode?.id || '—'}
        </div>
      </motion.div>

      {/* Floor Card */}
      <motion.div
        className="glass-card p-5 flex flex-col justify-between relative overflow-hidden border-white/[0.04]"
        variants={itemVariants}
        whileHover={{ translateY: -2, borderColor: 'rgba(255, 255, 255, 0.15)' }}
      >
        <div>
          <span className="text-[9px] font-semibold text-[var(--color-exoa-text-dim)] uppercase tracking-widest block opacity-80">
            🏢 Current Level
          </span>
          <span className="text-[21px] font-bold tracking-tight text-[var(--color-exoa-accent)] mt-1.5 block">
            {currentNode !== null
              ? currentNode.floor === 0
                ? 'Ground Floor'
                : `${currentNode.floor}rd Floor`
              : 'Level 1'}
          </span>
        </div>
        <div className="text-[9px] text-[var(--color-exoa-text-dim)] font-mono mt-3.5 opacity-75">
          Floor ID: {currentNode?.floor ?? '—'}
        </div>
      </motion.div>

      {/* Evacuation Distance */}
      <motion.div
        className="glass-card p-5 flex flex-col justify-between relative overflow-hidden border-white/[0.04]"
        variants={itemVariants}
        whileHover={{ translateY: -2, borderColor: 'rgba(255, 255, 255, 0.15)' }}
      >
        <div>
          <span className="text-[9px] font-semibold text-[var(--color-exoa-text-dim)] uppercase tracking-widest block opacity-80">
            📏 Evac Distance
          </span>
          {isCalculating ? (
            <div className="h-7 w-20 bg-[var(--color-exoa-surface-3)] animate-pulse rounded-lg mt-1.5" />
          ) : (
            <span className="text-[21px] font-bold tracking-tight text-[var(--color-exoa-route)] mt-1.5 block font-mono">
              {distance > 0 ? `~${distance} units` : 'No route'}
            </span>
          )}
        </div>
        <div className="text-[9px] text-[var(--color-exoa-text-dim)] font-mono mt-3.5 opacity-75 truncate">
          To: {targetExit?.label || targetExit?.id || '—'}
        </div>
      </motion.div>

      {/* Est. Evac Time */}
      <motion.div
        className="glass-card p-5 flex flex-col justify-between relative overflow-hidden border-white/[0.04]"
        variants={itemVariants}
        whileHover={{ translateY: -2, borderColor: 'rgba(255, 255, 255, 0.15)' }}
      >
        <div>
          <span className="text-[9px] font-semibold text-[var(--color-exoa-text-dim)] uppercase tracking-widest block opacity-80">
            ⏱️ Est. Evac Time
          </span>
          {isCalculating ? (
            <div className="h-7 w-24 bg-[var(--color-exoa-surface-3)] animate-pulse rounded-lg mt-1.5" />
          ) : (
            <span className="text-[21px] font-bold tracking-tight text-[var(--color-exoa-success)] mt-1.5 block font-mono">
              {formattedTime !== 'N/A' ? formattedTime : '—'}
            </span>
          )}
        </div>
        <div className="text-[9px] text-[var(--color-exoa-text-dim)] font-mono mt-3.5 opacity-75">
          Est. Speed: 1.4 m/s
        </div>
      </motion.div>
    </motion.div>
  );
}
