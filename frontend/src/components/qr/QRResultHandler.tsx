import { motion } from 'framer-motion';
import type { GraphNode } from '../../types';

interface QRResultHandlerProps {
  successNode: GraphNode | null;
  scanError: string | null;
  onReset: () => void;
}

export function QRResultHandler({ successNode, scanError, onReset }: QRResultHandlerProps) {
  if (!successNode && !scanError) return null;

  const floorNames = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full sm:max-w-md mx-auto"
    >
      {successNode && (
        <div className="glass-card p-5 border border-emerald-250 bg-emerald-50/50 rounded-2xl flex flex-col gap-4 text-center items-center">
          {/* Animated success radar icon */}
          <div className="w-11 h-11 rounded-full bg-emerald-100 border border-emerald-200/80 flex items-center justify-center relative">
            <span className="text-emerald-600 text-sm select-none">✓</span>
            <div className="absolute inset-0 rounded-full border border-emerald-400/40 animate-ping opacity-25" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-sans font-bold tracking-wider text-emerald-600 uppercase">
              Checkpoint Alignment Locked
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-1">
              {successNode.label || successNode.id}
            </h4>
            <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
              Level {successNode.floor} — {floorNames[successNode.floor] || 'Corridor Area'}
            </span>
          </div>

          <p className="text-[10px] text-emerald-700 leading-relaxed font-semibold uppercase tracking-wide">
            Evacuation routing activated. Finding safe exits...
          </p>

          <button
            onClick={onReset}
            className="w-full py-2 bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-700 font-bold text-[9px] tracking-wider uppercase rounded-full cursor-pointer transition-all border border-emerald-200/50"
          >
            Re-scan New Location
          </button>
        </div>
      )}

      {scanError && (
        <div className="glass-card p-5 border border-red-250 bg-red-50/50 rounded-2xl flex flex-col gap-4 text-center items-center">
          {/* Danger warning icon */}
          <div className="w-11 h-11 rounded-full bg-red-100 border border-red-200/80 flex items-center justify-center">
            <span className="text-red-500 text-sm select-none">⚠</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-sans font-bold tracking-wider text-red-500 uppercase">
              Physical QR Signal Error
            </span>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1.5 max-w-[260px]">
              {scanError}
            </p>
          </div>

          <button
            onClick={onReset}
            className="w-full py-2 bg-red-100/80 hover:bg-red-200/80 text-red-700 font-bold text-[9px] tracking-wider uppercase rounded-full cursor-pointer transition-all border border-red-200/50"
          >
            Retry Checkpoint Scan
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default QRResultHandler;
