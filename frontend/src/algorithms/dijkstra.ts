import type { GraphNode, GraphEdge, PathResult, AdjacencyEntry } from '../types';

/**
 * Priority queue implementation using a min-heap for Dijkstra's algorithm.
 * Optimized for graph traversal with O(log n) insert/extract.
 */
class PriorityQueue {
  private heap: { nodeId: string; priority: number }[] = [];

  enqueue(nodeId: string, priority: number): void {
    this.heap.push({ nodeId, priority });
    this._bubbleUp(this.heap.length - 1);
  }

  dequeue(): { nodeId: string; priority: number } | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0 && end) {
      this.heap[0] = end;
      this._sinkDown(0);
    }
    return min;
  }

  get size(): number {
    return this.heap.length;
  }

  private _bubbleUp(idx: number): void {
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this.heap[idx].priority >= this.heap[parentIdx].priority) break;
      [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
      idx = parentIdx;
    }
  }

  private _sinkDown(idx: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest === idx) break;
      [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
      idx = smallest;
    }
  }
}

/**
 * Build adjacency list from nodes and edges.
 * Supports blocked edges and danger multipliers.
 */
export function buildAdjacencyList(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Map<string, AdjacencyEntry[]> {
  const adjacency = new Map<string, AdjacencyEntry[]>();

  // Initialize all nodes
  for (const node of nodes) {
    adjacency.set(node.id, []);
  }

  // Add bidirectional edges
  for (const edge of edges) {
    const effectiveDistance = edge.distance * (edge.dangerMultiplier ?? 1);

    adjacency.get(edge.from)?.push({
      nodeId: edge.to,
      distance: effectiveDistance,
      blocked: edge.blocked ?? false,
      dangerMultiplier: edge.dangerMultiplier ?? 1,
    });

    adjacency.get(edge.to)?.push({
      nodeId: edge.from,
      distance: effectiveDistance,
      blocked: edge.blocked ?? false,
      dangerMultiplier: edge.dangerMultiplier ?? 1,
    });
  }

  return adjacency;
}

/**
 * Dijkstra's shortest path algorithm.
 * Finds shortest path from source to a specific target node.
 */
export function dijkstraShortestPath(
  adjacency: Map<string, AdjacencyEntry[]>,
  sourceId: string,
  targetId: string
): PathResult {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const pq = new PriorityQueue();

  // Initialize distances
  for (const nodeId of adjacency.keys()) {
    distances.set(nodeId, Infinity);
    previous.set(nodeId, null);
  }

  distances.set(sourceId, 0);
  pq.enqueue(sourceId, 0);

  while (pq.size > 0) {
    const current = pq.dequeue()!;
    const currentId = current.nodeId;
    const currentDist = current.priority;

    // Skip if we've found a better path already
    if (currentDist > (distances.get(currentId) ?? Infinity)) continue;

    // Early exit if we reached the target
    if (currentId === targetId) break;

    const neighbors = adjacency.get(currentId) ?? [];
    for (const neighbor of neighbors) {
      // Skip blocked edges
      if (neighbor.blocked) continue;

      const newDist = currentDist + neighbor.distance;
      if (newDist < (distances.get(neighbor.nodeId) ?? Infinity)) {
        distances.set(neighbor.nodeId, newDist);
        previous.set(neighbor.nodeId, currentId);
        pq.enqueue(neighbor.nodeId, newDist);
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | null = targetId;
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }

  const totalDistance = distances.get(targetId) ?? Infinity;
  const found = totalDistance !== Infinity && path[0] === sourceId;

  return {
    path: found ? path : [],
    distance: found ? totalDistance : Infinity,
    exitNode: null, // Will be set by caller
    found,
  };
}

/**
 * Find the shortest path to the nearest exit from the source node.
 * Tests all exit nodes and returns the path to the closest one.
 */
export function findNearestExit(
  nodes: GraphNode[],
  edges: GraphEdge[],
  sourceId: string
): PathResult {
  const adjacency = buildAdjacencyList(nodes, edges);
  const exitNodes = nodes.filter((n) => n.type === 'exit');

  if (exitNodes.length === 0) {
    return { path: [], distance: Infinity, exitNode: null, found: false };
  }

  let bestResult: PathResult = {
    path: [],
    distance: Infinity,
    exitNode: null,
    found: false,
  };

  for (const exit of exitNodes) {
    const result = dijkstraShortestPath(adjacency, sourceId, exit.id);
    if (result.found && result.distance < bestResult.distance) {
      bestResult = { ...result, exitNode: exit };
    }
  }

  return bestResult;
}

/**
 * Calculate Euclidean distance between two nodes.
 * Used for edge weight calculation and heuristics.
 */
export function euclideanDistance(
  node1: { x: number; y: number },
  node2: { x: number; y: number }
): number {
  const dx = node1.x - node2.x;
  const dy = node1.y - node2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
