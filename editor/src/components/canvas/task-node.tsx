import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import { GitBranch, TriangleAlert } from "lucide-react";
import { nodeSize } from "@/lib/layout";
import { useRuns } from "@/lib/runs";
import { taskTemplates } from "@/lib/templates";
import type { RecipeEditorDiagnostic, RecipeEditorNode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StatusBadge, statusBorders } from "../runs/run-status";
import { actionIcon } from "./action-icons";

export type TaskNodeData = {
  readonly task: RecipeEditorNode;
  readonly problems: readonly RecipeEditorDiagnostic[];
  readonly connectable: boolean;
};

export type TaskFlowNode = Node<TaskNodeData, "task">;

function kindLabel(task: RecipeEditorNode): string {
  if (task.action) return taskTemplates[task.action].label;
  return task.actions.length > 1
    ? `Several operations: ${task.actions.join(", ")}`
    : "No operation";
}

export function TaskNode({ data, selected }: NodeProps<TaskFlowNode>) {
  const { task, problems, connectable } = data;
  const Icon = actionIcon(task.action);
  const status = useRuns((store) =>
    task.key ? store.tasks[task.key] : undefined,
  );
  return (
    <div
      style={{ width: nodeSize.width, minHeight: nodeSize.height }}
      className={cn(
        "flex flex-col gap-1.5 border bg-card px-3 py-2.5 text-left shadow-sm transition-colors",
        selected ? "border-primary" : "border-border hover:border-input",
        problems.length > 0 && !selected && "border-destructive/70",
        status && !selected && statusBorders[status],
        status === "active" && "animate-pulse",
      )}
      data-testid={`task-${task.id}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={connectable}
      />
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="truncate font-mono text-[0.8125rem] font-medium">
          {task.key ?? "(missing key)"}
        </span>
        {task.conditional && (
          <GitBranch
            className="ml-auto size-3.5 shrink-0 text-muted-foreground"
            aria-label="Conditional"
          />
        )}
        {problems.length > 0 && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs text-destructive",
              !task.conditional && "ml-auto",
            )}
            title={problems.map((problem) => problem.message).join("\n")}
          >
            <TriangleAlert className="size-3.5" aria-hidden />
            {problems.length}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="flex-1 truncate text-[0.6875rem] tracking-wide text-muted-foreground uppercase">
          {kindLabel(task)}
        </span>
        {status && <StatusBadge status={status} />}
      </div>
      {task.summary && (
        <div className="line-clamp-2 text-xs text-foreground/80">
          {task.summary}
        </div>
      )}
      {task.components.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.components.map((component) => (
            <span
              key={component}
              className="bg-secondary px-1.5 py-0.5 font-mono text-[0.625rem] text-muted-foreground"
            >
              {component}
            </span>
          ))}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={connectable}
      />
    </div>
  );
}
