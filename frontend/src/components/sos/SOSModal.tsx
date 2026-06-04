import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (emergencyType: string) => void;
}

const EMERGENCY_TYPES = [
  { id: 'general', label: '⚠️ General Distress', color: 'border-white/10 hover:border-red-500/30' },
  { id: 'injury', label: '🩹 Medical / Injury', color: 'border-white/10 hover:border-rose-500/30' },
  { id: 'fire', label: '🔥 Fire / Smoke', color: 'border-white/10 hover:border-amber-500/30' },
  { id: 'trapped', label: '🚪 Blocked / Trapped', color: 'border-white/10 hover:border-orange-500/30' },
];

export function SOSModal({ isOpen, onClose, onConfirm }: SOSModalProps) {
  const [selectedType, setSelectedType] = useState<string>('general');

  const handleConfirm = () => {
    onConfirm(selectedType);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#070913]/90 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md glass-card p-7 border-red-500/25 bg-[#0e1222] flex flex-col gap-5.5 shadow-2xl"
          >
            {/* Header copy */}
            <div className="text-center border-b border-white/[0.05] pb-4 flex flex-col gap-1.5">
              <span className="text-[9px] font-mono tracking-widest text-red-500 font-extrabold uppercase animate-pulse">
                🚨 EVACUATION DISTRESS PROTOCOL
              </span>
              <h3 className="text-xl font-bold tracking-tight text-white mt-1">
                Confirm Emergency SOS?
              </h3>
              <p className="text-[10px] text-[var(--color-exoa-text-dim)] uppercase tracking-wider font-semibold opacity-95">
                This will broadcast your location to the Admin Control Dashboard instantly in real-time.
              </p>
            </div>

            {/* Emergency Category Selector */}
            <div className="flex flex-col gap-2.5">
              <label className="block text-[8px] text-[var(--color-exoa-text-dim)] font-mono font-bold uppercase tracking-widest">
                [ SELECT EMERGENCY CATEGORY ]
              </label>
              
              <div className="grid grid-cols-2 gap-2.5">
                {EMERGENCY_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-4.5 py-3 rounded-2xl border text-xs font-semibold text-left transition-all duration-200 cursor-pointer ${
                      selectedType === type.id
                        ? 'bg-red-500/10 border-red-500/60 text-red-400 shadow-md shadow-red-500/5'
                        : `bg-[#0a0d1a]/50 text-white/70 ${type.color}`
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions panel */}
            <div className="flex items-center gap-3 border-t border-white/[0.05] pt-4.5">
              <button
                onClick={onClose}
                className="flex-1 py-3 text-[9px] font-extrabold uppercase tracking-widest text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-full cursor-pointer transition-all border border-white/5"
              >
                CANCEL
              </button>
              
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 text-[9px] font-extrabold uppercase tracking-widest text-white bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 rounded-full cursor-pointer transition-all border border-red-400/20 shadow-md shadow-red-500/10"
              >
                BROADCAST SOS
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default SOSModal;
