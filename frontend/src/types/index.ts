/* ===== EXOA Navigation Type System ===== */

/** Types of navigable nodes in the building */
export type NodeType = 'qr' | 'exit' | 'stair' | 'lift' | 'path' | 'corridor' | 'door';

/** Represents a navigable point on the floor map */
export interface GraphNode {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  floor: number;
  label?: string;
  /** Connected to another floor via stairs/lift */
  connectedFloorNodeId?: string;
  /** SVG element ID to bind to */
  svgElementId?: string;
}

/** An edge between two graph nodes */
export interface GraphEdge {
  from: string;
  to: string;
  distance: number;
  /** Whether this edge is currently blocked (fire, debris, etc.) */
  blocked?: boolean;
  /** Weight multiplier for danger zones */
  dangerMultiplier?: number;
  floor: number;
}

/** Full graph data structure for a building */
export interface BuildingGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  floors: FloorInfo[];
}

/** Metadata about a building floor */
export interface FloorInfo {
  id: number;
  name: string;
  svgPath: string;
  level: number;
}

/** Result from pathfinding algorithm */
export interface PathResult {
  path: string[];
  distance: number;
  exitNode: GraphNode | null;
  found: boolean;
}

/** Adjacency list entry */
export interface AdjacencyEntry {
  nodeId: string;
  distance: number;
  blocked: boolean;
  dangerMultiplier: number;
}

/** Map viewport state */
export interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

/** Emergency status */
export type EmergencyStatus = 'normal' | 'alert' | 'evacuation';

/** Navigation state */
export interface NavigationState {
  currentNodeId: string | null;
  targetExitId: string | null;
  path: string[];
  distance: number;
  status: EmergencyStatus;
  isNavigating: boolean;
}

/** Route segment for animation */
export interface RouteSegment {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  nodeId: string;
}
