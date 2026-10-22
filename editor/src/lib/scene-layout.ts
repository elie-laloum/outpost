import type {
  Position,
  RecipeEditorLayout,
  RecipeEditorLayoutNode,
  RecipeEditorScene,
  RecipeEditorZone,
} from "./types.ts";

export const nodeSize = { width: 248, height: 92 } as const;
export const entitySize = { width: 216, height: 64 } as const;
export const zoneFrame = {
  header: 44,
  padding: 24,
  sandbox: { width: 320, height: 200 },
  workspace: { width: 400, height: 260 },
} as const;
const gap = { x: 72, y: 36 } as const;
const content = {
  x: zoneFrame.padding,
  y: zoneFrame.header + zoneFrame.padding,
} as const;

export interface Size {
  readonly width: number;
  readonly height: number;
}

/** Where a scene node is drawn: relative to its parent zone, with the size zones need. */
export interface ScenePlace {
  readonly parent?: string;
  readonly position: Position;
  readonly size: Size;
  readonly collapsed: boolean;
  /** Inside a collapsed zone. */
  readonly hidden: boolean;
  /** Smallest size of a zone that keeps its children visible. */
  readonly minimum?: Size;
}

interface Item {
  readonly id: string;
  readonly size: Size;
  readonly minimum?: Size;
}

type Positions = Record<string, Position>;
type Dependencies = ReadonlyMap<string, readonly string[]>;

/** Columns by dependency depth, keeping scene order inside a column. */
function columns(
  items: readonly Item[],
  dependencies: Dependencies,
  origin: Position,
): Positions {
  const ids = new Set(items.map((item) => item.id));
  const depths = new Map<string, number>();
  const visiting = new Set<string>();
  const depth = (id: string): number => {
    const known = depths.get(id);
    if (known !== undefined) return known;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const sources = (dependencies.get(id) ?? []).filter((source) =>
      ids.has(source),
    );
    const value = Math.max(-1, ...sources.map(depth)) + 1;
    visiting.delete(id);
    depths.set(id, value);
    return value;
  };
  const tops = new Map<number, number>();
  const positions: Positions = {};
  for (const item of items) {
    const column = depth(item.id);
    const top = tops.get(column) ?? origin.y;
    tops.set(column, top + item.size.height + gap.y);
    positions[item.id] = {
      x: origin.x + column * (nodeSize.width + gap.x),
      y: top,
    };
  }
  return positions;
}

function line(
  items: readonly Item[],
  origin: Position,
  axis: "x" | "y",
): Positions {
  let offset = 0;
  return Object.fromEntries(
    items.map((item) => {
      const position =
        axis === "x"
          ? { x: origin.x + offset, y: origin.y }
          : { x: origin.x, y: origin.y + offset };
      offset +=
        axis === "x" ? item.size.width + gap.x : item.size.height + gap.y;
      return [item.id, position];
    }),
  );
}

/** Saved positions win; others go right of a placed dependency, or below what is saved. */
function placeItems(
  items: readonly Item[],
  saved: (id: string) => Position | undefined,
  arranged: Positions,
  dependencies: Dependencies,
): Positions {
  const positions: Positions = {};
  for (const item of items) {
    const position = saved(item.id);
    if (position) positions[item.id] = position;
  }
  const kept = Object.keys(positions);
  if (!kept.length) return arranged;
  const sizes = new Map(items.map((item) => [item.id, item.size]));
  const occupied = (candidate: Position, size: Size) =>
    Object.entries(positions).some(([id, other]) =>
      overlaps(candidate, size, other, sizes.get(id)!),
    );
  const bottom =
    Math.max(...kept.map((id) => positions[id]!.y + sizes.get(id)!.height)) +
    gap.y * 2;
  const left = Math.min(...kept.map((id) => positions[id]!.x));
  for (const item of items) {
    if (positions[item.id]) continue;
    const source = dependencies.get(item.id)?.find((id) => positions[id]);
    const anchor = source ? positions[source] : undefined;
    let candidate = anchor
      ? { x: anchor.x + sizes.get(source!)!.width + gap.x, y: anchor.y }
      : { x: left, y: bottom };
    while (occupied(candidate, item.size))
      candidate = anchor
        ? { x: candidate.x, y: candidate.y + item.size.height + gap.y }
        : { x: candidate.x + item.size.width + gap.x, y: candidate.y };
    positions[item.id] = candidate;
  }
  return positions;
}

