import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { websocketService } from '../services/websocket';
import type { ConnectionStatus } from '../services/websocket';
import { navigationEngine } from '../services/NavigationEngine';
import { buildingGraph } from '../data/graphData';
import { SystemMetrics } from '../components/admin/SystemMetrics';
import { HazardControlPanel } from '../components/admin/HazardControlPanel';
import { FloorMap } from '../components/FloorMap';
import { sosService } from '../services/sosService';
import type { SOSAlert } from '../types/sos';
import { ActiveSOSPanel, EmergencyAlertFeed } from '../components/sos';
import { QRManagementPanel } from '../components/admin/qr/QRManagementPanel';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'radar' | 'qr'>('radar');
  
  // Floor and map states
  const [floorLevel, setFloorLevel] = useState<number>(1);
  const [triggerRender, setTriggerRender] = useState<number>(0);
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>('disconnected');
  
  // Broadcast alert input
  const [broadcastText, setBroadcastText] = useState<string>('');
  const [broadcastLog, setBroadcastLog] = useState<string | null>(null);

  // Emergency SOS states
  const [activeSOSAlerts, setActiveSOSAlerts] = useState<SOSAlert[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const selectedAlert = activeSOSAlerts.find((a) => a.id === selectedAlertId) || null;

  // Administrative log feed
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: '23:02:11', message: 'EXOA Safety Console Core Initialized.', type: 'info' },
    { timestamp: '23:02:12', message: 'Listening to building sensor array pings.', type: 'info' },
  ]);

  // Connect websocket status listener
  useEffect(() => {
    websocketService.connect();

    sosService.getActiveSOS().then((alerts) => {
      setActiveSOSAlerts(alerts);
    });

    const unsubscribe = websocketService.addStatusListener((status) => {
      setWsStatus(status);
      addLog(`WebSocket connection status updated: ${status.toUpperCase()}`, status === 'connected' ? 'success' : 'warning');
    });

    const unsubscribeMsg = websocketService.addListener((data) => {
      if (data.type === 'edge_blocked') {
        addLog(`External Block Event: Edge ${data.from} ↔ ${data.to} blocked.`, 'warning');
        setTriggerRender(prev => prev + 1);
      } else if (data.type === 'edge_unblocked') {
        addLog(`External Unblock Event: Edge ${data.from} ↔ ${data.to} unblocked.`, 'success');
        setTriggerRender(prev => prev + 1);
      } else if (data.type === 'sos_triggered') {
        const newAlert = data.data;
        setActiveSOSAlerts((prev) => [newAlert, ...prev.filter((a) => a.id !== newAlert.id)]);
        addLog(`🚨 RED ALERT: Distress SOS signal triggered by ${newAlert.user_id} at Checkpoint ${newAlert.current_node} (Floor ${newAlert.current_floor})!`, 'error');
        setFloorLevel(newAlert.current_floor);
        setSelectedAlertId(newAlert.id);
      } else if (data.type === 'sos_acknowledged') {
        const ackAlert = data.data;
        setActiveSOSAlerts((prev) => prev.map((a) => (a.id === ackAlert.id ? ackAlert : a)));
        addLog(`⚠️ Admin response initiated for distress alert ID: ${ackAlert.id} (${ackAlert.user_id}).`, 'warning');
      } else if (data.type === 'sos_resolved') {
        const resAlert = data.data;
        setActiveSOSAlerts((prev) => prev.filter((a) => a.id !== resAlert.id));
        addLog(`✅ Distress alert resolved for ${resAlert.user_id} at Checkpoint ${resAlert.current_node}.`, 'success');
        setSelectedAlertId((prev) => (prev === resAlert.id ? null : prev));
      }
    });

    return () => {
      unsubscribe();
      unsubscribeMsg();
    };
  }, []);

  const addLog = (message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    const time = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [{ timestamp: time, message, type }, ...prev]);
  };

  const handleAcknowledgeSOS = async (alertId: string) => {
    try {
      await sosService.acknowledgeSOS(alertId);
    } catch (e) {
      addLog(`Failed to send acknowledgment for SOS signal ${alertId}.`, 'error');
    }
  };

  const handleResolveSOS = async (alertId: string) => {
    try {
      await sosService.resolveSOS(alertId);
    } catch (e) {
      addLog(`Failed to resolve SOS signal ${alertId}.`, 'error');
    }
  };

  const handleSelectSOSAlert = (alert: SOSAlert) => {
    setSelectedAlertId(alert.id);
    setFloorLevel(alert.current_floor);
    addLog(`Surveillance camera focused on check-point: ${alert.current_node} (Floor ${alert.current_floor}).`, 'info');
  };

  const getApiBase = () => {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${protocol}//${host}:8000`;
    }
    return `${protocol}//${window.location.host}`;
  };

  const handleBlockEdge = async (fromId: string, toId: string) => {
    navigationEngine.blockEdge(fromId, toId);
    addLog(`Block corridor action initiated: ${fromId} ↔ ${toId}`, 'warning');
    
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/block-edge?from_id=${fromId}&to_id=${toId}`, {
        method: 'POST',
      });
      if (res.ok) {
        addLog(`FastAPI broadcast corridor block: ${fromId} ↔ ${toId} completed.`, 'success');
      }
    } catch (e) {
      addLog(`Local Corridor Block applied. Dev server link bypass.`, 'info');
    }
    
    setTriggerRender(prev => prev + 1);
  };

  const handleUnblockEdge = async (fromId: string, toId: string) => {
    navigationEngine.unblockEdge(fromId, toId);
    addLog(`Unblock corridor action initiated: ${fromId} ↔ ${toId}`, 'info');
    
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/api/unblock-edge?from_id=${fromId}&to_id=${toId}`, {
        method: 'POST',
      });
      if (res.ok) {
        addLog(`FastAPI broadcast corridor unblock: ${fromId} ↔ ${toId} completed.`, 'success');
      }
    } catch (e) {
      addLog(`Local Corridor Unblock applied. Dev server link bypass.`, 'info');
    }
    
    setTriggerRender(prev => prev + 1);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234' || passcode === 'admin' || passcode === '') {
      setIsAuthenticated(true);
      addLog('Passcode verified. Level Alpha access granted.', 'success');
    } else {
      setAuthError('INVALID ACCESS PASSCODE. ACCESS DENIED.');
      addLog('Failed authentication attempt. Access denied.', 'error');
    }
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setBroadcastLog(`BROADCAST ACTIVE: "${broadcastText}"`);
    addLog(`Emergency Broadcast Transmitted: "${broadcastText}"`, 'warning');
    setBroadcastText('');
    setTimeout(() => {
      setBroadcastLog(null);
    }, 6000);
  };

  const getDummyNodeForFloor = (floor: number) => {
    if (floor === 0) return 'G_QR_01';
    if (floor === 2) return 'S_QR_01';
    if (floor === 3) return 'T_QR_01';
    return 'QR_01';
  };

  const activeDummyNode = getDummyNodeForFloor(floorLevel);
  const adminNavState = {
    currentNodeId: activeDummyNode,
    targetExitId: null,
    path: [],
    distance: 0,
    status: 'normal' as const,
    isNavigating: false,
  };

  const totalBlockedCount = buildingGraph.edges.filter((e) => e.blocked).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-x-hidden font-sans">
      {/* Background Grids */}
      <div className="animated-grid opacity-40" />

      {/* Top Navbar */}
      <header className="z-40 w-full px-6 py-4.5 flex items-center justify-between border-b border-slate-200/60 bg-white/65 backdrop-blur-md relative">
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25">
            <span className="text-white font-extrabold text-sm tracking-tighter">EX</span>
          </div>
          <div>
            <span className="text-xs font-extrabold tracking-tight text-slate-950 block">
              EXOA ADMIN
            </span>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block -mt-0.5">
              Operations Control Center
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-4 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold tracking-wider uppercase shadow-sm transition-all cursor-pointer"
        >
          <span>EXIT COMMAND</span>
        </button>
      </header>

      {/* Authentication Prompt Shield */}
      <AnimatePresence>
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="max-w-md w-full bg-white p-8 border border-slate-200 shadow-xl rounded-2xl flex flex-col gap-6"
            >
              <div className="text-center flex flex-col gap-1 pb-4 border-b border-slate-100">
                <span className="text-[9px] font-sans font-bold tracking-wider text-rose-600 bg-rose-50 border border-rose-100/50 py-1 px-3 rounded-full mx-auto">
                  🚨 Secure Encryption Access Point
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-3">
                  Operations Privilege
                </h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
                  Authorization Level: Alpha Required
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="block text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">
                    Enter Security Passcode
                  </label>
                  <input
                    type="password"
                    placeholder="Enter control passcode..."
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 px-4 py-3 rounded-full text-xs font-semibold focus:outline-none focus:border-blue-500 shadow-inner text-center tracking-widest"
                    autoFocus
                  />
                  <p className="text-[8px] text-center text-slate-400 uppercase font-semibold mt-1.5">
                    Tip: Press Enter or submit empty password to log in directly.
                  </p>
                </div>

                {authError && (
                  <div className="text-[9px] text-rose-600 font-sans font-bold text-center tracking-wide uppercase border border-rose-200 bg-rose-50 py-2 rounded-xl">
                    ⚠️ {authError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] tracking-wider uppercase rounded-full shadow-md cursor-pointer transition-all border border-transparent"
                >
                  Authenticate Secure Link
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Admin Console Layout */}
      {isAuthenticated && (
        <main className="flex-grow p-6 lg:p-8 flex flex-col gap-8 max-w-[1500px] w-full mx-auto z-10 relative items-start">
          
          {/* Top telemetry metrics row */}
          <SystemMetrics
            wsStatus={wsStatus}
            blockedCount={totalBlockedCount}
            simulatedUsers={12}
            systemStatus={totalBlockedCount > 0 ? 'evacuation' : 'normal'}
          />

          {/* Dashboard Navigation Tabs */}
          <div className="flex border-b border-slate-200 w-full pb-2 gap-6 select-none">
            <button
              onClick={() => setActiveTab('radar')}
              className={`pb-2 text-[10px] font-sans font-bold tracking-wider uppercase cursor-pointer transition-all ${
                activeTab === 'radar'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              🚨 Operations Radar
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`pb-2 text-[10px] font-sans font-bold tracking-wider uppercase cursor-pointer transition-all ${
                activeTab === 'qr'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              📷 QR Code Registry
            </button>
          </div>

          {activeTab === 'radar' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
              
              {/* Left: Hazard Controls & Logs */}
              <div className="lg:col-span-5 flex flex-col gap-6 w-full">
                {/* Floor Switch Selector */}
                <div className="glass-card p-5.5 border border-slate-200 bg-white shadow-sm rounded-2xl flex flex-col gap-4">
                  <label className="block text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">
                    Switch Surveillance Floor Level
                  </label>
                  <select
                    value={floorLevel}
                    onChange={(e) => setFloorLevel(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-full text-xs font-semibold focus:outline-none focus:border-blue-500/50 shadow-sm cursor-pointer tracking-wide appearance-none text-slate-700"
                  >
                    <option value={0}>Ground Floor (GF)</option>
                    <option value={1}>Floor Level 1 (1F)</option>
                    <option value={2}>Floor Level 2 (2F)</option>
                    <option value={3}>Floor Level 3 (3F)</option>
                  </select>
                </div>

                {/* Blocking / Unblocking actions */}
                <HazardControlPanel
                  edges={buildingGraph.edges}
                  onBlock={handleBlockEdge}
                  onUnblock={handleUnblockEdge}
                  floor={floorLevel}
                />

                {/* Emergency broadcast simulator */}
                <div className="glass-card p-5.5 border border-slate-200 bg-white shadow-sm rounded-2xl flex flex-col gap-4">
                  <label className="block text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">
                    Simulate Emergency Broadcast Override
                  </label>
                  <form onSubmit={handleBroadcastSubmit} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Type safety alert message..."
                      value={broadcastText}
                      onChange={(e) => setBroadcastText(e.target.value)}
                      className="flex-grow bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-full text-xs font-semibold focus:outline-none focus:border-blue-500/50 shadow-inner placeholder-slate-400 text-slate-700"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] tracking-wider uppercase rounded-full shadow-sm cursor-pointer transition-all border border-transparent"
                    >
                      SEND
                    </button>
                  </form>
                </div>

                {/* Real-time active emergency distress panel */}
                <ActiveSOSPanel
                  alerts={activeSOSAlerts}
                  onSelectAlert={handleSelectSOSAlert}
                  selectedAlertId={selectedAlertId}
                />
              </div>

              {/* Right: Map and Logging console */}
              <div className="lg:col-span-7 flex flex-col gap-6 w-full">
                
                {/* Floor plan rendering */}
                <div
                  key={`${floorLevel}-${triggerRender}`}
                  className="glass-card overflow-hidden border border-slate-200 bg-white flex flex-col h-[480px] xl:h-[580px] shadow-sm relative rounded-2xl"
                >
                  {/* Map telemetry label overlays */}
                  <div className="absolute top-6 left-6 z-20 flex items-center gap-2 pointer-events-none select-none">
                    <div className="px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-md text-[9px] font-sans font-bold text-slate-800 tracking-wider uppercase shadow-sm">
                      🛡️ Admin Active Graph
                    </div>
                    <div className="px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-md text-[9px] font-sans font-bold text-blue-600 tracking-wider uppercase shadow-sm">
                      Level {floorLevel === 0 ? 'Ground' : floorLevel}
                    </div>
                  </div>

                  <div className="absolute top-6 right-6 z-20 pointer-events-none select-none hidden sm:block">
                    <div className="px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-md text-[9px] font-sans font-semibold text-slate-500 tracking-tight shadow-sm">
                      Drag to Pan • Zoom Active
                    </div>
                  </div>

                  <div className="flex-grow relative bg-slate-50">
                    <FloorMap
                      navState={selectedAlert ? {
                        currentNodeId: selectedAlert.current_node,
                        targetExitId: null,
                        path: [],
                        distance: 0,
                        status: 'evacuation',
                        isNavigating: true
                      } : adminNavState}
                      routeSVGPath=""
                      isCalculating={false}
                      activeSOSAlerts={activeSOSAlerts}
                    />
                  </div>
                </div>

                {/* Real-time Emergency SOS Alerts Feed */}
                <EmergencyAlertFeed
                  alerts={activeSOSAlerts}
                  onAcknowledge={handleAcknowledgeSOS}
                  onResolve={handleResolveSOS}
                  onSelectAlert={handleSelectSOSAlert}
                />

                {/* Logs Console Feed */}
                <div className="glass-card p-5.5 border border-slate-200 bg-white shadow-sm rounded-2xl flex flex-col gap-4">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800">
                      📜 Real-Time Security Operations Log
                    </h3>
                    <span className="text-[9px] font-sans font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
                      Surveillance Stable
                    </span>
                  </div>

                  {/* Broadcast Banner indicator */}
                  {broadcastLog && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 border border-red-200 bg-red-50 rounded-xl text-center text-[10px] font-bold text-red-700 tracking-wide uppercase animate-pulse"
                    >
                      ⚠️ {broadcastLog}
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {logs.map((log, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-[10px] font-mono leading-relaxed"
                      >
                        <span className="text-slate-400">[{log.timestamp}]</span>
                        <span
                          className={
                            log.type === 'success'
                              ? 'text-emerald-600 font-bold'
                              : log.type === 'warning'
                              ? 'text-amber-600 font-bold'
                              : log.type === 'error'
                              ? 'text-rose-600 font-bold'
                              : 'text-slate-650'
                          }
                        >
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card p-8 border border-slate-200 bg-white shadow-sm w-full rounded-2xl">
              <QRManagementPanel />
            </div>
          )}
        </main>
      )}

      {/* Cinematic Operations Footer */}
      <footer className="z-40 border-t border-slate-200/60 bg-white/60 backdrop-blur-md py-4 px-6 text-center text-[9px] text-slate-400 font-mono tracking-widest select-none">
        <div className="max-w-[1500px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EXOA ADMIN v3.0 • OPERATIONS LINK SECURE</span>
          <span className="text-slate-450 font-bold">WEBSOCKET: {wsStatus.toUpperCase()}</span>
          <span>© 2026 EXOA OPERATIONS NETWORK</span>
        </div>
      </footer>
    </div>
  );
}
