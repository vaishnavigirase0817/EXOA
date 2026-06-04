import { motion } from 'framer-motion';
import type { SOSAlert } from '../../types/sos';

interface ActiveSOSPanelProps {
  alerts: SOSAlert[];
  onSelectAlert: (alert: SOSAlert) => void;
  selectedAlertId: string | null;
}

export function ActiveSOSPanel({ alerts, onSelectAlert, selectedAlertId }: ActiveSOSPanelProps) {
  const activeCount = alerts.filter(a => a.status !== 'resolved').length;

  return (
    <div className="glass-card p-5.5 border border-slate-200 bg-white shadow-sm rounded-2xl flex flex-col gap-4 w-full">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-slate-800">
            🚨 Active Distress Surveillance
          </h3>
          {activeCount > 0 && (
            <motion.span
              animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="px-2 py-0.5 rounded-full text-[8.5px] font-sans font-bold bg-red-50 text-red-600 border border-red-200"
            >
              {activeCount} Active
            </motion.span>
          )}
        </div>
        
        <span className="text-[9px] font-sans font-bold text-slate-400 tracking-wide uppercase">
          Real-Time Receiver
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="py-7 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <span className="text-sm select-none text-emerald-600">🟢</span>
          <p className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wide">
            No active distress signals. Building secure.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const isSelected = selectedAlertId === alert.id;
            const isAck = alert.status === 'acknowledged';
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 2 }}
                onClick={() => onSelectAlert(alert)}
                className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? isAck
                      ? 'bg-amber-50/80 border-amber-250 shadow-sm'
                      : 'bg-red-50/80 border-red-250 shadow-sm'
                    : isAck
                    ? 'bg-white border-slate-200 hover:border-amber-300 text-slate-700'
                    : 'bg-white border-slate-200 hover:border-red-300 text-slate-700'
                }`}
              >
                <div className="flex flex-col gap-1 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold tracking-tight ${isAck ? 'text-amber-700' : 'text-red-700'}`}>
                      {alert.user_id}
                    </span>
                    <span className="text-[8.5px] text-slate-400 font-semibold font-mono">
                      ID: {alert.id}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                    <span>Floor: {alert.current_floor}</span>
                    <span>•</span>
                    <span>Room: {alert.current_node}</span>
                    {alert.emergency_type !== 'general' && (
                      <>
                        <span>•</span>
                        <span className={isAck ? 'text-amber-600/95 font-bold' : 'text-red-600/95 font-bold'}>
                          {alert.emergency_type.toUpperCase()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[8px] font-mono text-slate-400 font-semibold">
                    {alert.timestamp}
                  </span>
                  
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-sans font-bold uppercase tracking-wider ${
                    isAck
                      ? 'bg-amber-50 border border-amber-200 text-amber-650'
                      : 'bg-red-50 border border-red-200 text-red-650 animate-pulse'
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ActiveSOSPanel;
