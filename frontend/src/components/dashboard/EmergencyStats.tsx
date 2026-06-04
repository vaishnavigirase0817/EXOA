import { motion } from 'framer-motion';
import type { GraphNode } from '../../types';

interface EmergencyStatsProps {
  currentNode: GraphNode | null;
  targetExit: GraphNode | null;
  distance: number;
  formattedTime: string;
  isCalculating: boolean;
}

export function EmergencyStats({
  currentNode,
  targetExit,
  distance,
  formattedTime,
  isCalculating,
}: EmergencyStatsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-x-8 gap-y-8"
    >
      {/* Current Location */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1">
        <span className="text-[9px] font-sans font-bold tracking-wider text-slate-400 uppercase">
          01 / Current Location
        </span>
        <span className="text-xl font-bold tracking-tight text-slate-900 truncate">
          {currentNode?.label || 'Not Detected'}
        </span>
        <span className="text-[9px] font-mono text-slate-400 font-medium mt-0.5">
          ID: {currentNode?.id || '—'}
        </span>
      </motion.div>

      {/* Active Floor */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1">
        <span className="text-[9px] font-sans font-bold tracking-wider text-slate-400 uppercase">
          02 / Active Level
        </span>
        <span className="text-xl font-bold tracking-tight text-slate-900">
          {currentNode !== null
            ? currentNode.floor === 0
              ? 'Ground Floor'
              : `Level ${currentNode.floor}`
            : 'Level 1'}
        </span>
        <span className="text-[9px] font-mono text-slate-400 font-medium mt-0.5">
          Surveillance Active
        </span>
      </motion.div>

      {/* Exit Distance */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1">
        <span className="text-[9px] font-sans font-bold tracking-wider text-slate-400 uppercase">
          03 / Route Gap
        </span>
        {isCalculating ? (
          <div className="h-6 w-20 bg-slate-100 animate-pulse rounded-md mt-1" />
        ) : (
          <span className="text-xl font-bold tracking-tight text-red-600 font-mono">
            {distance > 0 ? `${distance} units` : 'No route'}
          </span>
        )}
        <span className="text-[9px] font-sans text-slate-400 font-semibold mt-0.5 truncate">
          Target: {targetExit?.label || '—'}
        </span>
      </motion.div>

      {/* Est. Evacuation Time */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1">
        <span className="text-[9px] font-sans font-bold tracking-wider text-slate-400 uppercase">
          04 / Est. Evac Time
        </span>
        {isCalculating ? (
          <div className="h-6 w-20 bg-slate-100 animate-pulse rounded-md mt-1" />
        ) : (
          <span className="text-xl font-bold tracking-tight text-amber-600 font-mono">
            {formattedTime !== 'N/A' ? formattedTime : '—'}
          </span>
        )}
        <span className="text-[9px] font-sans text-slate-400 font-semibold mt-0.5">
          Constant Speed
        </span>
      </motion.div>
    </motion.div>
  );
}
