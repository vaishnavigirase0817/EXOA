import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QRDownloadButton } from './QRDownloadButton';
import type { GraphNode } from '../../../types';

interface QRCardProps {
  node: GraphNode;
}

export function QRCard({ node }: QRCardProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(
      node.id,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (err) {
          console.error('Failed to generate QR:', err);
          return;
        }
        setQrUrl(url);
      }
    );
  }, [node]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(node.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy QR value:', e);
    }
  };

  const getFloorLabel = (floor: number) => {
    const floorNames = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor'];
    return floorNames[floor] || `Level ${floor}`;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'qr':
        return 'Checkpoint';
      case 'exit':
        return 'Exit Point';
      case 'stair':
        return 'Staircase';
      case 'lift':
        return 'Elevator';
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div className="glass-card p-5 border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md flex flex-col gap-4 group transition-all duration-300 rounded-2xl relative overflow-hidden">
      {/* Delicate top strip indicator based on node classification */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] transition-colors ${
        node.type === 'exit' ? 'bg-emerald-500' : 'bg-blue-500'
      }`} />

      {/* Card Info Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-sans font-bold tracking-wider text-slate-400 uppercase">
            Node ID
          </span>
          <span className="text-xs font-bold text-slate-900 font-mono">{node.id}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-0.5 rounded text-[8px] font-sans font-bold uppercase tracking-wider ${
            node.type === 'exit'
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-blue-50 text-blue-600 border border-blue-200'
          }`}>
            {getTypeLabel(node.type)}
          </span>
          <span className="text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider">
            {getFloorLabel(node.floor)}
          </span>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="relative w-full aspect-square bg-slate-50 rounded-xl p-3.5 flex items-center justify-center border border-slate-200 shadow-inner group-hover:scale-[1.01] transition-transform duration-300">
        {qrUrl ? (
          <img
            src={qrUrl}
            alt={`EXOA room QR node ${node.id}`}
            className="w-full h-full object-contain select-none"
            draggable="false"
          />
        ) : (
          <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        )}
      </div>

      {/* Label Descriptions */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] font-sans font-bold tracking-wider text-slate-400 uppercase">
          Logical Location
        </span>
        <span className="text-xs font-bold text-slate-800 truncate">
          {node.label || 'Unspecified corridor segment'}
        </span>
      </div>

      {/* Interactive Command Center Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        <button
          onClick={handleCopy}
          className={`py-1.5 px-3 rounded-lg border font-sans text-[9px] font-bold tracking-wider uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            copied
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
          }`}
          title="Copy node ID to clipboard"
        >
          {copied ? '✓ COPIED' : '📋 COPY VALUE'}
        </button>

        <QRDownloadButton nodeId={node.id} dataUrl={qrUrl} />
      </div>
    </div>
  );
}

export default QRCard;
