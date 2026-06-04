import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getNodesByType } from '../data/graphData';

/**
 * HomePage — Landing page for EXOA emergency navigation.
 * Instructs users to scan QR codes on room doors with their phone camera.
 * Each QR code contains a URL like /nav?node=QR_01 that opens the route directly.
 */
export function HomePage() {
  const navigate = useNavigate();
  const qrNodes = getNodesByType('qr');

  return (
    <div className="min-h-screen bg-[var(--color-exoa-bg)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid effect */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-exoa-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-exoa-accent) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-exoa-accent)] to-[#6366f1] flex items-center justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          style={{ boxShadow: '0 0 40px var(--color-exoa-accent-glow)' }}
        >
          <span className="text-white font-extrabold text-3xl">E</span>
        </motion.div>

        <h1 className="text-3xl font-extrabold text-[var(--color-exoa-text)] tracking-tight mb-1">
          EXOA
        </h1>
        <p className="text-sm text-[var(--color-exoa-text-muted)] mb-2">
          Indoor Emergency Navigation
        </p>
        <p className="text-xs text-[var(--color-exoa-text-dim)] mb-8 max-w-xs">
          Scan the QR code on any room door with your phone camera.
          The shortest evacuation route to the nearest exit will be shown automatically.
        </p>

        {/* How it works */}
        <div className="glass-card p-5 w-full max-w-xs text-left mb-6">
          <div className="text-[10px] text-[var(--color-exoa-text-dim)] uppercase tracking-widest mb-3 font-semibold text-center">
            How It Works
          </div>
          <div className="flex flex-col gap-3">
            {[
              { step: '1', text: 'Point your phone camera at a room door QR code' },
              { step: '2', text: 'Tap the link that appears to open EXOA' },
              { step: '3', text: 'Your location is identified and the shortest exit route is shown' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--color-exoa-accent)]/20 flex items-center justify-center text-[var(--color-exoa-accent)] text-xs font-bold flex-shrink-0">
                  {item.step}
                </div>
                <span className="text-xs text-[var(--color-exoa-text-muted)] leading-relaxed">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Demo Select Box */}
        <div className="w-full max-w-xs mb-6">
          <label className="block text-[10px] text-[var(--color-exoa-text-dim)] uppercase tracking-wider mb-2 font-semibold text-center">
            🚀 Quick Demo Room Selector
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                navigate(`/nav?node=${e.target.value}`);
              }
            }}
            className="w-full bg-[var(--color-exoa-surface-2)] text-[var(--color-exoa-text)] border border-[var(--color-exoa-border)] px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-[var(--color-exoa-accent)] shadow-lg cursor-pointer text-center"
            defaultValue=""
          >
            <option value="" disabled>Select a room to test pathfinding...</option>
            
            <optgroup label="Ground Floor" className="text-[var(--color-exoa-text-dim)] text-left">
              <option value="G_QR_01">Admin Office (GF)</option>
              <option value="G_QR_02">Workshop West (GF)</option>
              <option value="G_QR_03">Workshop East (GF)</option>
              <option value="G_QR_04">East Toilet (GF)</option>
            </optgroup>
            
            <optgroup label="First Floor" className="text-[var(--color-exoa-text-dim)] text-left">
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
              <option value="QR_12">Unassigned Room (1F)</option>
              <option value="QR_13">Physics Lab-1 (1F)</option>
            </optgroup>
            
            <optgroup label="Second Floor" className="text-[var(--color-exoa-text-dim)] text-left">
              <option value="S_QR_01">Computer Center W (2F)</option>
              <option value="S_QR_02">Computer Center E (2F)</option>
              <option value="S_QR_03">Drawing Hall W (2F)</option>
              <option value="S_QR_04">Drawing Hall E (2F)</option>
              <option value="S_QR_05">Class Room 1 (2F)</option>
              <option value="S_QR_06">Class Room 2 (2F)</option>
              <option value="S_QR_07">Class Room 3 (2F)</option>
              <option value="S_QR_08">Class Room 4 (2F)</option>
              <option value="S_QR_09">Class Room 5 (2F)</option>
              <option value="S_QR_10">HOD Office (2F)</option>
              <option value="S_QR_11">Upper East Room (2F)</option>
            </optgroup>
            
            <optgroup label="Third Floor" className="text-[var(--color-exoa-text-dim)] text-left">
              <option value="T_QR_01">Seminar Room - 1 (3F)</option>
              <option value="T_QR_02">Staff Pantry (3F)</option>
              <option value="T_QR_03">Staff Toilet (3F)</option>
              <option value="T_QR_04">Language Laboratory (3F)</option>
              <option value="T_QR_05">Tutorial Room - 1 (3F)</option>
              <option value="T_QR_06">Library West (3F)</option>
              <option value="T_QR_07">Library East (3F)</option>
              <option value="T_QR_08">Class Room - 6 (3F)</option>
            </optgroup>
          </select>
        </div>

        {/* View map link */}
        <motion.button
          onClick={() => navigate('/nav')}
          className="text-xs text-[var(--color-exoa-accent)] hover:text-[var(--color-exoa-accent-hover)] underline underline-offset-2 cursor-pointer bg-transparent border-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          id="view-map-btn"
        >
          View floor map without scanning
        </motion.button>
      </motion.div>

      {/* Status badges */}
      <motion.div
        className="absolute bottom-6 flex items-center gap-3 text-[10px] text-[var(--color-exoa-text-dim)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="glass-card px-3 py-1">v1.0</span>
        <span className="glass-card px-3 py-1">Floor 1</span>
        <span className="glass-card px-3 py-1">{qrNodes.length} QR Nodes</span>
      </motion.div>
    </div>
  );
}
