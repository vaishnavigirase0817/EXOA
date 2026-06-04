import type { GraphNode, NavigationState, PathResult, RouteSegment } from '../types';
import { findNearestExit } from '../algorithms/dijkstra';
import { buildingGraph, getNodeById } from '../data/graphData';

/**
 * NavigationEngine — Core service for indoor emergency navigation.
 * 
 * Manages graph-based pathfinding, route calculation, and navigation state.
 * Decoupled from SVG rendering for clean architecture.
 */
export class NavigationEngine {
  private currentFloor: number = 1;

  /**
   * Calculate the shortest route to the nearest exit from a given source node.
   */
  calculateRoute(sourceNodeId: string): NavigationState {
    const sourceNode = getNodeById(sourceNodeId);

    if (!sourceNode) {
      console.error(`NavigationEngine: Node "${sourceNodeId}" not found in graph.`);
      return {
        currentNodeId: sourceNodeId,
        targetExitId: null,
        path: [],
        distance: 0,
        status: 'normal',
        isNavigating: false,
      };
    }

    // Auto-detect floor from source node so routes are kept on the same floor
    this.currentFloor = sourceNode.floor;

    // Filter nodes and edges for current floor
    const floorNodes = buildingGraph.nodes.filter((n) => n.floor === this.currentFloor);
    const floorEdges = buildingGraph.edges.filter((e) => e.floor === this.currentFloor);

    const result: PathResult = findNearestExit(floorNodes, floorEdges, sourceNodeId);

    return {
      currentNodeId: sourceNodeId,
      targetExitId: result.exitNode?.id ?? null,
      path: result.path,
      distance: Math.round(result.distance),
      status: result.found ? 'evacuation' : 'alert',
      isNavigating: result.found,
    };
  }

  /**
   * Convert a path (list of node IDs) into SVG route segments for rendering.
   */
  getRouteSegments(path: string[]): RouteSegment[] {
    const segments: RouteSegment[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const fromNode = getNodeById(path[i]);
      const toNode = getNodeById(path[i + 1]);

      if (fromNode && toNode) {
        segments.push({
          fromX: fromNode.x,
          fromY: fromNode.y,
          toX: toNode.x,
          toY: toNode.y,
          nodeId: path[i],
        });
      }
    }

    return segments;
  }

  /**
   * Generate an SVG path string from route segments.
   */
  getRouteSVGPath(path: string[]): string {
    if (path.length < 2) return '';

    const nodes = path
      .map((id) => getNodeById(id))
      .filter((n): n is NonNullable<typeof n> => n !== null);

    if (nodes.length < 2) return '';

    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      d += ` L ${nodes[i].x} ${nodes[i].y}`;
    }

    return d;
  }

  /**
   * Get all exit nodes for the current floor.
   */
  getExitNodes(): GraphNode[] {
    return buildingGraph.nodes.filter(
      (n) => n.type === 'exit' && n.floor === this.currentFloor
    );
  }

  /**
   * Get all QR nodes for the current floor.
   */
  getQRNodes(): GraphNode[] {
    return buildingGraph.nodes.filter(
      (n) => n.type === 'qr' && n.floor === this.currentFloor
    );
  }

  /**
   * Set current floor for multi-floor support.
   */
  setFloor(floor: number): void {
    this.currentFloor = floor;
  }

  /**
   * Get current floor number.
   */
  getFloor(): number {
    return this.currentFloor;
  }

  /**
   * Block an edge (e.g., fire in hallway). Returns updated navigation state.
   */
  blockEdge(fromId: string, toId: string): void {
    const edge = buildingGraph.edges.find(
      (e) =>
        (e.from === fromId && e.to === toId) ||
        (e.from === toId && e.to === fromId)
    );
    if (edge) {
      edge.blocked = true;
    }
  }

  /**
   * Unblock an edge.
   */
  unblockEdge(fromId: string, toId: string): void {
    const edge = buildingGraph.edges.find(
      (e) =>
        (e.from === fromId && e.to === toId) ||
        (e.from === toId && e.to === fromId)
    );
    if (edge) {
      edge.blocked = false;
    }
  }
}

/** Singleton instance */
export const navigationEngine = new NavigationEngine();
