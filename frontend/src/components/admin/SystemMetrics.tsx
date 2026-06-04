import { motion } from 'framer-motion';

interface SystemMetricsProps {
  wsStatus: string;
  blockedCount: number;
  simulatedUsers: number;
  systemStatus: string;
}

export function SystemMetrics({
  wsStatus,
  blockedCount,
  simulatedUsers,
  systemStatus,
}: SystemMetricsProps) {
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
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full"
    >
      {/* Network link state */}
      <motion.div variants={itemVariants} className="glass-card p-5 border border-slate-200 bg-white shadow-sm rounded-2xl">
        <span className="text-[9px] font-sans font-bold tracking-wider text-slate-400 uppercase block">
          01 / Link Status
        </span>
        <span className={`text-xl font-bold font-sans tracking-tight block mt-2 ${
          wsStatus === 'connected' ? 'text-emerald-600' : wsStatus === 'connecting' ? 'text-amber-600' : 'text-rose-600'
        }`}>
          {wsStatus === 'connected' ? 'Live Connection' : wsStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
        </span>
        <span className="text-[9px] font-mono text-slate-400 font-medium block mt-1">
          Socket Stream Active
        </span>
      </motion.div>

      {/* Corridor hazards block */}
      <motion.div variants={itemVariants} className="glass-card p-5 border border-slate-200 bg-white shadow-sm rounded-2xl">
        <span className="text-[9px] font-sans font-bold tracking-wider text-slate-400 uppercase block">
          02 / Active Hazards
        </span>
        <span className={`text-xl font-bold font-sans tracking-tight block mt-2 ${
          blockedCount > 0 ? 'text-rose-600' : 'text-emerald-600'
        }`}>
          {blockedCount} Blocked Paths
        </span>
        <span className="text-[9px] font-mono text-slate-400 font-medium block mt-1">
          Obstructed Corridors
        </span>
      </motion.div>

      {/* Simulated User routes active */}
      <motion.div variants={itemVariants} className="glass-card p-5 border border-slate-200 bg-white shadow-sm rounded-2xl">
        <span className="text-[9px] font-sans font-bold tracking-wider text-slate-400 uppercase block">
          03 / Simulated Users
        </span>
        <span className="text-xl font-bold font-sans tracking-tight text-slate-900 block mt-2">
          {simulatedUsers} Active
        </span>
        <span className="text-[9px] font-mono text-slate-400 font-medium block mt-1">
          Estimated Active Pings
        </span>
      </motion.div>

      {/* System security threat state */}
      <motion.div variants={itemVariants} className="glass-card p-5 border border-slate-200 bg-white shadow-sm rounded-2xl">
        <span className="text-[9px] font-sans font-bold tracking-wider text-slate-400 uppercase block">
          04 / Safety Index
        </span>
        <span className={`text-xl font-bold font-sans tracking-tight block mt-2 uppercase ${
          systemStatus === 'evacuation' ? 'text-rose-600 animate-pulse font-extrabold' : systemStatus === 'alert' ? 'text-amber-600 font-extrabold' : 'text-blue-600'
        }`}>
          {systemStatus === 'evacuation' ? '🚨 EMERGENCY' : systemStatus === 'alert' ? '⚠️ WARNING' : '🛡️ NORMAL'}
        </span>
        <span className="text-[9px] font-mono text-slate-400 font-medium block mt-1">
          Safety Security Index
        </span>
      </motion.div>
    </motion.div>
  );
}
