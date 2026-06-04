import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { StatusPill } from './StatusPill';
import type { ConnectionStatus } from '../../services/websocket';

interface MinimalNavbarProps {
  wsStatus: ConnectionStatus;
  currentNodeId: string | null;
}

export function MinimalNavbar({ wsStatus, currentNodeId }: MinimalNavbarProps) {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="z-50 w-full px-6 py-4.5 flex items-center justify-between gap-4 border-b border-slate-200/60 bg-white/65 backdrop-blur-md relative"
    >
      {/* Brand logo & caption */}
      <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigate('/')}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25">
          <span className="text-white font-extrabold text-sm tracking-tighter">EX</span>
        </div>
        <div>
          <span className="text-xs font-extrabold tracking-tight text-slate-950 block">
            EXOA
          </span>
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block -mt-0.5">
            Emergency Command
          </span>
        </div>
      </div>

      {/* Center status and controls */}
      <div className="flex items-center gap-3">
        <StatusPill status={wsStatus} />
        
        <button
          onClick={() => navigate('/nav' + (currentNodeId ? `?node=${currentNodeId}` : ''))}
          className="px-4 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold tracking-wider uppercase shadow-sm transition-all cursor-pointer"
        >
          <span>LARGE MAP</span>
        </button>
      </div>
    </motion.header>
  );
}
