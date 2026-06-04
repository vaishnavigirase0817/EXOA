import { motion } from 'framer-motion';

interface SOSMarkerProps {
  x: number;
  y: number;
  status: 'triggered' | 'acknowledged';
}

export function SOSMarker({ x, y, status }: SOSMarkerProps) {
  const isAcknowledged = status === 'acknowledged';
  const color = isAcknowledged ? '#f59e0b' : '#ef4444';
  const glowId = isAcknowledged ? 'sosGlowAck' : 'sosGlowTrig';

  return (
    <g>
      {/* Dynamic pulsing background beacon rings */}
      <motion.circle
        cx={x}
        cy={y}
        r={10}
        fill="none"
        stroke={color}
        strokeWidth={3}
        initial={{ r: 10, opacity: 0.9 }}
        animate={{ r: 45, opacity: 0 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.circle
        cx={x}
        cy={y}
        r={10}
        fill="none"
        stroke={color}
        strokeWidth={2}
        initial={{ r: 10, opacity: 0.7 }}
        animate={{ r: 32, opacity: 0 }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: 'easeOut',
          delay: 0.4,
        }}
      />
      <motion.circle
        cx={x}
        cy={y}
        r={10}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        initial={{ r: 10, opacity: 0.5 }}
        animate={{ r: 20, opacity: 0 }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: 'easeOut',
          delay: 0.8,
        }}
      />

      {/* Glow aura */}
      <circle
        cx={x}
        cy={y}
        r={22}
        fill={color}
        opacity={0.25}
        filter={`url(#${glowId})`}
      />

      {/* Main beacon anchor */}
      <motion.circle
        cx={x}
        cy={y}
        r={10}
        fill={color}
        stroke="#ffffff"
        strokeWidth={2.5}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
      />

      {/* Exclamation exclamation symbol */}
      <text
        x={x}
        y={y + 3.5}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={11}
        fontWeight={900}
        fontFamily="system-ui, sans-serif"
        className="select-none pointer-events-none"
      >
        !
      </text>

      {/* Floating alert tag */}
      <motion.g
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <rect
          x={x - 45}
          y={y - 38}
          width={90}
          height={20}
          rx={6}
          fill="#070913"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.95}
        />
        <text
          x={x}
          y={y - 25}
          textAnchor="middle"
          fill={color}
          fontSize={8}
          fontWeight={900}
          fontFamily="JetBrains Mono, Fira Code, monospace"
          className="select-none animate-pulse-glow"
        >
          {isAcknowledged ? '⚠️ RESCUING' : '🚨 DISTRESS'}
        </text>
      </motion.g>

      {/* Custom filter definition for SOS marker glow */}
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </g>
  );
}
export default SOSMarker;
