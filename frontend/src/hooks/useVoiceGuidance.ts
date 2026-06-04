import { useEffect, useRef } from 'react';
import { voiceGuidanceService } from '../services/voiceGuidance';
import { getNodeById } from '../data/graphData';
import type { GraphNode, NavigationState } from '../types';

export function useVoiceGuidance(
  navState: NavigationState,
  currentNode: GraphNode | null,
  targetExit: GraphNode | null,
  activeHazardsCount: number
) {
  const prevNodeIdRef = useRef<string | null>(null);
  const prevPathRef = useRef<string[]>([]);
  const prevHazardsCountRef = useRef<number>(0);
  const prevFloorRef = useRef<number | null>(null);
  const isNavigatingRef = useRef<boolean>(false);

  useEffect(() => {
    // If not navigating or no active node, reset states and cancel speech
    if (!navState.isNavigating || !navState.currentNodeId) {
      if (isNavigatingRef.current) {
        voiceGuidanceService.cancel();
        isNavigatingRef.current = false;
      }
      prevNodeIdRef.current = null;
      prevPathRef.current = [];
      prevFloorRef.current = null;
      prevHazardsCountRef.current = activeHazardsCount;
      return;
    }

    isNavigatingRef.current = true;
    const { currentNodeId, path, targetExitId } = navState;

    // 1. Detect Rerouting / Hazard changes
    const hasHazardsChanged = prevNodeIdRef.current !== null && activeHazardsCount !== prevHazardsCountRef.current;
    if (hasHazardsChanged) {
      prevHazardsCountRef.current = activeHazardsCount;
      voiceGuidanceService.speak("Hazard detected. Recalculating route.", true);
      // Wait for recalculated path before announcing next step
      return;
    }

    // 2. Detect Route Start
    const isNewRoute = prevNodeIdRef.current === null && currentNodeId !== null;
    if (isNewRoute) {
      prevNodeIdRef.current = currentNodeId;
      prevPathRef.current = path;
      prevHazardsCountRef.current = activeHazardsCount;
      if (currentNode) prevFloorRef.current = currentNode.floor;

      const exitName = targetExit?.label || "the exit";
      const startText = `Evacuation route started. Proceed to nearest exit, ${exitName}.`;
      voiceGuidanceService.speak(startText, true);

      // Announce the first action segment
      announceNextAction(path, currentNodeId, currentNode);
      return;
    }

    // 3. Detect movement along path (node change)
    if (currentNodeId !== prevNodeIdRef.current) {
      prevNodeIdRef.current = currentNodeId;
      prevPathRef.current = path;

      // Check for Destination Reached
      if (currentNodeId === targetExitId || (currentNode && currentNode.type === 'exit')) {
        voiceGuidanceService.speak("Destination reached. You have safely arrived at the exit.", true);
        return;
      }

      // Check for Floor Transition
      if (currentNode && prevFloorRef.current !== null && currentNode.floor !== prevFloorRef.current) {
        const floorNames = ["Ground Floor", "First Floor", "Second Floor", "Third Floor"];
        const floorName = floorNames[currentNode.floor] || `${currentNode.floor} Floor`;
        voiceGuidanceService.speak(`Floor transition complete. Proceeding on ${floorName}.`, true);
        prevFloorRef.current = currentNode.floor;
        
        // Announce first action on the new floor
        announceNextAction(path, currentNodeId, currentNode);
        return;
      }

      // Standard movement announcement
      announceNextAction(path, currentNodeId, currentNode);
    }
  }, [navState, currentNode, targetExit, activeHazardsCount]);

  // Helper to calculate distance and formulate step instructions
  const announceNextAction = (path: string[], currentId: string, node: GraphNode | null) => {
    const currentIndex = path.indexOf(currentId);
    if (currentIndex === -1 || currentIndex >= path.length - 1) {
      return;
    }

    const nextNodeId = path[currentIndex + 1];
    const nextNode = getNodeById(nextNodeId);
    if (!nextNode) return;

    if (nextNode.type === 'stair') {
      voiceGuidanceService.speak(`Proceed to ${nextNode.label || "the staircase"} for floor transition.`, false);
    } else {
      // Calculate distance between points in SVG coordinates and convert to meters (~8px is 1 meter)
      const dx = Math.abs(nextNode.x - (node?.x || 0));
      const dy = Math.abs(nextNode.y - (node?.y || 0));
      const distancePixels = Math.round(dx + dy);
      const meters = Math.max(5, Math.round(distancePixels / 8));

      // Determine left/right turn instructions based on direction if possible, otherwise use name-based guidance
      const nextLabel = nextNode.label || "the next corridor checkpoint";
      
      voiceGuidanceService.speak(`Proceed straight for ${meters} meters towards ${nextLabel}.`, false);
    }
  };

  return {
    voiceService: voiceGuidanceService,
  };
}
export default useVoiceGuidance;
