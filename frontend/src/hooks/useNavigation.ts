import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { NavigationState } from '../types';
import { navigationEngine } from '../services/NavigationEngine';

/**
 * Custom hook for managing navigation state.
 * Reads the QR node from URL params and calculates the route.
 */
export function useNavigation() {
  const [searchParams] = useSearchParams();
  const nodeParam = searchParams.get('node');

  const [navState, setNavState] = useState<NavigationState>({
    currentNodeId: null,
    targetExitId: null,
    path: [],
    distance: 0,
    status: 'normal',
    isNavigating: false,
  });

  const [isCalculating, setIsCalculating] = useState(false);

  /** Calculate route when node parameter changes */
  useEffect(() => {
    if (nodeParam) {
      setIsCalculating(true);
      
      // Small delay for visual feedback
      const timer = setTimeout(() => {
        const result = navigationEngine.calculateRoute(nodeParam);
        setNavState(result);
        setIsCalculating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [nodeParam]);

  /** Recalculate route (e.g., after blocking an edge) */
  const recalculate = useCallback(() => {
    if (navState.currentNodeId) {
      setIsCalculating(true);
      const result = navigationEngine.calculateRoute(navState.currentNodeId);
      setNavState(result);
      setIsCalculating(false);
    }
  }, [navState.currentNodeId]);

  /** Get SVG path string for the route */
  const routeSVGPath = useMemo(() => {
    return navigationEngine.getRouteSVGPath(navState.path);
  }, [navState.path]);

  /** Get route segments for animation */
  const routeSegments = useMemo(() => {
    return navigationEngine.getRouteSegments(navState.path);
  }, [navState.path]);

  /** Set navigation to a specific node (manual override) */
  const navigateFromNode = useCallback((nodeId: string) => {
    setIsCalculating(true);
    const result = navigationEngine.calculateRoute(nodeId);
    setNavState(result);
    setIsCalculating(false);
  }, []);

  return {
    navState,
    isCalculating,
    routeSVGPath,
    routeSegments,
    recalculate,
    navigateFromNode,
  };
}
