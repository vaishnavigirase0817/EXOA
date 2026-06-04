import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UserMarker } from './UserMarker';
import { RouteOverlay } from './RouteOverlay';
import { ZoomControls } from './ZoomControls';
import { useMapInteraction } from '../hooks/useMapInteraction';
import { buildingGraph, getNodeById } from '../data/graphData';
import type { GraphNode, NavigationState } from '../types';
import { SOSMarker } from './sos/SOSMarker';
import type { SOSAlert } from '../types/sos';

interface FloorMapProps {
  navState: NavigationState;
  routeSVGPath: string;
  isCalculating: boolean;
  activeSOSAlerts?: SOSAlert[];
}

/**
 * FloorMap — Main map rendering component.
 * 
 * Loads the original SVG floor plan and overlays navigation elements:
 * - User position marker
 * - Route path visualization
 * - Exit indicators
 * - Interactive pan/zoom
 */
export function FloorMap({ navState, routeSVGPath, isCalculating, activeSOSAlerts }: FloorMapProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [svgLoaded, setSvgLoaded] = useState(false);
  const [viewBox, setViewBox] = useState<string>('0 0 1200 900');
  const {
    viewport,
    containerRef,
    resetViewport,
    zoomIn,
    zoomOut,
    handlers,
  } = useMapInteraction();

  const currentNode: GraphNode | null = navState.currentNodeId
    ? getNodeById(navState.currentNodeId)
    : null;

  const exitNode: GraphNode | null = navState.targetExitId
    ? getNodeById(navState.targetExitId)
    : null;

  // Load SVG content dynamically based on current floor
  const currentFloor = currentNode ? currentNode.floor : 1;
  const floorInfo = buildingGraph.floors.find(f => f.level === currentFloor) || buildingGraph.floors[1];
  
  useEffect(() => {
    setSvgLoaded(false);
    fetch(floorInfo.svgPath)
      .then((res) => res.text())
      .then((text) => {
        // Extract viewBox if possible
        const viewBoxMatch = text.match(/viewBox="([^"]+)"/);
        if (viewBoxMatch) {
          setViewBox(viewBoxMatch[1]);
        } else {
          setViewBox(currentFloor === 0 ? '0 0 1000 600' : '0 0 1200 900');
        }
        
        // Remove XML declaration and extract just the SVG content
        const cleaned = text.replace(/<\?xml[^?]*\?>/, '').trim();
        setSvgContent(cleaned);
        setSvgLoaded(true);
      })
      .catch((err) => console.error(`Failed to load SVG ${floorInfo.svgPath}:`, err));
  }, [floorInfo.svgPath, currentFloor]);

  // Auto-center on current node when route is calculated
  const hasAutocentered = useRef(false);
  useEffect(() => {
    if (currentNode && navState.isNavigating && !hasAutocentered.current) {
      hasAutocentered.current = true;
      // No need to change viewport — the default centered view is fine
    }
  }, [currentNode, navState.isNavigating]);

  return (
    <div className="relative flex-1 overflow-hidden bg-white">
      {/* Loading overlay */}
      {isCalculating && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center bg-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="glass-card-glow p-6 flex flex-col items-center gap-3">
            <motion.div
              className="w-8 h-8 border-2 border-[var(--color-exoa-accent)] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span className="text-sm text-[var(--color-exoa-text-muted)]">
              Calculating route...
            </span>
          </div>
        </motion.div>
      )}

      {/* Map Container */}
      <div
        ref={containerRef}
        className="floor-map-container w-full h-full flex items-center justify-center"
        {...handlers}
      >
        <div
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
            transformOrigin: 'center center',
            transition: 'none',
          }}
        >
          {/* The SVG map with overlay */}
          <svg
            viewBox={viewBox}
            width="100%"
            height="100%"
            style={{
              maxWidth: '1200px',
              maxHeight: '80vh',
              width: '90vw',
            }}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Render original SVG content */}
            {svgLoaded && (
              <g
                dangerouslySetInnerHTML={{
                  __html: svgContent
                    .replace(/<svg[^>]*>/, '')
                    .replace(/<\/svg>/, ''),
                }}
              />
            )}

            {/* Navigation overlays (rendered on top) */}
            {navState.isNavigating && (
              <>
                {/* Route path */}
                <RouteOverlay
                  path={navState.path}
                  svgPath={routeSVGPath}
                  exitNode={exitNode}
                />

                {/* User position marker */}
                {currentNode && (
                  <UserMarker
                    x={currentNode.x}
                    y={currentNode.y}
                    label={currentNode.label}
                  />
                )}
              </>
            )}

            {/* Show current position even without a route */}
            {!navState.isNavigating && currentNode && (
              <UserMarker
                x={currentNode.x}
                y={currentNode.y}
                label={currentNode.label}
              />
            )}

            {/* Render active SOS signals on this floor */}
            {activeSOSAlerts &&
              activeSOSAlerts
                .filter((alert) => alert.current_floor === currentFloor)
                .map((alert) => {
                  const node = buildingGraph.nodes.find((n) => n.id === alert.current_node);
                  if (!node) return null;
                  return (
                    <SOSMarker
                      key={alert.id}
                      x={node.x}
                      y={node.y}
                      status={alert.status as 'triggered' | 'acknowledged'}
                    />
                  );
                })}
          </svg>
        </div>
      </div>

      {/* Zoom Controls */}
      <ZoomControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetViewport}
        scale={viewport.scale}
      />

      {/* Map Legend */}
      <motion.div
        className="absolute bottom-6 left-6 glass-card p-3 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="text-[9px] text-[var(--color-exoa-text-dim)] uppercase tracking-widest mb-2 font-semibold">
          Legend
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFEB3B] border border-[#F57F17]" />
            <span className="text-[10px] text-[var(--color-exoa-text-muted)]">QR Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#D32F2F] border border-[#990000]" />
            <span className="text-[10px] text-[var(--color-exoa-text-muted)]">Emergency Exit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3F51B5] border border-[#1A237E]" />
            <span className="text-[10px] text-[var(--color-exoa-text-muted)]">Staircase</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4CAF50] border border-[#1B5E20]" />
            <span className="text-[10px] text-[var(--color-exoa-text-muted)]">Lift</span>
          </div>
          {navState.isNavigating && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-[var(--color-exoa-route)] rounded" />
              <span className="text-[10px] text-[var(--color-exoa-text-muted)]">Route</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Interaction hint */}
      {!navState.isNavigating && !navState.currentNodeId && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-card-glow p-6 text-center z-10 pointer-events-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="text-2xl mb-2">📱</div>
          <div className="text-sm text-[var(--color-exoa-text)] font-semibold mb-1">
            Scan a QR Code
          </div>
          <div className="text-xs text-[var(--color-exoa-text-muted)]">
            Use the <span className="text-[var(--color-exoa-danger)]">📷 Scan QR</span> button above to scan a room door QR code
          </div>
        </motion.div>
      )}
    </div>
  );
}
