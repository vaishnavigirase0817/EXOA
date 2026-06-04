import { motion } from 'framer-motion';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  scale: number;
}

export function ZoomControls({ onZoomIn, onZoomOut, onReset, scale }: ZoomControlsProps) {
  return (
    <motion.div
      className="absolute bottom-6 right-6 flex flex-col gap-2 z-20"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="w-10 h-10 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 hover:border-blue-300 shadow-sm flex items-center justify-center text-base font-bold transition-all duration-200 cursor-pointer"
        title="Zoom In"
        id="zoom-in-btn"
      >
        +
      </button>

      {/* Zoom Level Indicator */}
      <div className="w-10 h-7 rounded-full border border-slate-200/50 bg-slate-50 text-slate-500 flex items-center justify-center text-[9px] font-mono font-bold shadow-inner">
        {Math.round(scale * 100)}%
      </div>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="w-10 h-10 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 hover:border-blue-300 shadow-sm flex items-center justify-center text-base font-bold transition-all duration-200 cursor-pointer"
        title="Zoom Out"
        id="zoom-out-btn"
      >
        −
      </button>

      {/* Reset View */}
      <button
        onClick={onReset}
        className="w-10 h-10 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 hover:text-amber-600 hover:border-amber-300 shadow-sm flex items-center justify-center text-xs transition-all duration-200 cursor-pointer"
        title="Reset View"
        id="reset-view-btn"
      >
        ⟲
      </button>
    </motion.div>
  );
}
