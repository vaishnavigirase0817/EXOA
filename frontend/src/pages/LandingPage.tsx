import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';

export function LandingPage() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Delicate background grid overlay */}
      <div className="animated-grid opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none z-0" />

      {/* Top Navbar */}
      <header className="z-10 px-6 py-5 max-w-5xl w-full mx-auto flex items-center justify-between border-b border-slate-200/50 bg-white/20 backdrop-blur-md">
        <div className="flex items-center gap-2 select-none">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25">
            <span className="text-white font-extrabold text-xs tracking-tighter">EX</span>
          </div>
          <div>
            <span className="text-xs font-bold tracking-tight text-slate-950 block">EXOA</span>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block -mt-0.5">Emergency Navigator</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-[9px] font-bold text-emerald-700 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          System Online
        </span>
      </header>

      {/* Hero Portal Center */}
      <main className="z-10 flex-grow flex items-center justify-center px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-3xl w-full flex flex-col items-center gap-10"
        >
          {/* Main Hero Header */}
          <motion.div variants={itemVariants} className="text-center flex flex-col gap-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950 leading-tight">
              Emergency Navigation<br />Made Simple
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-semibold max-w-md mx-auto">
              Scan. Navigate. Exit safely.
            </p>
          </motion.div>

          {/* Cards Portal */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* User Dashboard Card */}
            <Card hoverable={true} className="p-7 flex flex-col justify-between gap-6 bg-white hover:border-blue-500/30">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl select-none">🗺️</span>
                  <span className="px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                    USER PORTAL
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-950 mt-1">User Dashboard</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                  Scan QR and find the nearest safe exit.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/dashboard')}
                className="w-full font-bold text-[9px] tracking-widest uppercase py-3"
              >
                Open User Dashboard
              </Button>
            </Card>

            {/* Admin Dashboard Card */}
            <Card hoverable={true} className="p-7 flex flex-col justify-between gap-6 bg-white hover:border-red-500/30">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl select-none">🛡️</span>
                  <span className="px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                    CONTROL PORTAL
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-950 mt-1">Admin Dashboard</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                  Monitor hazards and manage evacuations.
                </p>
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/admin')}
                className="w-full font-bold text-[9px] tracking-widest uppercase py-3"
              >
                Open Admin Dashboard
              </Button>
            </Card>
          </motion.div>

          {/* Scan Instructions Link */}
          <motion.div
            variants={itemVariants}
            onClick={() => navigate('/scan')}
            className="flex items-center gap-1.5 text-[9px] text-slate-400 hover:text-slate-800 cursor-pointer select-none transition-all uppercase tracking-widest font-bold border border-slate-200 bg-white shadow-sm px-4 py-2 rounded-full hover:shadow-md"
          >
            <span>📷 DOOR SCANNING INSTRUCTIONS</span>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="z-10 border-t border-slate-200/60 bg-white/40 backdrop-blur-md py-4 px-6 text-center text-[9px] text-slate-400 font-mono tracking-widest select-none">
        <div className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EXOA NAVIGATION SUITE v3.0</span>
          <span>© 2026 EXOA SAFETY NETWORK</span>
        </div>
      </footer>
    </div>
  );
}