function overlaps(a: Position, size: Size, b: Position, other: Size): boolean {
  return (
    a.x < b.x + other.width &&
    b.x < a.x + size.width &&
    a.y < b.y + other.height &&
    b.y < a.y + size.height
  );
}

/** Pushes items that overlap an earlier one along the axis, since a growing zone can cover its neighbours. */
function separate(
  items: readonly Item[],
  positions: Positions,
  axis: "x" | "y",
): Positions {
  const across = axis === "x" ? "y" : "x";
  const ordered = [...items].sort(
    (a, b) =>
      positions[a.id]![axis] - positions[b.id]![axis] ||
      positions[a.id]![across] - positions[b.id]![across],
  );
  const settled: Item[] = [];
  const separated: Positions = { ...positions };
  for (const item of ordered) {
    let position = separated[item.id]!;
    const blocker = () =>
      settled.find((other) =>
        overlaps(position, item.size, separated[other.id]!, other.size),
      );
    for (let other = blocker(); other; other = blocker()) {
      const bounds = separated[other.id]!;
      position =
        axis === "x"
          ? { x: bounds.x + other.size.width + gap.x, y: position.y }
          : { x: position.x, y: bounds.y + other.size.height + gap.y };
    }
    separated[item.id] = position;
    settled.push(item);
  }
  return separated;
}

/** The size a zone needs for its children, and the larger size the user saved. */
function zoneSize(
  kind: RecipeEditorZone["kind"],
  children: readonly Item[],
  positions: Positions,
  saved: RecipeEditorLayoutNode | undefined,
): { readonly size: Size; readonly minimum: Size } {
  const fit = (axis: "x" | "y", extent: keyof Size) =>
    Math.max(
      zoneFrame[kind][extent],
      ...children.map(
        (item) =>
          positions[item.id]![axis] + item.size[extent] + zoneFrame.padding,
      ),
    );
  const minimum = { width: fit("x", "width"), height: fit("y", "height") };
  const width = Math.max(minimum.width, saved?.width ?? 0);
  if (saved?.collapsed)
    return { size: { width, height: zoneFrame.header }, minimum };
  return {
    size: { width, height: Math.max(minimum.height, saved?.height ?? 0) },
    minimum,
  };
}

/**
 * Positions every scene node: tasks inside their sandbox zone, sandboxes inside their workspace,
 * and workspaces, control tasks, components and the run node at the root.
 */
