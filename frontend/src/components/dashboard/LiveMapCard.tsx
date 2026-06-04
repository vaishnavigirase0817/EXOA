import { motion } from 'framer-motion';
import { FloorMap } from '../FloorMap';
import type { NavigationState } from '../../types';

interface LiveMapCardProps {
  navState: NavigationState;
  routeSVGPath: string;
  isCalculating: boolean;
  floorLevel: number;
}

export function LiveMapCard({
  navState,
  routeSVGPath,
  isCalculating,
  floorLevel,
}: LiveMapCardProps) {
  const getFloorName = (level: number) => {
    const floorNames = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor'];
    return floorNames[level] || `Floor ${level}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="glass-card overflow-hidden bg-white border border-slate-200/80 flex flex-col h-[520px] xl:h-[640px] shadow-sm relative rounded-2xl"
    >
      {/* Map telemetry overlay */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 pointer-events-none select-none">
        <div className="px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-md text-[9px] font-sans font-bold text-slate-800 tracking-wider uppercase shadow-sm">
          🗺️ Live Map
        </div>
        <div className="px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-md text-[9px] font-sans font-bold text-blue-600 tracking-wider uppercase shadow-sm">
          {getFloorName(floorLevel)}
        </div>
      </div>

      <div className="absolute top-6 right-6 z-20 pointer-events-none select-none hidden sm:block">
        <div className="px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-md text-[9px] font-sans font-semibold text-slate-500 tracking-tight shadow-sm">
          Drag to Pan • Scroll to Zoom
        </div>
      </div>

      {/* Embedded interactive map */}
      <div className="flex-grow relative bg-slate-50">
        <FloorMap
          navState={navState}
          routeSVGPath={routeSVGPath}
          isCalculating={isCalculating}
        />
      </div>
    </motion.div>
  );
}
