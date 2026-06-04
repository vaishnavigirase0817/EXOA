import { QRCard } from './QRCard';
import type { GraphNode } from '../../../types';

interface QRGridProps {
  nodes: GraphNode[];
}

export function QRGrid({ nodes }: QRGridProps) {
  if (nodes.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-16 text-center border border-dashed border-slate-200 bg-slate-50 rounded-3xl gap-3">
        <span className="text-3xl select-none">🔍</span>
        <span className="text-[10px] font-sans font-bold tracking-wider text-slate-500 uppercase">
          No Matching Nodes Identified
        </span>
        <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold max-w-[280px] leading-relaxed">
          Adjust search strings or filter criteria to discover building graph nodes.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {nodes.map((node) => (
        <QRCard key={node.id} node={node} />
      ))}
    </div>
  );
}

export default QRGrid;
