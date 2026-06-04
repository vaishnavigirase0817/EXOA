import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigation } from './useNavigation';
import { websocketService } from '../services/websocket';
import type { ConnectionStatus } from '../services/websocket';
import { getNodeById, buildingGraph } from '../data/graphData';
import type { GraphNode } from '../types';

export interface HazardInfo {
  id: string;
  fromNode: GraphNode;
  toNode: GraphNode;
  floor: number;
}

export function useDashboard() {
  const [, setSearchParams] = useSearchParams();
  const { navState, isCalculating, routeSVGPath, recalculate } = useNavigation();
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // Initialize and listen to WebSocket connection
  useEffect(() => {
    websocketService.connect();
    
    const unsubscribeStatus = websocketService.addStatusListener((status) => {
      setWsStatus(status);
    });

    const unsubscribeMessage = websocketService.addListener((msg) => {
      if (msg.type === 'edge_blocked' || msg.type === 'edge_unblocked') {
        // Trigger path recalculation when hazards change in real-time
        recalculate();
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeMessage();
      websocketService.disconnect();
    };
  }, [recalculate]);

  // Read current node data
  const currentNode = useMemo(() => {
    return navState.currentNodeId ? getNodeById(navState.currentNodeId) : null;
  }, [navState.currentNodeId]);

  // Read target exit data
  const targetExit = useMemo(() => {
    return navState.targetExitId ? getNodeById(navState.targetExitId) : null;
  }, [navState.targetExitId]);

  // Calculate list of active hazards on the current floor
  const activeHazards = useMemo(() => {
    if (!currentNode) return [];
    
    return buildingGraph.edges
      .filter((edge) => edge.floor === currentNode.floor && edge.blocked)
      .map((edge, index) => {
        const fromNode = getNodeById(edge.from);
        const toNode = getNodeById(edge.to);
        return {
          id: `hazard-${edge.from}-${edge.to}-${index}`,
          fromNode: fromNode || { id: edge.from, x: 0, y: 0, type: 'corridor', floor: edge.floor, label: 'Unknown Corridor' },
          toNode: toNode || { id: edge.to, x: 0, y: 0, type: 'corridor', floor: edge.floor, label: 'Unknown Corridor' },
          floor: edge.floor,
        } as HazardInfo;
      });
  }, [currentNode]);

  // Compute if a route has been found
  const found = useMemo(() => {
    return navState.path.length > 0;
  }, [navState.path]);

  // Calculate estimated evacuation time (based on ~1.4 m/s walking speed, 80 distance units ≈ 10 meters)
  const estimatedEvacTimeSeconds = useMemo(() => {
    if (!found || navState.distance <= 0) return 0;
    // Evacuation time heuristic: approx 1 second per 10 distance units
    const seconds = Math.max(5, Math.round(navState.distance / 8));
    return seconds;
  }, [found, navState.distance]);

  // Format evac time to "M:SS"
  const formattedEvacTime = useMemo(() => {
    if (estimatedEvacTimeSeconds <= 0) return 'N/A';
    const minutes = Math.floor(estimatedEvacTimeSeconds / 60);
    const seconds = estimatedEvacTimeSeconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }, [estimatedEvacTimeSeconds]);

  // Check if exit is via staircase (multi-floor transitions)
  const isStaircaseTransition = useMemo(() => {
    return targetExit?.type === 'stair';
  }, [targetExit]);

  // Trigger manual node change via query param to keep URL in sync
  const setNode = useCallback((nodeId: string) => {
    setError(null);
    setSearchParams((prev) => {
      prev.set('node', nodeId);
      return prev;
    });
  }, [setSearchParams]);

  return {
    navState,
    currentNode,
    targetExit,
    wsStatus,
    activeHazards,
    estimatedEvacTimeSeconds,
    formattedEvacTime,
    isStaircaseTransition,
    isCalculating,
    routeSVGPath,
    found,
    error,
    setNode,
  };
}
