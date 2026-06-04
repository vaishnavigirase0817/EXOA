import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';
import { qrScannerService } from '../../services/qrScannerService';
import type { GraphNode } from '../../types';

interface QRScannerProps {
  onScanSuccess: (node: GraphNode) => void;
  onScanError: (error: string) => void;
}

export function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isLoading, setIsLoading] = useState(false);
  
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = 'exoa-qr-video-container';

  useEffect(() => {
    // Instantiate the scanner when component mounts
    qrScannerRef.current = new Html5Qrcode(scannerId);

    // Automatically start scanning
    startCamera();

    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    if (!qrScannerRef.current) return;
    setIsLoading(true);

    try {
      // Stop any running camera first just in case
      if (qrScannerRef.current.isScanning) {
        await qrScannerRef.current.stop();
      }

      await qrScannerRef.current.start(
        { facingMode },
        {
          fps: 12,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          },
        },
        (decodedText) => {
          handleDecodedValue(decodedText);
        },
        () => {
          // Silent frame noise callback
        }
      );
      setHasPermission(true);
      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera startup warning:', err);
      // Check if permission error
      if (err?.toString().toLowerCase().includes('permission') || err?.name === 'NotAllowedError') {
        setHasPermission(false);
        onScanError('Camera access denied. Please grant camera permission.');
      } else {
        onScanError('Failed to initialize device camera.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = async () => {
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      try {
        await qrScannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop camera scanner:', err);
      }
    }
  };

  const handleDecodedValue = (text: string) => {
    const validation = qrScannerService.validateQrCode(text);
    if (validation.isValid && validation.node) {
      // Play a quick subtle system verification tone if supported
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // high frequency success beep
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}

      onScanSuccess(validation.node);
    } else {
      onScanError(validation.error || 'Invalid EXOA room QR code detected.');
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Live Camera Feed Glass Frame */}
      <div className="relative w-full aspect-square sm:max-w-md mx-auto rounded-2xl border border-white/[0.06] bg-black/60 overflow-hidden shadow-2xl">
        <div id={scannerId} className="w-full h-full object-cover [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#070913]/90 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-30">
            <div className="w-6 h-6 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
            <span className="text-[9px] font-mono tracking-widest text-[var(--color-exoa-text-dim)] uppercase">
              BOOTING CAMERA SYSTEM...
            </span>
          </div>
        )}

        {/* Camera permission failure overlay */}
        {hasPermission === false && (
          <div className="absolute inset-0 bg-[#070913]/95 flex flex-col items-center justify-center p-6 text-center gap-3 z-30">
            <span className="text-2xl">📷</span>
            <span className="text-[10px] font-mono tracking-widest text-red-500 font-bold uppercase">
              CAMERA LINK BLOCKAGE
            </span>
            <p className="text-[10px] text-[var(--color-exoa-text-dim)] leading-relaxed max-w-[240px]">
              Access to camera sensor was denied. Enable site permission and reload the dashboard.
            </p>
          </div>
        )}

        {/* Scanning grid overlay alignment HUD */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            {/* Holographic scanning box frame */}
            <div className="w-[70%] h-[70%] border border-red-500/20 rounded-2xl relative shadow-[0_0_20px_rgba(239,68,68,0.05)]">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500 rounded-br-lg" />

              {/* Scanning red laser line */}
              <motion.div
                className="absolute left-0 w-full h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                animate={{
                  top: ['4%', '96%', '4%'],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
            {/* Ambient vignette */}
            <div className="absolute inset-0 bg-radial-vignette opacity-40" />
          </div>
        )}
      </div>

      {/* Lens toggle controls */}
      {isScanning && (
        <div className="flex justify-center">
          <button
            onClick={toggleCamera}
            className="px-5 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-[9px] tracking-widest uppercase cursor-pointer transition-all flex items-center gap-2"
          >
            🔄 SWITCH LENS ({facingMode === 'environment' ? 'BACK' : 'FRONT'})
          </button>
        </div>
      )}
    </div>
  );
}
