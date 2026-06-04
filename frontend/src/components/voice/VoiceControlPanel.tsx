import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceGuidanceService, type VoiceSettings } from '../../services/voiceGuidance';

export function VoiceControlPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: true,
    volume: 0.8,
    rate: 1.0,
    voiceName: '',
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const unsubscribe = voiceGuidanceService.addListener((updatedSettings) => {
      setSettings(updatedSettings);
    });

    const timer = setTimeout(() => {
      setVoices(voiceGuidanceService.getVoices());
    }, 500);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleToggle = () => {
    voiceGuidanceService.updateSettings({ enabled: !settings.enabled });
    if (settings.enabled) {
      voiceGuidanceService.cancel();
    } else {
      voiceGuidanceService.speak("Voice guidance enabled.");
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setSettings((prev) => ({ ...prev, volume }));
    voiceGuidanceService.updateSettings({ volume });
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value);
    setSettings((prev) => ({ ...prev, rate }));
    voiceGuidanceService.updateSettings({ rate });
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceName = e.target.value;
    setSettings((prev) => ({ ...prev, voiceName }));
    voiceGuidanceService.updateSettings({ voiceName });
    setTimeout(() => {
      voiceGuidanceService.speak("Voice guidance active.", true);
    }, 100);
  };

  const isBrowserSupported = typeof window !== 'undefined' && !!window.speechSynthesis;

  if (!isBrowserSupported) {
    return (
      <div className="fixed bottom-40 right-6 z-50">
        <button
          disabled
          className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center cursor-not-allowed opacity-50 shadow-md"
          title="Browser Speech API not supported"
        >
          🔇
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-40 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-72 glass-card p-5 border border-slate-200 bg-white/95 backdrop-blur-md shadow-lg rounded-2xl flex flex-col gap-4 text-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">🔊 Voice Guidance</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Voice Alerts
              </span>
              <button
                onClick={handleToggle}
                className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                  settings.enabled ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${
                    settings.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {settings.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-3.5 overflow-hidden"
              >
                {/* Voice Selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-sans font-bold uppercase tracking-wider text-slate-400">
                    Voice Type
                  </label>
                  <select
                    value={settings.voiceName}
                    onChange={handleVoiceChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Default System Voice</option>
                    {voices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Volume Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[9px] font-sans font-bold uppercase tracking-wider text-slate-400">
                    <span>Volume</span>
                    <span className="text-slate-600 font-semibold">{Math.round(settings.volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Speed Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[9px] font-sans font-bold uppercase tracking-wider text-slate-400">
                    <span>Speech Speed</span>
                    <span className="text-slate-600 font-semibold">{settings.rate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.rate}
                    onChange={handleRateChange}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md border cursor-pointer transition-all ${
          isOpen
            ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/20'
            : settings.enabled
            ? 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300'
            : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
        }`}
        title="Voice Guidance Settings"
      >
        <span className="text-lg select-none">{settings.enabled ? '🔊' : '🔇'}</span>
      </button>
    </div>
  );
}
