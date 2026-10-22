import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import {
  ArrowLeftRight,
  Blocks,
  Bot,
  Database,
  ListOrdered,
  Play,
  Plug,
  Puzzle,
  TriangleAlert,
  Webhook,
  Wrench,
} from "lucide-react";
import { entitySize } from "@/lib/scene-layout";
import type {
  RecipeEditorDiagnostic,
  RecipeEditorEntity,
  RecipeEditorScene,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const familyIcons: Readonly<Record<string, typeof Bot>> = {
  agents: Bot,
  transports: ArrowLeftRight,
  stores: Database,
  queues: ListOrdered,
  hooks: Webhook,
  tools: Wrench,
  mcpServers: Plug,
  extensions: Puzzle,
};

export function familyIcon(family: string) {
  return familyIcons[family] ?? Blocks;
}

export type EntityNodeData = {
  readonly entity: RecipeEditorEntity;
  readonly problems: readonly RecipeEditorDiagnostic[];
  readonly found: boolean;
};

export type EntityFlowNode = Node<EntityNodeData, "entity">;

function Problems({
  problems,
}: {
  readonly problems: readonly RecipeEditorDiagnostic[];
}) {
  if (!problems.length) return null;
  return (
    <span
      className="ml-auto flex items-center gap-1 text-xs text-destructive"
      title={problems.map((problem) => problem.message).join("\n")}
    >
      <TriangleAlert className="size-3.5" aria-hidden />
      {problems.length}
    </span>
  );
}

function frame(selected: boolean, problems: number, found: boolean) {
  return cn(
    "flex flex-col gap-1 border bg-card px-3 py-2 text-left shadow-sm",
    selected ? "border-primary" : "border-border hover:border-input",
    problems > 0 && !selected && "border-destructive/70",
    found && "ring-2 ring-warning",
  );
}

/** A named configuration component, such as `agents.coder`, that tasks and other components reference. */
export function EntityNode({ data, selected }: NodeProps<EntityFlowNode>) {
  const { entity, problems } = data;
  const Icon = familyIcon(entity.family);
  return (
    <div
      style={{ width: entitySize.width, minHeight: entitySize.height }}
      className={frame(selected, problems.length, data.found)}
      data-testid={`entity-${entity.id}`}
    >
      <Handle
        type="target"
        id="ref"
        position={Position.Top}
        isConnectable={entity.family === "agents"}
        className={cn(entity.family !== "agents" && "opacity-0")}
      />
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="truncate font-mono text-[0.8125rem] font-medium">
          {entity.name}
        </span>
        <Problems problems={problems} />
      </div>
      <span className="truncate text-[0.6875rem] tracking-wide text-muted-foreground uppercase">
        {entity.family}
        {entity.type ? ` · ${entity.type}` : ""}
      </span>
      <Handle
        type="source"
        id="ref"
        position={Position.Bottom}
        isConnectable={false}
        className="opacity-0"
      />
    </div>
  );
}

export type RunNodeData = {
  readonly run: RecipeEditorScene["run"];
  readonly problems: readonly RecipeEditorDiagnostic[];
  readonly found: boolean;
};

export type RunFlowNode = Node<RunNodeData, "run">;

/** Workflow options of the recipe and the environment names its configuration declares. */
export function RunNode({ data, selected }: NodeProps<RunFlowNode>) {
  const { run, problems } = data;
  const details = [
    ...run.options,
    ...run.environment.map((name) => `$${name}`),
  ];
  return (
    <div
      style={{ width: entitySize.width, minHeight: entitySize.height }}
      className={frame(selected, problems.length, data.found)}
      data-testid="run-node"
    >
      <div className="flex items-center gap-2">
        <Play className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="font-medium">Run</span>
        <Problems problems={problems} />
      </div>
      <span className="truncate text-[0.6875rem] text-muted-foreground">
        {details.length ? details.join(", ") : "Default workflow options"}
      </span>
      <Handle
        type="source"
        id="ref"
        position={Position.Bottom}
        isConnectable={false}
        className="opacity-0"
      />
    </div>
  );
}
