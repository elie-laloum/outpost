import type {
  Position,
  RecipeEditorGraph,
  RecipeEditorLayout,
} from "./types.ts";

export const nodeSize = { width: 248, height: 92 } as const;
const gap = { x: 72, y: 36 } as const;

/** Places tasks in columns by dependency depth, keeping recipe order inside a column. */
export function arrangeGraph(
  graph: RecipeEditorGraph,
): Record<string, Position> {
  const sources = new Map<string, string[]>();
  for (const edge of graph.edges)
    sources.set(edge.target, [
      ...(sources.get(edge.target) ?? []),
      edge.source,
    ]);
  const depths = new Map<string, number>();
  const visiting = new Set<string>();
  const depth = (id: string): number => {
    const known = depths.get(id);
    if (known !== undefined) return known;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const value = Math.max(-1, ...(sources.get(id) ?? []).map(depth)) + 1;
    visiting.delete(id);
    depths.set(id, value);
    return value;
  };
  const rows = new Map<number, number>();
  const positions: Record<string, Position> = {};
  for (const node of graph.nodes) {
    const column = depth(node.id);
    const row = rows.get(column) ?? 0;
    rows.set(column, row + 1);
    positions[node.id] = {
      x: column * (nodeSize.width + gap.x),
      y: row * (nodeSize.height + gap.y),
    };
  }
  return positions;
}

/** Saved positions win; a task without one goes right of its first placed dependency, or below. */
export function placeGraph(
  graph: RecipeEditorGraph,
  layout: RecipeEditorLayout,
): Record<string, Position> {
  const saved = graph.nodes.flatMap((node) => {
    const position = layout.nodes[node.id];
    return position ? [position] : [];
  });
  if (!saved.length) return arrangeGraph(graph);
  const positions: Record<string, Position> = {};
  for (const node of graph.nodes) {
    const position = layout.nodes[node.id];
    if (position) positions[node.id] = position;
  }
  const occupied = (candidate: Position) =>
    Object.values(positions).some(
      (other) =>
        Math.abs(other.x - candidate.x) < nodeSize.width &&
        Math.abs(other.y - candidate.y) < nodeSize.height,
    );
  const bottom =
    Math.max(...saved.map((position) => position.y)) +
    nodeSize.height +
    gap.y * 2;
  const left = Math.min(...saved.map((position) => position.x));
  for (const node of graph.nodes) {
    if (positions[node.id]) continue;
    const source = graph.edges.find(
      (edge) => edge.target === node.id && positions[edge.source],
    );
    const anchor = source ? positions[source.source] : undefined;
    let candidate = anchor
      ? { x: anchor.x + nodeSize.width + gap.x, y: anchor.y }
      : { x: left, y: bottom };
    while (occupied(candidate))
      candidate = anchor
        ? { x: candidate.x, y: candidate.y + nodeSize.height + gap.y }
        : { x: candidate.x + nodeSize.width + gap.x, y: candidate.y };
    positions[node.id] = candidate;
  }
  return positions;
}
