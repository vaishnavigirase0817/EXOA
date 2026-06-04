import { motion } from 'framer-motion';
import type { SOSStatus } from '../../hooks/useSOS';

interface SOSButtonProps {
  status: SOSStatus;
  cooldown: number;
  onClick: () => void;
}

export function SOSButton({ status, cooldown, onClick }: SOSButtonProps) {
  const isCooldown = cooldown > 0;
  
  // Custom button styles and labels based on the state
  const getButtonContent = () => {
    switch (status) {
      case 'sending':
        return (
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] tracking-widest font-black uppercase">SENDING</span>
          </div>
        );
      case 'active':
        return (
          <div className="flex flex-col items-center justify-center -space-y-0.5">
            <span className="text-sm select-none">🚨</span>
            <span className="text-[9px] tracking-widest font-black uppercase text-white">ACTIVE</span>
          </div>
        );
      case 'resolved':
        return (
          <div className="flex flex-col items-center justify-center -space-y-0.5">
            <span className="text-sm select-none">✅</span>
            <span className="text-[9px] tracking-widest font-black uppercase text-green-200">RESOLVED</span>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="flex flex-col items-center justify-center -space-y-1">
            <span className="text-xl font-black text-white select-none">SOS</span>
            <span className="text-[7px] tracking-widest font-extrabold uppercase opacity-80 text-red-200">EMERGENCY</span>
          </div>
        );
    }
  };

  const getButtonBg = () => {
    if (isCooldown) return 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed shadow-none';
    
    switch (status) {
      case 'active':
        return 'bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 border-red-500 text-white shadow-lg shadow-red-600/30';
      case 'sending':
        return 'bg-gradient-to-br from-amber-600 to-orange-700 border-amber-500 text-white shadow-lg shadow-amber-500/20';
      case 'resolved':
        return 'bg-gradient-to-br from-emerald-600 to-green-700 border-emerald-500 text-white shadow-lg shadow-green-600/20';
      case 'idle':
      default:
        return 'bg-gradient-to-br from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 border-red-400 text-white shadow-lg shadow-red-500/30';
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-2.5">
      {/* Pulse Beacon animations behind the button */}
      {status === 'idle' && !isCooldown && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-red-500/40 animate-beacon absolute" style={{ animationDelay: '0s' }} />
          <div className="w-16 h-16 rounded-full border border-orange-500/35 animate-beacon absolute" style={{ animationDelay: '0.7s' }} />
        </div>
      )}
      {status === 'active' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-rose-500/60 animate-beacon absolute" style={{ animationDelay: '0s' }} />
          <div className="w-16 h-16 rounded-full border-2 border-red-500/50 animate-beacon absolute" style={{ animationDelay: '0.5s' }} />
          <div className="w-16 h-16 rounded-full border-2 border-rose-600/40 animate-beacon absolute" style={{ animationDelay: '1s' }} />
        </div>
      )}

      {/* Cooldown Tooltip */}
      {isCooldown && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-card px-2.5 py-1 border-zinc-700 bg-zinc-950/80 text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest pointer-events-none"
        >
          COOLDOWN: {cooldown}S
        </motion.div>
      )}

      {/* Main SOS button */}
      <motion.button
        onClick={onClick}
        disabled={isCooldown || status === 'sending'}
        className={`w-16 h-16 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-300 ${getButtonBg()}`}
        whileHover={!isCooldown && status !== 'sending' ? { scale: 1.08, y: -2 } : {}}
        whileTap={!isCooldown && status !== 'sending' ? { scale: 0.94 } : {}}
        aria-label="Trigger Emergency SOS Distress Signal"
        role="button"
        title="Distress Signal SOS Button"
      >
        {getButtonContent()}
      </motion.button>
    </div>
  );
}
export default SOSButton;
