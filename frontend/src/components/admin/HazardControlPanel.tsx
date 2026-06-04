import { useState } from 'react';
import type { GraphEdge } from '../../types';
import { getNodeById } from '../../data/graphData';

interface HazardControlPanelProps {
  edges: GraphEdge[];
  onBlock: (from: string, to: string) => void;
  onUnblock: (from: string, to: string) => void;
  floor: number;
}

export function HazardControlPanel({
  edges,
  onBlock,
  onUnblock,
  floor,
}: HazardControlPanelProps) {
  const [selectedEdgeIndex, setSelectedEdgeIndex] = useState<string>('');

  const floorEdges = edges.filter((e) => e.floor === floor);
  const blockedEdges = floorEdges.filter((e) => e.blocked);

  const getEdgeLabel = (edge: GraphEdge) => {
    const fromNode = getNodeById(edge.from);
    const toNode = getNodeById(edge.to);
    const fromLabel = fromNode?.label || edge.from;
    const toLabel = toNode?.label || edge.to;
    return `${fromLabel} ↔ ${toLabel}`;
  };

  const handleBlockClick = () => {
    if (!selectedEdgeIndex) return;
    const edge = floorEdges[parseInt(selectedEdgeIndex)];
    if (edge) {
      onBlock(edge.from, edge.to);
      setSelectedEdgeIndex('');
    }
  };

  return (
    <div className="glass-card p-5.5 border border-slate-200 bg-white shadow-sm rounded-2xl flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          🔥 Spatial Corridor Control
        </h3>
        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
          Select and obstruct paths to trigger websocket recalculation
        </p>
      </div>

      {/* Select active edge to block */}
      <div className="flex flex-col gap-2">
        <label className="block text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">
          Select Walkable Corridor Edge
        </label>
        
        <div className="flex gap-3">
          <select
            value={selectedEdgeIndex}
            onChange={(e) => setSelectedEdgeIndex(e.target.value)}
            className="flex-grow bg-slate-50 hover:bg-slate-100/70 border border-slate-200 px-4 py-2.5 rounded-full text-xs font-semibold focus:outline-none focus:border-blue-500/50 shadow-sm cursor-pointer transition-all text-slate-700 tracking-wide appearance-none"
          >
            <option value="" disabled>Choose a corridor link...</option>
            {floorEdges.map((edge, idx) => {
              if (edge.blocked) return null;
              return (
                <option key={idx} value={idx}>
                  {getEdgeLabel(edge)}
                </option>
              );
            })}
          </select>

          <button
            onClick={handleBlockClick}
            disabled={!selectedEdgeIndex}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-[9px] tracking-wider uppercase rounded-full shadow-sm cursor-pointer transition-all border border-transparent"
          >
            BLOCK
          </button>
        </div>
      </div>

      {/* Blocked corridor log */}
      <div className="flex-grow flex flex-col gap-3">
        <span className="block text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider border-t border-slate-100 pt-4">
          Active Blocked Corridors ({blockedEdges.length})
        </span>

        <div className="flex-grow overflow-y-auto max-h-[220px] pr-1.5 flex flex-col gap-2.5">
          {blockedEdges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <span className="text-sm select-none text-emerald-600">✓</span>
              <p className="text-[10px] font-bold text-slate-800 mt-1 uppercase tracking-wide">
                All Paths Walkable
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">
                No custom obstructions reported on this floor
              </p>
            </div>
          ) : (
            blockedEdges.map((edge, index) => (
              <div
                key={index}
                className="glass-card border border-red-200 p-3 bg-red-50/50 rounded-xl relative overflow-hidden flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-red-500" />
                <div className="min-w-0">
                  <div className="text-[8px] font-bold text-red-600 tracking-wider uppercase">
                    Blocked Corridor Segment
                  </div>
                  <div className="text-xs text-slate-800 font-bold mt-0.5 truncate max-w-[200px]">
                    {getEdgeLabel(edge)}
                  </div>
                </div>
                <button
                  onClick={() => onUnblock(edge.from, edge.to)}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[8.5px] tracking-wider uppercase rounded-full border border-slate-200 transition-all cursor-pointer shadow-sm"
                >
                  CLEAR
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
