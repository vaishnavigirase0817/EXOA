import { motion } from 'framer-motion';
import type { GraphNode } from '../types';
import { getNodeById } from '../data/graphData';

interface RouteOverlayProps {
  path: string[];
  svgPath: string;
  exitNode: GraphNode | null;
}

export function RouteOverlay({ path, svgPath, exitNode }: RouteOverlayProps) {
  if (!svgPath || path.length < 2) return null;

  const pathNodes = path
    .map((id) => getNodeById(id))
    .filter((n): n is NonNullable<typeof n> => n !== null);

  return (
    <g id="route-overlay">
      {/* Route glow background */}
      <motion.path
        d={svgPath}
        className="route-path-bg"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      {/* Main animated route path */}
      <motion.path
        d={svgPath}
        className="route-path"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      {/* Route waypoint indicators (small dots at corridor junctions) */}
      {pathNodes.slice(1, -1).map((node, i) => {
        if (node.type === 'corridor') {
          return (
            <motion.circle
              key={`waypoint-${node.id}`}
              cx={node.x}
              cy={node.y}
              r={2.5}
              fill="#2563eb"
              opacity={0.7}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 * i + 0.5 }}
            />
          );
        }
        return null;
      })}

      {/* Exit destination marker */}
      {exitNode && (
        <g>
          {/* Exit pulsing ring */}
          <motion.circle
            cx={exitNode.x}
            cy={exitNode.y}
            r={10}
            fill="none"
            stroke="#10b981"
            strokeWidth={1.5}
            initial={{ r: 10, opacity: 0.8 }}
            animate={{ r: 25, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />

          {/* Exit ambient shadow */}
          <circle
            cx={exitNode.x}
            cy={exitNode.y}
            r={12}
            fill="#10b981"
            opacity={0.12}
          />

          {/* Exit marker circle */}
          <motion.circle
            cx={exitNode.x}
            cy={exitNode.y}
            r={9}
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth={2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: 1,
            }}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.25))' }}
          />

          {/* Exit icon checkmark */}
          <motion.text
            x={exitNode.x}
            y={exitNode.y + 3.5}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={10}
            fontWeight={900}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            ✓
          </motion.text>

          {/* Exit label pill */}
          <motion.g
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <rect
              x={exitNode.x - 35}
              y={exitNode.y + 14}
              width={70}
              height={16}
              rx={8}
              fill="#ecfdf5"
              stroke="#10b981"
              strokeWidth={1}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.05))' }}
            />
            <text
              x={exitNode.x}
              y={exitNode.y + 25}
              textAnchor="middle"
              fill="#065f46"
              fontSize={7.5}
              fontWeight={700}
              fontFamily="Inter, sans-serif"
              letterSpacing={0.2}
            >
              🚪 NEAREST EXIT
            </text>
          </motion.g>
        </g>
      )}

      {/* Direction arrows along the path */}
      {pathNodes.length > 2 &&
        pathNodes.slice(0, -1).map((node, i) => {
          const next = pathNodes[i + 1];
          if (!next || node.type === 'corridor') return null;
          const midX = (node.x + next.x) / 2;
          const midY = (node.y + next.y) / 2;
          const angle = Math.atan2(next.y - node.y, next.x - node.x) * (180 / Math.PI);

          return (
            <motion.g
              key={`arrow-${i}`}
              transform={`translate(${midX}, ${midY}) rotate(${angle})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              <polygon
                points="-1,-3 5,0 -1,3"
                fill="#2563eb"
                opacity={0.8}
              />
            </motion.g>
          );
        })}
    </g>
  );
}
