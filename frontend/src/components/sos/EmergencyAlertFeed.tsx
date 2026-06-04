import { motion, AnimatePresence } from 'framer-motion';
import type { SOSAlert } from '../../types/sos';

interface EmergencyAlertFeedProps {
  alerts: SOSAlert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onSelectAlert: (alert: SOSAlert) => void;
}

export function EmergencyAlertFeed({
  alerts,
  onAcknowledge,
  onResolve,
  onSelectAlert,
}: EmergencyAlertFeedProps) {
  const activeAlerts = alerts.filter((a) => a.status !== 'resolved');

  return (
    <div className="glass-card p-5.5 border border-slate-200 bg-white shadow-sm rounded-2xl flex flex-col gap-4 w-full">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800">
          🔔 Real-Time Distress Alarm Feed
        </h3>
        <span className="text-[9px] font-sans font-bold text-slate-400 tracking-wide uppercase">
          Telemetry Feed
        </span>
      </div>

      <div className="flex flex-col gap-3.5 max-h-[360px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {activeAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50"
            >
              <span className="text-2xl select-none">📡</span>
              <p className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wide">
                Monitoring channels silent. All units stand down.
              </p>
            </motion.div>
          ) : (
            activeAlerts.map((alert) => {
              const isAck = alert.status === 'acknowledged';
              
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  onClick={() => onSelectAlert(alert)}
                  className={`p-4.5 border rounded-2xl flex flex-col gap-3.5 relative overflow-hidden transition-all duration-300 shadow-sm ${
                    isAck
                      ? 'border-amber-250 bg-amber-50/50 hover:border-amber-400/60'
                      : 'border-red-250 bg-red-50/50 hover:border-red-400/60'
                  }`}
                >
                  {/* Glowing vertical status line */}
                  <div className={`absolute top-0 left-0 bottom-0 w-[4px] ${isAck ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />

                  {/* Header Row */}
                  <div className="flex items-start justify-between pl-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-tight ${isAck ? 'text-amber-800' : 'text-red-800 animate-pulse'}`}>
                          🚨 Distress Signal Detected
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">
                        User: {alert.user_id} • ID: {alert.id}
                      </span>
                    </div>

                    <span className="text-[9px] font-mono font-semibold text-slate-500 bg-white border border-slate-200/60 px-2.5 py-0.5 rounded-full select-none">
                      {alert.timestamp}
                    </span>
                  </div>

                  {/* Details Section */}
                  <div className="grid grid-cols-3 gap-2 pl-2 text-[10px] uppercase font-bold text-slate-500 font-sans">
                    <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 flex flex-col gap-0.5">
                      <span className="text-[7.5px] text-slate-400">Floor Level</span>
                      <span className="text-slate-900 text-xs font-bold">{alert.current_floor}F</span>
                    </div>
                    <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 flex flex-col gap-0.5">
                      <span className="text-[7.5px] text-slate-400">Checkpoint</span>
                      <span className="text-slate-900 text-xs font-bold">{alert.current_node}</span>
                    </div>
                    <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 flex flex-col gap-0.5">
                      <span className="text-[7.5px] text-slate-400">Category</span>
                      <span className={`text-xs font-bold ${isAck ? 'text-amber-700' : 'text-red-700'}`}>
                        {alert.emergency_type}
                      </span>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center gap-2 pl-2 pt-1 border-t border-slate-100 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAlert(alert);
                      }}
                      className="px-4 py-1.5 text-[9px] font-bold uppercase text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-full cursor-pointer transition-all shadow-sm"
                    >
                      Locate
                    </button>
                    
                    {!isAck && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcknowledge(alert.id);
                        }}
                        className="px-4 py-1.5 text-[9px] font-bold uppercase text-white bg-amber-500 hover:bg-amber-600 rounded-full cursor-pointer transition-all shadow-sm"
                      >
                        Acknowledge
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolve(alert.id);
                      }}
                      className="px-4 py-1.5 text-[9px] font-bold uppercase text-white bg-emerald-600 hover:bg-emerald-700 rounded-full cursor-pointer transition-all shadow-sm"
                    >
                      Resolve
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default EmergencyAlertFeed;
