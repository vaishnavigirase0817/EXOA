import { motion } from 'framer-motion';
import type { SOSAlert } from '../../types/sos';

interface SOSStatusIndicatorProps {
  alert: SOSAlert | null;
  localStatus: string;
  onCancel: () => void;
}

export function SOSStatusIndicator({ alert, localStatus, onCancel }: SOSStatusIndicatorProps) {
  if (localStatus === 'idle') return null;

  const isAcknowledged = alert?.status === 'acknowledged';
  const isResolved = localStatus === 'resolved';

  const getIndicatorStyle = () => {
    if (isResolved) {
      return 'border-emerald-250 bg-emerald-50 text-emerald-800';
    }
    if (isAcknowledged) {
      return 'border-amber-250 bg-amber-50 text-amber-800';
    }
    return 'border-red-250 bg-red-50 text-red-800';
  };

  const getHeadingText = () => {
    if (isResolved) return '🟢 Emergency Distress Resolved';
    if (isAcknowledged) return '⚠️ Administrator Acknowledged';
    return '🚨 Emergency Distress Transmitting';
  };

  const getDescriptionText = () => {
    if (isResolved) {
      return 'Operations control has marked your situation as resolved. State resetting...';
    }
    if (isAcknowledged) {
      return 'First responder dispatch initiated. Hold your position, help is on the way!';
    }
    return `SOS Broadcast active from node ${alert?.current_node} (Floor ${alert?.current_floor}). Operations team notified.`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      className={`p-5 border rounded-2xl flex flex-col gap-2 shadow-sm select-none relative overflow-hidden ${getIndicatorStyle()}`}
    >
      {/* Absolute pulsing background glow */}
      {!isResolved && (
        <div
          className={`absolute inset-0 opacity-[0.03] pointer-events-none ${
            isAcknowledged ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-pulse'
          }`}
        />
      )}

      <div className="flex items-center justify-between z-10">
        <span className="text-xs font-bold tracking-tight">
          {getHeadingText()}
        </span>
        
        {/* Connection health indicator */}
        {!isResolved && (
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAcknowledged ? 'bg-amber-500' : 'bg-red-500'}`} />
            <span className="text-[9px] font-sans font-bold uppercase opacity-85">Live Link</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
        <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm">
          {getDescriptionText()}
        </p>

        {/* Local Cancel button */}
        {!isResolved && (
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-[9px] font-bold uppercase text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-full cursor-pointer transition-all shrink-0 shadow-sm"
          >
            Cancel Alert
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default SOSStatusIndicator;
