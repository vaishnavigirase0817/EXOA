import { motion } from 'framer-motion';
import type { ConnectionStatus } from '../../services/websocket';

interface StatusPillProps {
  status: ConnectionStatus;
}

export function StatusPill({ status }: StatusPillProps) {
  const configs = {
    connecting: {
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50 border-amber-200/60',
      text: 'Scanning Network',
    },
    connected: {
      dotColor: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-200/60',
      text: 'Live Connection',
    },
    disconnected: {
      dotColor: 'bg-slate-400',
      textColor: 'text-slate-600',
      bgColor: 'bg-slate-50 border-slate-200/60',
      text: 'Standby Mode',
    },
  };

  const current = configs[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-sans font-semibold tracking-tight select-none shadow-sm ${current.bgColor}`}>
      <motion.div
        className={`w-1.5 h-1.5 rounded-full ${current.dotColor}`}
        animate={
          status !== 'connected'
            ? { opacity: [1, 0.4, 1] }
            : { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }
        }
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className={`${current.textColor}`}>
        {current.text}
      </span>
    </div>
  );
}
