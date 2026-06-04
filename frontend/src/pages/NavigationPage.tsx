import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FloorMap } from '../components/FloorMap';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { useNavigation } from '../hooks/useNavigation';
import { getNodeById } from '../data/graphData';
import { useSOS } from '../hooks/useSOS';
import { SOSButton, SOSModal, SOSStatusIndicator } from '../components/sos';

/**
 * NavigationPage — Main page for indoor emergency navigation.
 * Reads ?node=QR_XX from URL (set by physical QR codes), calculates shortest exit route.
 */
export function NavigationPage() {
  const { navState, isCalculating, routeSVGPath } = useNavigation();
  const navigate = useNavigate();

  const {
    status: sosStatus,
    activeAlert: sosAlert,
    cooldown: sosCooldown,
    modalOpen: sosModalOpen,
    setModalOpen: setSosModalOpen,
    triggerSOS,
    cancelLocalSOS,
  } = useSOS();

  const currentNodeData = navState.currentNodeId
    ? getNodeById(navState.currentNodeId)
    : null;
  const exitNodeData = navState.targetExitId
    ? getNodeById(navState.targetExitId)
    : null;

  return (
    <div className="flex flex-col h-screen bg-[var(--color-exoa-bg)]">
      {/* Top Header Bar */}
      <motion.header
        className="bg-[var(--color-exoa-surface)] border-b border-[var(--color-exoa-border)] px-4 py-2.5 z-40 flex items-center justify-between"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-exoa-accent)] to-[#6366f1] flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/')}
            >
              <span className="text-white font-bold text-sm">E</span>
            </motion.div>
            <div>
              <h1 className="text-sm font-bold text-[var(--color-exoa-text)] tracking-wide">
                EXOA
              </h1>
              <p className="text-[8px] text-[var(--color-exoa-text-dim)] uppercase tracking-widest">
                Emergency Navigation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Change Room Selector */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                navigate(`/nav?node=${e.target.value}`);
              }
            }}
            value={navState.currentNodeId || ""}
            className="bg-[var(--color-exoa-surface-2)] text-[var(--color-exoa-text)] border border-[var(--color-exoa-border)] px-2 py-0.5 rounded-lg text-[9px] font-semibold focus:outline-none focus:border-[var(--color-exoa-accent)] cursor-pointer text-center max-w-[90px] sm:max-w-none"
          >
            <option value="" disabled>Change...</option>
            
            <optgroup label="Ground Floor">
              <option value="G_QR_01">Admin Office (GF)</option>
              <option value="G_QR_02">Workshop W (GF)</option>
              <option value="G_QR_03">Workshop E (GF)</option>
              <option value="G_QR_04">East Toilet (GF)</option>
            </optgroup>
            
            <optgroup label="First Floor">
              <option value="QR_01">Class 1 (1F)</option>
              <option value="QR_02">Class 2 (1F)</option>
              <option value="QR_03">Class 4 (1F)</option>
              <option value="QR_04">Class 5 (1F)</option>
              <option value="QR_05">Class 6 (1F)</option>
              <option value="QR_06">Class 7 (1F)</option>
              <option value="QR_07">Head Office (1F)</option>
              <option value="QR_08">Kitchen (1F)</option>
              <option value="QR_09">Canteen A (1F)</option>
              <option value="QR_10">Canteen A Side (1F)</option>
              <option value="QR_11">Girls Room (1F)</option>
              <option value="QR_12">Unassigned (1F)</option>
              <option value="QR_13">Physics Lab (1F)</option>
            </optgroup>
            
            <optgroup label="Second Floor">
              <option value="S_QR_01">Computer W (2F)</option>
              <option value="S_QR_02">Computer E (2F)</option>
              <option value="S_QR_03">Drawing W (2F)</option>
              <option value="S_QR_04">Drawing E (2F)</option>
              <option value="S_QR_05">Class 1 (2F)</option>
              <option value="S_QR_06">Class 2 (2F)</option>
              <option value="S_QR_07">Class 3 (2F)</option>
              <option value="S_QR_08">Class 4 (2F)</option>
              <option value="S_QR_09">Class 5 (2F)</option>
              <option value="S_QR_10">HOD Office (2F)</option>
              <option value="S_QR_11">Upper East (2F)</option>
            </optgroup>
            
            <optgroup label="Third Floor">
              <option value="T_QR_01">Seminar 1 (3F)</option>
              <option value="T_QR_02">Staff Pantry (3F)</option>
              <option value="T_QR_03">Staff Toilet (3F)</option>
              <option value="T_QR_04">Language Lab (3F)</option>
              <option value="T_QR_05">Tutorial 1 (3F)</option>
              <option value="T_QR_06">Library W (3F)</option>
              <option value="T_QR_07">Library E (3F)</option>
              <option value="T_QR_08">Class 6 (3F)</option>
            </optgroup>
          </select>

          <div className="glass-card px-2 py-1 text-[9px] text-[var(--color-exoa-text-muted)] font-mono flex-shrink-0">
            {currentNodeData ? `Floor ${currentNodeData.floor}` : 'Floor 1'}
          </div>
          <motion.div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              navState.status === 'evacuation'
                ? 'bg-[var(--color-exoa-danger)]'
                : navState.status === 'alert'
                  ? 'bg-[var(--color-exoa-warning)]'
                  : 'bg-[var(--color-exoa-success)]'
            }`}
            animate={
              navState.status === 'evacuation'
                ? { opacity: [1, 0.3, 1] }
                : {}
            }
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </motion.header>

      {/* Emergency Status Banner */}
      <EmergencyBanner
        status={navState.status}
        currentNode={navState.currentNodeId}
        exitNode={navState.targetExitId}
        distance={navState.distance}
        nodeLabel={currentNodeData?.label}
        exitLabel={exitNodeData?.label}
        floor={currentNodeData?.floor}
      />

      {/* SOS Active Indicator Banner */}
      {sosStatus !== 'idle' && (
        <div className="px-4 py-2 bg-[var(--color-exoa-bg)] border-b border-[var(--color-exoa-border)]">
          <SOSStatusIndicator
            alert={sosAlert}
            localStatus={sosStatus}
            onCancel={cancelLocalSOS}
          />
        </div>
      )}

      {/* Floor Map */}
      <FloorMap
        navState={navState}
        routeSVGPath={routeSVGPath}
        isCalculating={isCalculating}
      />

      {/* Bottom Status Bar */}
      <motion.footer
        className="bg-[var(--color-exoa-surface)] border-t border-[var(--color-exoa-border)] px-4 py-1.5 flex items-center justify-between text-[10px] text-[var(--color-exoa-text-dim)] z-40"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span>EXOA v1.0</span>
        <span className="font-mono">
          {navState.currentNodeId
            ? `Node: ${navState.currentNodeId}`
            : 'No active node'}
        </span>
        <span>
          {navState.path.length > 0
            ? `${navState.path.length} waypoints`
            : 'Idle'}
        </span>
      </motion.footer>

      {/* Floating emergency SOS system button and confirmation modal */}
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
            currentNodeData?.floor || 1,
            navState.status,
            type
          )
        }
      />
    </div>
  );
}
