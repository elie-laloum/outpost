import {
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type Edge,
  MarkerType,
  MiniMap,
  type OnDelete,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from "@xyflow/react";
import { LayoutGrid } from "lucide-react";
import {
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { diagnosticsByTask } from "@/lib/diagnostics";
import { arrangeGraph, placeGraph } from "@/lib/layout";
import type { RecipeEditorAction, RecipeEditorOperation } from "@/lib/types";
import { useRecipe } from "@/lib/use-recipe";
import { taskDragType } from "./palette";
import { type TaskFlowNode, TaskNode } from "./task-node";

const nodeTypes = { task: TaskNode };
const fitOptions = { maxZoom: 1.1, padding: 0.2 } as const;

const edgeStyles = {
  after: { stroke: "var(--xy-edge-stroke)", strokeWidth: 1.5 },
  data: {
    stroke: "var(--destructive)",
    strokeWidth: 1.5,
    strokeDasharray: "5 4",
  },
} as const;

/** Tasks as nodes and `after` dependencies as edges; every change goes through the server draft. */
export function RecipeCanvas() {
  const {
    state,
    graph,
    keys,
    editable,
    selected,
    select,
    edit,
    moveNodes,
    addTask,
  } = useRecipe();
  const flow = useReactFlow();
  const problems = useMemo(
    () => diagnosticsByTask(state?.diagnostics ?? []),
    [state?.diagnostics],
  );
  const layout = state?.layout;
  const [nodes, setNodes] = useState<TaskFlowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const count = useRef(graph?.nodes.length ?? 0);

  useEffect(() => {
    if (!graph || graph.nodes.length <= count.current) {
      count.current = graph?.nodes.length ?? 0;
      return;
    }
    count.current = graph.nodes.length;
    // A new task may land outside the view; reveal it once React Flow has measured it.
    const timer = setTimeout(
      () => void flow.fitView({ ...fitOptions, duration: 200 }),
      50,
    );
    return () => clearTimeout(timer);
  }, [graph, flow]);

  useEffect(() => {
    if (!graph || !layout) return;
    const positions = placeGraph(graph, layout);
    setNodes((current) => {
      const measured = new Map(current.map((node) => [node.id, node.measured]));
      return graph.nodes.map((task) => ({
        id: task.id,
        type: "task",
        position: positions[task.id] ?? { x: 0, y: 0 },
        data: {
          task,
          problems: problems.get(task.index) ?? [],
          connectable: editable && !!task.key,
        },
        selected: task.id === selected,
        deletable: editable && !!task.key,
        ...(measured.get(task.id) ? { measured: measured.get(task.id) } : {}),
      }));
    });
  }, [graph, layout, problems, selected, editable]);

  useEffect(() => {
    if (!graph) return;
    setEdges((current) => {
      const chosen = new Set(
        current.filter((edge) => edge.selected).map((edge) => edge.id),
      );
      return graph.edges.map((edge) => {
        const id = `${edge.kind}:${edge.source}->${edge.target}`;
        return {
          id,
          source: edge.source,
          target: edge.target,
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
    });
  }, [graph, editable]);

  const onDelete: OnDelete<TaskFlowNode> = useCallback(
    ({ nodes: removed, edges: cut }) => {
      const gone = new Set(removed.map((node) => node.id));
      const operations: RecipeEditorOperation[] = [
        ...cut
          .filter(
            (edge) =>
              edge.id.startsWith("after:") &&
              !gone.has(edge.source) &&
              !gone.has(edge.target),
          )
          .map((edge) => ({
            type: "disconnect" as const,
            source: edge.source,
            target: edge.target,
          })),
        ...removed.flatMap((node) =>
          node.data.task.key
            ? [{ type: "remove-task" as const, key: node.data.task.key }]
            : [],
        ),
      ];
      if (operations.length) void edit("recipe", operations);
      if (removed.some((node) => node.id === selected)) select(undefined);
    },
    [edit, select, selected],
  );

  const onConnect = useCallback(
    ({ source, target }: Connection) =>
      void edit("recipe", [{ type: "connect", source, target }]),
    [edit],
  );

  const onDrop = useCallback(
    (event: DragEvent) => {
      const action = event.dataTransfer.getData(taskDragType) as
        RecipeEditorAction | "";
      if (!action || !editable) return;
      event.preventDefault();
      void addTask(
        action,
        flow.screenToFlowPosition({ x: event.clientX, y: event.clientY }),
      );
    },
    [addTask, editable, flow],
  );

  if (!graph) return null;
  return (
    <div
      className="relative min-w-0 flex-1"
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <ReactFlow<TaskFlowNode>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        colorMode="dark"
        fitView
        fitViewOptions={fitOptions}
        minZoom={0.2}
        nodesConnectable={editable}
        deleteKeyCode={editable ? ["Backspace", "Delete"] : null}
        isValidConnection={(connection) =>
          connection.source !== connection.target &&
          keys.includes(connection.source) &&
          keys.includes(connection.target)
        }
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
        onDelete={onDelete}
        onConnect={onConnect}
        onNodeClick={(_, node) => select(node.id)}
        onPaneClick={() => select(undefined)}
        onNodeDragStop={(_, _node, dragged) => {
          // Saving every position keeps the other tasks where the user sees them.
          const moved = new Map(
            dragged.map((node) => [node.id, node.position]),
          );
          const positions = nodes.map(
            (node) => [node.id, moved.get(node.id) ?? node.position] as const,
          );
          void moveNodes(
            Object.fromEntries(
              positions.map(([id, { x, y }]) => [
                id,
                { x: Math.round(x), y: Math.round(y) },
              ]),
            ),
            true,
          );
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor="var(--secondary)"
          maskColor="oklch(13% 0.028 261.692 / 70%)"
        />
      </ReactFlow>
      <div className="absolute top-3 right-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void moveNodes(arrangeGraph(graph), true).then(() =>
              flow.fitView({ ...fitOptions, duration: 200 }),
            );
          }}
        >
          <LayoutGrid /> Arrange
        </Button>
      </div>
      {graph.nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Drag a task kind from the left, or click one to add it.
        </div>
      )}
    </div>
  );
}
