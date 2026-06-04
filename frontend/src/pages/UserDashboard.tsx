import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../hooks/useDashboard';
import { MinimalNavbar } from '../components/dashboard/MinimalNavbar';
import { EmergencyStats } from '../components/dashboard/EmergencyStats';
import { LiveMapCard } from '../components/dashboard/LiveMapCard';
import { useSOS } from '../hooks/useSOS';
import { SOSButton, SOSModal, SOSStatusIndicator } from '../components/sos';
import { useVoiceGuidance } from '../hooks/useVoiceGuidance';
import { VoiceControlPanel } from '../components/voice/VoiceControlPanel';
import { VoiceStatusIndicator } from '../components/voice/VoiceStatusIndicator';
import { QRScanner } from '../components/qr/QRScanner';
import { QRUploadScanner } from '../components/qr/QRUploadScanner';
import { QRResultHandler } from '../components/qr/QRResultHandler';
import { Card } from '../components/ui';
import type { GraphNode } from '../types';

export function UserDashboard() {
  const {
    navState,
    currentNode,
    targetExit,
    wsStatus,
    activeHazards,
    formattedEvacTime,
    isStaircaseTransition,
    isCalculating,
    routeSVGPath,
    setNode,
  } = useDashboard();

  const {
    status: sosStatus,
    activeAlert: sosAlert,
    cooldown: sosCooldown,
    modalOpen: sosModalOpen,
    setModalOpen: setSosModalOpen,
    triggerSOS,
    cancelLocalSOS,
  } = useSOS();

  // Instantiate Real-Time Voice Guidance System
  useVoiceGuidance(navState, currentNode, targetExit, activeHazards.length);

  // QR Scanner Interactive State Machine
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [scanSuccessNode, setScanSuccessNode] = useState<GraphNode | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannerMode, setScannerMode] = useState<'camera' | 'upload'>('camera');


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-x-hidden font-sans">
      {/* Delicate background grids */}
      <div className="animated-grid opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none z-0" />

      {/* Top minimalistic command navbar */}
      <MinimalNavbar wsStatus={wsStatus} currentNodeId={navState.currentNodeId} />

      {/* Main Spacious Command Center */}
      <main className="flex-grow flex items-start justify-center py-8 px-6 lg:px-8 xl:px-12 z-10 relative">
        <div className="max-w-[1400px] w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Spacing Typography & Key Stats */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            
            {/* Hero Copy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-sans font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100/55">
                  🗺️ Spatial Navigation Active
                </span>
                <VoiceStatusIndicator />
              </div>
              <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight text-slate-950 mt-1">
                Scan. Navigate.<br />Exit safely.
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md">
                Evacuation routing calculates the absolute shortest corridors, staircase pathways, and direct exit channels automatically.
              </p>
            </motion.div>

            {/* SOS Active Indicator Banner */}
            <SOSStatusIndicator
              alert={sosAlert}
              localStatus={sosStatus}
              onCancel={cancelLocalSOS}
            />

            {/* Welcome Navigation selector & Control panel */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="w-full"
            >
              <Card hoverable={false} className="p-5.5 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-sans font-bold tracking-wider text-slate-400 uppercase">
                    {isScanningActive ? '📷 Checkpoint Scanner' : '⚙️ Start Evacuation'}
                  </span>
                  <button
                    onClick={() => {
                      setIsScanningActive(!isScanningActive);
                      setScanSuccessNode(null);
                      setScanError(null);
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 rounded-full font-sans text-[9px] font-bold uppercase cursor-pointer transition-all"
                  >
                    {isScanningActive ? 'Simulate Location' : 'Scan QR Code'}
                  </button>
                </div>

                {isScanningActive ? (
                  <div className="flex flex-col gap-4">
                    {/* Mode selector tabs */}
                    <div className="flex border-b border-slate-100 pb-2 gap-4">
                      <button
                        onClick={() => {
                          setScannerMode('camera');
                          setScanSuccessNode(null);
                          setScanError(null);
                        }}
                        className={`pb-1.5 text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all ${
                          scannerMode === 'camera'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Lens Scanner
                      </button>
                      <button
                        onClick={() => {
                          setScannerMode('upload');
                          setScanSuccessNode(null);
                          setScanError(null);
                        }}
                        className={`pb-1.5 text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all ${
                          scannerMode === 'upload'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Upload Scan
                      </button>
                    </div>

                    {/* Scanner components rendering */}
                    {!scanSuccessNode && !scanError && (
                      <div className="w-full">
                        {scannerMode === 'camera' ? (
                          <QRScanner
                            onScanSuccess={(node) => {
                              setScanSuccessNode(node);
                              setNode(node.id);
                            }}
                            onScanError={(err) => setScanError(err)}
                          />
                        ) : (
                          <QRUploadScanner
                            onScanSuccess={(node) => {
                              setScanSuccessNode(node);
                              setNode(node.id);
                            }}
                            onScanError={(err) => setScanError(err)}
                          />
                        )}
                      </div>
                    )}

                    {/* Interactive Scan Response HUD */}
                    <QRResultHandler
                      successNode={scanSuccessNode}
                      scanError={scanError}
                      onReset={() => {
                        setScanSuccessNode(null);
                        setScanError(null);
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="block text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">
                      Simulate Checkpoint Location
                    </label>
                    <div className="relative">
                      <select
                        onChange={(e) => setNode(e.target.value)}
                        value={navState.currentNodeId || ''}
                        className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 px-4 py-3 rounded-full text-xs font-semibold focus:outline-none focus:border-blue-500/50 shadow-sm cursor-pointer transition-all text-slate-700 tracking-wide"
                      >
                        <option value="" disabled>Select active room location...</option>
                        
                        <optgroup label="Ground Floor" className="bg-white">
                          <option value="G_QR_01">Admin Office (GF)</option>
                          <option value="G_QR_02">Workshop West (GF)</option>
                          <option value="G_QR_03">Workshop East (GF)</option>
                          <option value="G_QR_04">East Toilet (GF)</option>
                        </optgroup>
                        
                        <optgroup label="First Floor" className="bg-white">
                          <option value="QR_01">Class Room 1 (1F)</option>
                          <option value="QR_02">Class Room 2 (1F)</option>
                          <option value="QR_03">Class Room 4 (1F)</option>
                          <option value="QR_04">Class Room 5 (1F)</option>
                          <option value="QR_05">Class Room 6 (1F)</option>
                          <option value="QR_06">Class Room 7 (1F)</option>
                          <option value="QR_07">Head Office (1F)</option>
                          <option value="QR_08">Kitchen (1F)</option>
                          <option value="QR_09">Canteen A (1F)</option>
                          <option value="QR_10">Canteen A Side (1F)</option>
                          <option value="QR_11">Girls Room (1F)</option>
                          <option value="QR_12">Unassigned (1F)</option>
                          <option value="QR_13">Physics Lab-1 (1F)</option>
                        </optgroup>
                        
                        <optgroup label="Second Floor" className="bg-white">
                          <option value="S_QR_01">Computer W (2F)</option>
                          <option value="S_QR_02">Computer E (2F)</option>
                          <option value="S_QR_03">Drawing W (2F)</option>
                          <option value="S_QR_04">Drawing E (2F)</option>
                          <option value="S_QR_05">Class Room 1 (2F)</option>
                          <option value="S_QR_06">Class Room 2 (2F)</option>
                          <option value="S_QR_07">Class Room 3 (2F)</option>
                          <option value="S_QR_08">Class Room 4 (2F)</option>
                          <option value="S_QR_09">Class Room 5 (2F)</option>
                          <option value="S_QR_10">HOD Office (2F)</option>
                          <option value="S_QR_11">Upper East (2F)</option>
                        </optgroup>
                        
                        <optgroup label="Third Floor" className="bg-white">
                          <option value="T_QR_01">Seminar Room 1 (3F)</option>
                          <option value="T_QR_02">Staff Pantry (3F)</option>
                          <option value="T_QR_03">Staff Toilet (3F)</option>
                          <option value="T_QR_04">Language Lab (3F)</option>
                          <option value="T_QR_05">Tutorial Room 1 (3F)</option>
                          <option value="T_QR_06">Library West (3F)</option>
                          <option value="T_QR_07">Library East (3F)</option>
                          <option value="T_QR_08">Class Room 6 (3F)</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                )}

                {/* Staircase transition overlay */}
                {isStaircaseTransition && targetExit && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 border border-amber-200 bg-amber-50 rounded-xl flex flex-col gap-2 mt-2"
                  >
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-amber-700">
                      🪜 Staircase Reached
                    </span>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      You have reached a staircase hub. Switch maps to navigate downwards.
                    </p>
                    <button
                      onClick={() => {
                        let targetStair = '';
                        if (currentNode?.floor === 3) {
                          targetStair = targetExit.id === 'T_STAIR_01' ? 'S_STAIR_01' : 'S_STAIR_02';
                        } else if (currentNode?.floor === 2) {
                          targetStair = targetExit.id === 'S_STAIR_01' ? 'STAIR_01' : 'STAIR_02';
                        } else if (currentNode?.floor === 1) {
                          targetStair = currentNode.id === 'STAIR_01' ? 'G_STAIR_01' : 'G_STAIR_02';
                        }
                        if (targetStair) setNode(targetStair);
                      }}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] tracking-wider uppercase rounded-full shadow-sm cursor-pointer transition-all border border-transparent mt-1"
                    >
                      Transition Floor Plan
                    </button>
                  </motion.div>
                )}
              </Card>
            </motion.div>

            {/* Core Telemetry metrics card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full"
            >
              <Card hoverable={false} className="p-5.5 bg-white border border-slate-200/80 shadow-sm rounded-2xl">
                <EmergencyStats
                  currentNode={currentNode}
                  targetExit={targetExit}
                  distance={navState.distance}
                  formattedTime={formattedEvacTime}
                  isCalculating={isCalculating}
                />
              </Card>
            </motion.div>

            {/* Active Hazard Indicators */}
            {activeHazards.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2.5 px-4.5 py-3 rounded-xl border border-red-200 bg-red-50"
              >
                <span className="text-sm select-none">🚨</span>
                <span className="text-[10px] font-sans font-bold tracking-wider text-red-700 uppercase">
                  {activeHazards.length} Hallway Blocks Detected • Route Recalculating
                </span>
              </motion.div>
            )}
          </div>

          {/* Right Column: Large centered evacuation map preview */}
          <div className="lg:col-span-7 w-full z-10">
            <LiveMapCard
              navState={navState}
              routeSVGPath={routeSVGPath}
              isCalculating={isCalculating}
              floorLevel={currentNode?.floor ?? 1}
            />
          </div>

        </div>
      </main>

      {/* Cinematic Operations Footer */}
      <footer className="z-40 border-t border-slate-200/60 bg-white/60 backdrop-blur-md py-4 px-6 text-center text-[9px] text-slate-400 font-mono tracking-widest select-none">
        <div className="max-w-[1400px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EXOA ENGINE v3.0 • OPERATIONS SURVEILLANCE FEED</span>
          <span className="text-slate-400 font-bold">WEBSOCKET: {wsStatus.toUpperCase()}</span>
          <span>© 2026 EXOA SAFETY PLATFORM</span>
        </div>
      </footer>

      {/* Floating emergency SOS button and modal */}
      <SOSButton
        status={sosStatus}
        cooldown={sosCooldown}
        onClick={() => setSosModalOpen(true)}
      />

      <SOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        onConfirm={(type) =>
          triggerSOS(
            navState.currentNodeId || 'QR_01',
            currentNode?.floor || 1,
            navState.status,
            type
          )
        }
      />

      {/* Floating Compact Voice Guidance Control Widget */}
      <VoiceControlPanel />
    </div>
  );
}
