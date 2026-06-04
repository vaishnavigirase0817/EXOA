import { motion } from 'framer-motion';

interface UserMarkerProps {
  x: number;
  y: number;
  label?: string;
}

export function UserMarker({ x, y, label }: UserMarkerProps) {
  return (
    <g>
      {/* Outer pulsing beacon rings */}
      <motion.circle
        cx={x}
        cy={y}
        r={8}
        fill="none"
        stroke="#2563eb"
        strokeWidth={1.5}
        initial={{ r: 8, opacity: 0.8 }}
        animate={{ r: 30, opacity: 0 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.circle
        cx={x}
        cy={y}
        r={8}
        fill="none"
        stroke="#2563eb"
        strokeWidth={1}
        initial={{ r: 8, opacity: 0.6 }}
        animate={{ r: 24, opacity: 0 }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeOut',
          delay: 0.4,
        }}
      />

      {/* Ambient shadow/glow */}
      <circle
        cx={x}
        cy={y}
        r={14}
        fill="#2563eb"
        opacity={0.1}
      />

      {/* Main outer dot */}
      <motion.circle
        cx={x}
        cy={y}
        r={7.5}
        fill="#2563eb"
        stroke="#ffffff"
        strokeWidth={2}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(37, 99, 235, 0.25))' }}
      />

      {/* Inner white dot */}
      <circle cx={x} cy={y} r={2.5} fill="#ffffff" />

      {/* Label */}
      {label && (
        <motion.g
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Capsule pill container */}
          <rect
            x={x - 45}
            y={y - 32}
            width={90}
            height={18}
            rx={9}
            fill="#ffffff"
            stroke="#e2e8f0"
            strokeWidth={1}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(15, 23, 42, 0.05))' }}
          />
          <text
            x={x}
            y={y - 20}
            textAnchor="middle"
            fill="#0f172a"
            fontSize={7.5}
            fontWeight={700}
            fontFamily="Inter, sans-serif"
            letterSpacing={0.2}
          >
            📍 YOU ARE HERE
          </text>
        </motion.g>
      )}
    </g>
  );
}