export function placeScene(
  scene: RecipeEditorScene,
  layout: RecipeEditorLayout,
  arrange = false,
): Record<string, ScenePlace> {
  const saved = (id: string) => {
    const node = arrange ? undefined : layout.nodes[id];
    return node && { x: node.x, y: node.y };
  };
  const frame = (id: string) => {
    const node = layout.nodes[id];
    if (!node) return undefined;
    if (!arrange) return node;
    return node.collapsed ? { x: 0, y: 0, collapsed: true } : undefined;
  };
  const dependencies = new Map<string, string[]>();
  for (const edge of scene.edges) {
    const target = `task:${edge.target}`;
    dependencies.set(target, [
      ...(dependencies.get(target) ?? []),
      `task:${edge.source}`,
    ]);
  }
  const places: Record<string, Omit<ScenePlace, "hidden">> = {};
  const fill = (
    parent: string | undefined,
    items: readonly Item[],
    arranged: Positions,
    push?: "x" | "y",
  ) => {
    const placed = placeItems(items, saved, arranged, dependencies);
    const positions = push ? separate(items, placed, push) : placed;
    for (const item of items)
      places[item.id] = {
        ...(parent ? { parent } : {}),
        position: positions[item.id]!,
        size: item.size,
        ...(item.minimum ? { minimum: item.minimum } : {}),
        collapsed: frame(item.id)?.collapsed === true,
      };
    return positions;
  };
  const zone = (item: RecipeEditorZone, children: readonly Item[]): Item => {
    const id = `zone:${item.id}`;
    const sandbox = item.kind === "sandbox";
    const arranged = sandbox
      ? columns(children, dependencies, content)
      : line(children, content, "x");
    const positions = fill(id, children, arranged, sandbox ? undefined : "x");
    return { id, ...zoneSize(item.kind, children, positions, frame(id)) };
  };
  const sandboxes = new Map(
    scene.zones
      .filter((item) => item.kind === "sandbox")
      .map((item) => [
        item.id,
        zone(
          item,
          scene.tasks
            .filter((task) => task.zone === item.id)
            .map((task) => ({ id: `task:${task.id}`, size: nodeSize })),
        ),
      ]),
  );
  const workspaces = scene.zones
    .filter((item) => item.kind === "workspace")
    .map((item) =>
      zone(
        item,
        scene.zones.flatMap((child) =>
          child.parent === item.id ? [sandboxes.get(child.id)!] : [],
        ),
      ),
    );
  const opened = new Set(workspaces.map((item) => item.id));
  // A sandbox that opens an undeclared workspace stays visible at the root.
  const orphans = scene.zones.flatMap((item) =>
    item.kind === "sandbox" && !opened.has(`zone:${item.parent}`)
      ? [sandboxes.get(item.id)!]
      : [],
  );
  const components = [
    { id: "run", size: entitySize },
    ...scene.entities.map((item) => ({
      id: `entity:${item.id}`,
      size: entitySize,
    })),
  ];
  const control = scene.tasks
    .filter((task) => !task.zone)
    .map((task) => ({ id: `task:${task.id}`, size: nodeSize }));
  const zonesLeft = entitySize.width + gap.x;
  const zonesWidth = Math.max(
    0,
    ...[...workspaces, ...orphans].map((item) => item.size.width),
  );
  fill(
    undefined,
    [...components, ...workspaces, ...orphans, ...control],
    {
      ...line(components, { x: 0, y: 0 }, "y"),
      ...line([...workspaces, ...orphans], { x: zonesLeft, y: 0 }, "y"),
      ...columns(control, dependencies, {
        x: zonesLeft + (zonesWidth && zonesWidth + gap.x),
        y: 0,
      }),
    },
    "y",
  );
  const hidden = (id: string): boolean => {
    const parent = places[id]?.parent;
    return !!parent && (places[parent]!.collapsed || hidden(parent));
  };
  return Object.fromEntries(
    Object.entries(places).map(([id, place]) => [
      id,
      { ...place, hidden: hidden(id) },
    ]),
  );
}

export function absolutePosition(
  places: Readonly<Record<string, ScenePlace>>,
  id: string,
): Position {
  const place = places[id];
  if (!place) return { x: 0, y: 0 };
  const parent = place.parent
    ? absolutePosition(places, place.parent)
    : { x: 0, y: 0 };
  return { x: parent.x + place.position.x, y: parent.y + place.position.y };
}

/** Innermost visible zone of the given kinds under a flow point, ignoring the dragged nodes. */
export function zoneAt(
  scene: RecipeEditorScene,
  places: Readonly<Record<string, ScenePlace>>,
  point: Position,
  kinds: readonly RecipeEditorZone["kind"][] = ["sandbox", "workspace"],
  ignored: ReadonlySet<string> = new Set(),
): RecipeEditorZone | undefined {
  const inside = (zone: RecipeEditorZone) => {
    const id = `zone:${zone.id}`;
    const place = places[id];
    if (!place || place.hidden || ignored.has(id)) return false;
    const { x, y } = absolutePosition(places, id);
    return (
      point.x >= x &&
      point.x <= x + place.size.width &&
      point.y >= y &&
      point.y <= y + place.size.height
    );
  };
  return kinds
    .flatMap((kind) => scene.zones.filter((zone) => zone.kind === kind))
    .find(inside);
}

/** Layout entries that keep every node where it is drawn, with the saved zone sizes and states. */
export function layoutEntries(
  places: Readonly<Record<string, ScenePlace>>,
  layout: RecipeEditorLayout,
  moved: Readonly<Record<string, Position>> = {},
): Record<string, RecipeEditorLayoutNode> {
  return Object.fromEntries(
    Object.entries(places).map(([id, place]) => {
      const { x, y } = moved[id] ?? place.position;
      const { width, height, collapsed } = layout.nodes[id] ?? {};
      return [
        id,
        {
          x: Math.round(x),
          y: Math.round(y),
          ...(width && height ? { width, height } : {}),
          ...(collapsed ? { collapsed } : {}),
        },
      ];
    }),
  );
}

export function uniqueName(base: string, taken: Iterable<string>): string {
  const names = new Set(taken);
  if (!names.has(base)) return base;
  let index = 2;
  while (names.has(`${base}-${index}`)) index++;
  return `${base}-${index}`;
}
