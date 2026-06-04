import { useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { qrScannerService } from '../../services/qrScannerService';
import type { GraphNode } from '../../types';

interface QRUploadScannerProps {
  onScanSuccess: (node: GraphNode) => void;
  onScanError: (error: string) => void;
}

export function QRUploadScanner({ onScanSuccess, onScanError }: QRUploadScannerProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processImageFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processImageFile(files[0]);
    }
  };

  const processImageFile = async (file: File) => {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      onScanError('Unsupported file format. Please upload a JPG or PNG image.');
      return;
    }

    setFileName(file.name);
    setLoading(true);

    try {
      // Create a temporary hidden container for scanFile processing
      const dummyId = 'exoa-temp-uploader-container';
      let dummyContainer = document.getElementById(dummyId);
      if (!dummyContainer) {
        dummyContainer = document.createElement('div');
        dummyContainer.id = dummyId;
        dummyContainer.style.display = 'none';
        document.body.appendChild(dummyContainer);
      }

      const html5QrCode = new Html5Qrcode(dummyId);
      const decodedText = await html5QrCode.scanFile(file, false);
      
      const validation = qrScannerService.validateQrCode(decodedText);
      if (validation.isValid && validation.node) {
        // Successful verification tone
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.setValueAtTime(880, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.1);
        } catch (e) {}

        onScanSuccess(validation.node);
      } else {
        onScanError(validation.error || 'Invalid EXOA room QR code structure.');
      }
    } catch (err) {
      console.warn('QR file decoding failed:', err);
      onScanError('No readable QR code found in this image. Try another file or adjust lighting.');
    } finally {
      setLoading(false);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans sm:max-w-md mx-auto">
      {/* Hidden file selector */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Glass dropzone box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerSelect}
        className={`w-full aspect-[4/3] rounded-2xl border border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-red-500 bg-red-500/[0.03] shadow-[0_0_25px_rgba(239,68,68,0.1)] scale-[1.01]'
            : 'border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]'
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
            <span className="text-[9px] font-mono tracking-widest text-red-500 uppercase font-bold">
              ANALYZING PIXEL ARRAY...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-3xl mb-1 select-none">📁</span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-white uppercase">
              DRAG & DROP QR IMAGE
            </span>
            <p className="text-[9px] text-[var(--color-exoa-text-dim)] uppercase tracking-wider font-semibold max-w-[200px] leading-relaxed mt-1 opacity-80">
              Or click to browse storage. Supports JPG, PNG, and SVG captures.
            </p>
            {fileName && (
              <span className="text-[9px] font-mono text-green-400 uppercase tracking-widest mt-2 border border-green-500/10 bg-green-500/[0.02] px-2 py-0.5 rounded">
                Active: {fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
