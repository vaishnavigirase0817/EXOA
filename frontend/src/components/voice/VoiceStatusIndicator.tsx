import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { voiceGuidanceService, type VoiceSettings } from '../../services/voiceGuidance';

export function VoiceStatusIndicator() {
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: true,
    volume: 0.8,
    rate: 1.0,
    voiceName: '',
  });

  useEffect(() => {
    const unsubscribe = voiceGuidanceService.addListener((updatedSettings) => {
      setSettings(updatedSettings);
    });
    return () => unsubscribe();
  }, []);

  if (!settings.enabled) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/60 rounded-full select-none shadow-sm">
      {/* Mini pulsing audio waves */}
      <div className="flex items-end gap-0.5 h-2.5 w-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-[2px] bg-blue-600 rounded-full"
            animate={{
              height: ['30%', '100%', '30%'],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <span className="text-[9px] font-sans font-bold text-blue-700 uppercase tracking-tight">
        Voice Active
      </span>
    </div>
  );
}

export default VoiceStatusIndicator;
