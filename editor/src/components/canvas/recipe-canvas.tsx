import {
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type Edge,
  MarkerType,
  MiniMap,
  type OnBeforeDelete,
  type OnDelete,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from "@xyflow/react";
import { Blocks, LayoutGrid, Link2, Search } from "lucide-react";
import {
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { recipeEditorPlacement } from "../../../../src/domain/recipes/editor-scene.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { diagnosticsByNode } from "@/lib/diagnostics";
import {
  absolutePosition,
  layoutEntries,
  placeScene,
  zoneAt,
} from "@/lib/scene-layout";
import { useEditor } from "@/lib/store";
import type {
  PaletteItem,
  Position,
  RecipeEditorLayoutNode,
  RecipeEditorOperation,
  RecipeEditorPlacementItem,
  RecipeEditorSceneOperation,
  RecipeEditorZone,
} from "@/lib/types";
import { type Drop, useRecipe } from "@/lib/use-recipe";
import { cn } from "@/lib/utils";
import {
  type EntityFlowNode,
  EntityNode,
  type RunFlowNode,
  RunNode,
} from "./entity-node";
import { paletteItem } from "./palette";
import { type TaskFlowNode, TaskNode } from "./task-node";
import { type ZoneFlowNode, ZoneNode, zoneLabel } from "./zone-node";

type SceneFlowNode = TaskFlowNode | ZoneFlowNode | EntityFlowNode | RunFlowNode;

const nodeTypes = {
  task: TaskNode,
  zone: ZoneNode,
  entity: EntityNode,
  run: RunNode,
};
const fitOptions = { maxZoom: 1.1, padding: 0.2 } as const;

const edgeStyles = {
  after: { stroke: "var(--xy-edge-stroke)", strokeWidth: 1.5 },
  data: {
    stroke: "var(--destructive)",
    strokeWidth: 1.5,
    strokeDasharray: "5 4",
  },
  reference: {
    stroke: "var(--muted-foreground)",
    strokeWidth: 1,
    strokeDasharray: "2 4",
  },
} as const;

/** What a dragged node is to the placement rules, and the zones it may land in. */
interface Dragged {
  readonly item: RecipeEditorPlacementItem;
  readonly kinds: readonly RecipeEditorZone["kind"][];
  readonly operation: (zone: string) => RecipeEditorSceneOperation | undefined;
}

const draggables: {
  readonly [Type in "task" | "zone"]: (
    node: Extract<SceneFlowNode, { type: Type }>,
  ) => Dragged;
} = {
  task: ({ data: { task } }) => ({
    item: { type: "task", id: task.id },
    kinds: ["sandbox", "workspace"],
    operation: (zone) =>
      task.key ? { type: "place-task", key: task.key, zone } : undefined,
  }),
  zone: ({ data: { zone } }) => ({
    item: { type: "zone", id: zone.id },
    kinds: ["workspace"],
    operation: (workspace) =>
      zone.kind === "sandbox"
        ? { type: "place-sandbox", sandbox: zone.id, workspace }
        : undefined,
  }),
};

function dragged(node: SceneFlowNode): Dragged | undefined {
  const describe = draggables[node.type as "task"] as
    ((node: SceneFlowNode) => Dragged) | undefined;
  return describe?.(node);
}

const removals: {
  readonly [Type in "zone" | "entity"]: (
    node: Extract<SceneFlowNode, { type: Type }>,
  ) => RecipeEditorSceneOperation;
} = {
  zone: ({ data: { zone } }) => ({ type: "remove-zone", zone: zone.id }),
  entity: ({ data: { entity } }) => ({
    type: "remove-entity",
    entity: entity.id,
  }),
};

const taskKey = (id: string) => id.slice("task:".length);

/** Zones nest sandboxes and tasks; components, references and the run sit around them. */
export function RecipeCanvas() {
  const {
    state,
    scene,
    layout,
    places,
    compatibility,
    keys,
    editable,
    configEditable,
    selected,
    select,
    edit,
    editScene,
    moveNodes,
    notify,
    addTask,
    addZone,
    addFeature,
    addComponent,
  } = useRecipe();
  const layers = useEditor((store) => store.layers);
  const toggleLayer = useEditor((store) => store.toggleLayer);
  const flow = useReactFlow<SceneFlowNode>();
  const problems = useMemo(
    () => diagnosticsByNode(state?.diagnostics ?? []),
    [state?.diagnostics],
  );
  const [nodes, setNodes] = useState<SceneFlowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [query, setQuery] = useState("");
  const [drop, setDrop] = useState<{ zone: string; allowed: boolean }>();
  // Bumped to redraw the scene after a refused drop leaves nodes where they were dropped.
  const [redraw, setRedraw] = useState(0);
  const count = useRef(scene?.tasks.length ?? 0);

  useEffect(() => {
    if (!scene || scene.tasks.length <= count.current) {
      count.current = scene?.tasks.length ?? 0;
      return;
    }
    count.current = scene.tasks.length;
    // A new task may land outside the view; reveal it once React Flow has measured it.
    const timer = setTimeout(
      () => void flow.fitView({ ...fitOptions, duration: 200 }),
      50,
    );
    return () => clearTimeout(timer);
  }, [scene, flow]);

  const saveLayout = useCallback(
    (
      id: string,
      entry: (current: RecipeEditorLayoutNode) => RecipeEditorLayoutNode,
    ) => {
      if (!layout) return;
      const entries = layoutEntries(places, layout);
      const current = entries[id];
      if (current) void moveNodes({ ...entries, [id]: entry(current) }, true);
    },
    [layout, moveNodes, places],
  );

  useEffect(() => {
    if (!scene) return;
    const term = query.trim().toLowerCase();
    const found = (...labels: string[]) =>
      !!term && labels.some((label) => label.toLowerCase().includes(term));
    const children = new Map<string, number>();
    for (const place of Object.values(places))
      if (place.parent)
        children.set(place.parent, (children.get(place.parent) ?? 0) + 1);
    const frame = (id: string) => {
      const place = places[id];
      return {
        position: place?.position ?? { x: 0, y: 0 },
        ...(place?.parent ? { parentId: place.parent } : {}),
        hidden: !!place?.hidden,
        selected: id === selected,
      };
    };
    const zones = scene.zones.flatMap((zone): ZoneFlowNode[] => {
      const id = `zone:${zone.id}`;
      const place = places[id];
      if (!place) return [];
      return [
        {
          id,
          type: "zone",
          ...frame(id),
          width: place.size.width,
          height: place.size.height,
          deletable: configEditable && zone.declared,
          data: {
            zone,
            problems: problems.get(id) ?? [],
            count: children.get(id) ?? 0,
            collapsed: place.collapsed,
            editable,
            found: found(zone.id, zoneLabel(zone)),
            minimum: place.minimum ?? place.size,
            onCollapse: () =>
              saveLayout(id, ({ collapsed, ...entry }) =>
                place.collapsed ? entry : { ...entry, collapsed: true },
              ),
            onResize: ({ x, y, width, height }) =>
              saveLayout(id, (entry) => ({
                ...entry,
                x: Math.round(x),
                y: Math.round(y),
                width: Math.round(width),
                height: Math.round(height),
              })),
            onRemoveFeature: (feature) =>
              void editScene([{ type: "set-feature", zone: zone.id, feature }]),
          },
        },
      ];
    });
    const tasks = scene.tasks.map((task): TaskFlowNode => {
      const id = `task:${task.id}`;
      return {
        id,
        type: "task",
        ...frame(id),
        deletable: editable && !!task.key,
        data: {
          task,
          problems: problems.get(id) ?? [],
          connectable: editable && !!task.key,
          found: found(task.id),
        },
      };
    });
    const entities = scene.entities.map((entity): EntityFlowNode => {
      const id = `entity:${entity.id}`;
      return {
        id,
        type: "entity",
        ...frame(id),
        hidden: !layers.components,
        deletable: configEditable,
        data: {
          entity,
          problems: problems.get(id) ?? [],
          found: found(entity.id),
        },
      };
    });
    const run: RunFlowNode = {
      id: "run",
      type: "run",
      ...frame("run"),
      deletable: false,
      data: {
        run: scene.run,
        problems: problems.get("run") ?? [],
        found: found("run"),
      },
    };
    setNodes((current) => {
      const measured = new Map(current.map((node) => [node.id, node.measured]));
      // React Flow draws a child only after its parent, so zones come first.
      return [...zones, ...tasks, ...entities, run].map((node) => {
        const size = measured.get(node.id);
        return (size ? { ...node, measured: size } : node) as SceneFlowNode;
      });
    });
  }, [
    scene,
    places,
    problems,
    selected,
    editable,
    configEditable,
    layers.components,
    query,
    redraw,
    saveLayout,
    editScene,
  ]);

  // Only zone data changes while dragging, so the dragged node keeps its place.
  useEffect(() => {
    setNodes((current) =>
      current.map((node) => {
        if (node.type !== "zone") return node;
        const over = drop?.zone === node.data.zone.id ? drop : undefined;
        const next = over && (over.allowed ? "allowed" : "refused");
        if (node.data.drop === next) return node;
        const { drop: _previous, ...data } = node.data;
        return { ...node, data: next ? { ...data, drop: next } : data };
      }),
    );
  }, [drop]);

  useEffect(() => {
    if (!scene) return;
    setEdges((current) => {
      const chosen = new Set(
        current.filter((edge) => edge.selected).map((edge) => edge.id),
      );
      const order = scene.edges.map((edge): Edge => {
        const id = `${edge.kind}:${edge.source}->${edge.target}`;
        return {
          id,
          source: `task:${edge.source}`,
          target: `task:${edge.target}`,
          sourceHandle: "after",
          targetHandle: "after",
          selected: chosen.has(id),
          deletable: editable && edge.kind === "after",
          style: edgeStyles[edge.kind],
          markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
          ...(edge.kind === "data"
            ? {
                label: "missing after",
                labelStyle: { fill: "var(--destructive)", fontSize: 10 },
              }
            : {}),
        };
      });
      const references = layers.references
        ? scene.references.map((reference): Edge => ({
            id: `reference:${reference.source}->${reference.target}:${reference.field}`,
            source: reference.source,
            target: `entity:${reference.target}`,
            sourceHandle: "ref",
            targetHandle: "ref",
            deletable: false,
            selectable: false,
            label: reference.field,
            labelStyle: { fill: "var(--muted-foreground)", fontSize: 10 },
            style: edgeStyles.reference,
          }))
        : [];
      return [...order, ...references];
    });
  }, [scene, editable, layers.references]);

  const nested = useCallback(
    (id: string, removed: ReadonlySet<string>) => {
      for (
        let parent = places[id]?.parent;
        parent;
        parent = places[parent]?.parent
      )
        if (removed.has(parent)) return true;
      return false;
    },
    [places],
  );

  // Removing a zone moves its contents to the configuration zone instead of deleting them.
  const onBeforeDelete: OnBeforeDelete<SceneFlowNode> = useCallback(
    async ({ nodes: removed, edges: cut }) => {
      const ids = new Set(removed.map((node) => node.id));
      return {
        nodes: removed.filter((node) => !nested(node.id, ids)),
        edges: cut.filter(
          (edge) => !nested(edge.source, ids) && !nested(edge.target, ids),
        ),
      };
    },
    [nested],
  );

  const onDelete: OnDelete<SceneFlowNode> = useCallback(
    ({ nodes: removed, edges: cut }) => {
      const gone = new Set(removed.map((node) => node.id));
      const recipe: RecipeEditorOperation[] = [
        ...cut
          .filter(
            (edge) =>
              edge.id.startsWith("after:") &&
              !gone.has(edge.source) &&
              !gone.has(edge.target),
          )
          .map((edge) => ({
            type: "disconnect" as const,
            source: taskKey(edge.source),
            target: taskKey(edge.target),
          })),
        ...removed.flatMap((node) =>
          node.type === "task" && node.data.task.key
            ? [{ type: "remove-task" as const, key: node.data.task.key }]
            : [],
        ),
      ];
      const configuration = removed.flatMap((node) => {
        const remove = removals[node.type as "zone"] as
          ((node: SceneFlowNode) => RecipeEditorSceneOperation) | undefined;
        return remove ? [remove(node)] : [];
      });
      if (recipe.length) void edit("recipe", recipe);
      if (configuration.length) void editScene(configuration);
      if (removed.some((node) => node.id === selected)) select(undefined);
    },
    [edit, editScene, select, selected],
  );

  // Typed handles: `after` orders two tasks, `ref` gives an agent task its agent.
  const connections = useMemo(
    () => ({
      after: {
        valid: (connection: Connection) =>
          keys.includes(taskKey(connection.source)) &&
          keys.includes(taskKey(connection.target)) &&
          connection.source !== connection.target,
        apply: (connection: Connection): RecipeEditorOperation => ({
          type: "connect",
          source: taskKey(connection.source),
          target: taskKey(connection.target),
        }),
      },
      ref: {
        valid: (connection: Connection) =>
          connection.target.startsWith("entity:agents.") &&
          scene?.tasks.some(
            (task) =>
              `task:${task.id}` === connection.source &&
              task.action === "agent",
          ) === true,
        apply: (connection: Connection): RecipeEditorOperation => ({
          type: "set",
          path: [
            "tasks",
            scene!.tasks.find(
              (task) => `task:${task.id}` === connection.source,
            )!.index,
            "agent",
          ],
          value: connection.target.slice("entity:agents.".length),
        }),
      },
    }),
    [keys, scene],
  );

  const connection = useCallback(
    (candidate: Connection | Edge) => {
      const handle = candidate.sourceHandle;
      const kind =
        handle === "after" || handle === "ref"
          ? connections[handle]
          : undefined;
      const valid =
        !!kind &&
        candidate.targetHandle === handle &&
        kind.valid(candidate as Connection);
      return valid ? kind : undefined;
    },
    [connections],
  );

  const onConnect = useCallback(
    (candidate: Connection) => {
      const kind = connection(candidate);
      if (kind) void edit("recipe", [kind.apply(candidate)]);
    },
    [connection, edit],
  );

  /** The zone under the pointer and whether the dragged node may move there. */
  const target = useCallback(
    (node: SceneFlowNode, event: globalThis.MouseEvent | TouchEvent) => {
      const kind = dragged(node);
      const pointer = "clientX" in event ? event : event.changedTouches[0];
      if (!scene || !compatibility || !kind || !pointer) return undefined;
      const point = flow.screenToFlowPosition({
        x: pointer.clientX,
        y: pointer.clientY,
      });
      const ignored = new Set(
        Object.keys(places).filter(
          (id) => id === node.id || nested(id, new Set([node.id])),
        ),
      );
      const zone = zoneAt(scene, places, point, kind.kinds, ignored);
      const parent = zone ? `zone:${zone.id}` : undefined;
      if (parent === places[node.id]?.parent) return undefined;
      return {
        zone,
        parent,
        kind,
        placement: recipeEditorPlacement(
          scene,
          compatibility,
          kind.item,
          zone ? { type: "zone", id: zone.id } : { type: "root" },
        ),
      };
    },
    [compatibility, flow, nested, places, scene],
  );

  const onNodeDrag = useCallback(
    (event: globalThis.MouseEvent | TouchEvent, node: SceneFlowNode) => {
      const next = target(node, event);
      const zone = next?.zone?.id;
      setDrop((current) => {
        if (!zone || !next) return undefined;
        const allowed = next.placement.allowed;
        return current?.zone === zone && current.allowed === allowed
          ? current
          : { zone, allowed };
      });
    },
    [target],
  );

  const onNodeDragStop = useCallback(
    (
      event: globalThis.MouseEvent | TouchEvent,
      node: SceneFlowNode,
      moved: SceneFlowNode[],
    ) => {
      setDrop(undefined);
      if (!layout) return;
      const positions = Object.fromEntries(
        moved.map((item) => [item.id, item.position]),
      );
      const next = target(node, event);
      if (!next)
        return void moveNodes(layoutEntries(places, layout, positions), true);
      const operation = next.zone && next.kind.operation(next.zone.id);
      if (!next.placement.allowed || !operation) {
        notify(
          next.placement.allowed
            ? "Name the task before moving it to another zone."
            : next.placement.reason,
        );
        return setRedraw((value) => value + 1);
      }
      const from = absolutePosition(places, places[node.id]?.parent ?? "");
      const to = absolutePosition(places, next.parent!);
      const position = {
        x: from.x + node.position.x - to.x,
        y: from.y + node.position.y - to.y,
      };
      void editScene(
        [operation],
        layoutEntries(places, layout, { ...positions, [node.id]: position }),
      );
    },
    [editScene, layout, moveNodes, notify, places, target],
  );

  const onDrop = useCallback(
    (event: DragEvent) => {
      const item = paletteItem(event.dataTransfer);
      if (!item || !scene) return;
      event.preventDefault();
      const point = flow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const at = (zone: RecipeEditorZone | undefined): Drop => {
        const origin = zone
          ? absolutePosition(places, `zone:${zone.id}`)
          : { x: 0, y: 0 };
        return {
          ...(zone ? { zone: zone.id } : {}),
          position: { x: point.x - origin.x, y: point.y - origin.y },
        };
      };
      const drops: {
        readonly [Type in PaletteItem["type"]]: (
          item: Extract<PaletteItem, { type: Type }>,
        ) => void;
      } = {
        task: ({ action }) =>
          void addTask(action, at(zoneAt(scene, places, point))),
        zone: ({ kind, value }) =>
          void addZone(
            kind,
            value,
            at(zoneAt(scene, places, point, ["workspace"])),
          ),
        feature: ({ feature }) => {
          const zone = zoneAt(scene, places, point);
          if (!zone) return notify("Drop a feature on a zone.");
          void addFeature(feature, zone.id);
        },
        component: ({ family }) => void addComponent(family, at(undefined)),
      };
      const handle = drops[item.type] as (value: PaletteItem) => void;
      handle(item);
    },
    [addComponent, addFeature, addTask, addZone, flow, notify, places, scene],
  );

  const reveal = () => {
    const matches = nodes.filter((node) => node.data.found && !node.hidden);
    if (!matches.length) return;
    select(matches[0]!.id);
    void flow.fitView({
      ...fitOptions,
      nodes: matches.map((node) => ({ id: node.id })),
      duration: 200,
    });
  };

  if (!scene || !layout) return null;
  return (
    <div
      className="relative min-w-0 flex-1"
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <ReactFlow<SceneFlowNode>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        colorMode="dark"
        fitView
        fitViewOptions={fitOptions}
        minZoom={0.2}
        nodesConnectable={editable}
        deleteKeyCode={editable ? ["Backspace", "Delete"] : null}
        isValidConnection={(candidate) => !!connection(candidate)}
        onNodesChange={(changes) =>
          setNodes((current) =>
            applyNodeChanges(
              changes.filter((change) => change.type !== "remove"),
              current,
            ),
          )
        }
        onEdgesChange={(changes) =>
          setEdges((current) =>
            applyEdgeChanges(
              changes.filter((change) => change.type !== "remove"),
              current,
            ),
          )
        }
        onBeforeDelete={onBeforeDelete}
        onDelete={onDelete}
        onConnect={onConnect}
        onNodeClick={(_, node) => select(node.id)}
        onPaneClick={() => select(undefined)}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) =>
            node.type === "zone" ? "transparent" : "var(--secondary)"
          }
          nodeStrokeColor={(node) =>
            node.type === "zone" ? "var(--input)" : "transparent"
          }
          maskColor="oklch(13% 0.028 261.692 / 70%)"
        />
      </ReactFlow>
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-2 left-2 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            aria-label="Search the canvas"
            placeholder="Search"
            className="h-8 w-44 bg-background pl-8"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && reveal()}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          aria-pressed={layers.components}
          className={cn(layers.components && "bg-secondary")}
          onClick={() => toggleLayer("components")}
        >
          <Blocks /> Components
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-pressed={layers.references}
          className={cn(layers.references && "bg-secondary")}
          onClick={() => toggleLayer("references")}
        >
          <Link2 /> References
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const collapsed = Object.fromEntries(
              Object.entries(layout.nodes).flatMap(([id, entry]) =>
                entry.collapsed ? [[id, { x: 0, y: 0, collapsed: true }]] : [],
              ),
            );
            const arranged = placeScene(scene, layout, true);
            void moveNodes(
              layoutEntries(arranged, { version: 2, nodes: collapsed }),
              true,
            ).then(() => flow.fitView({ ...fitOptions, duration: 200 }));
          }}
        >
          <LayoutGrid /> Arrange
        </Button>
      </div>
      {scene.tasks.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Drag a task, zone or component from the left, or click one to add it.
        </div>
      )}
    </div>
  );
}
