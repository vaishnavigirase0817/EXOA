import { motion } from 'framer-motion';
import type { ConnectionStatus } from '../../services/websocket';

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
}

export function ConnectionIndicator({ status }: ConnectionIndicatorProps) {
  const statusConfig = {
    connecting: {
      color: 'bg-amber-400',
      text: '[ CTRL LINK: CONNECTING ]',
    },
    connected: {
      color: 'bg-green-400',
      text: '[ CTRL LINK: ACTIVE ]',
    },
    disconnected: {
      color: 'bg-red-400',
      text: '[ CTRL LINK: STANDBY ]',
    },
  };

  const current = statusConfig[status];

  return (
    <div className="glass-card px-2.5 py-1 flex items-center gap-2 text-[9px] font-semibold select-none border border-white/[0.04] bg-white/[0.01]">
      <motion.div
        className={`w-1.5 h-1.5 rounded-full ${current.color}`}
        animate={
          status !== 'connected'
            ? { opacity: [1, 0.4, 1] }
            : { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }
        }
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="text-[var(--color-exoa-text-dim)] font-mono tracking-wider">
        {current.text}
      </span>
    </div>
  );
}
