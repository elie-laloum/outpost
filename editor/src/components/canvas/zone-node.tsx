import {
  Handle,
  type Node,
  NodeResizer,
  type NodeProps,
  Position,
} from "@xyflow/react";
import {
  Box,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderGit2,
  TriangleAlert,
  X,
} from "lucide-react";
import type { Size } from "@/lib/scene-layout";
import type {
  RecipeEditorDiagnostic,
  RecipeEditorFeature,
  RecipeEditorZone,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ZoneFrame {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type ZoneNodeData = {
  readonly zone: RecipeEditorZone;
  readonly problems: readonly RecipeEditorDiagnostic[];
  /** Nodes drawn inside, counted while the zone is collapsed. */
  readonly count: number;
  readonly collapsed: boolean;
  readonly editable: boolean;
  readonly found: boolean;
  /** Smallest size that keeps every child visible. */
  readonly minimum: Size;
  readonly drop?: "allowed" | "refused";
  readonly onCollapse: () => void;
  readonly onResize: (frame: ZoneFrame) => void;
  readonly onRemoveFeature: (feature: RecipeEditorFeature) => void;
};

export type ZoneFlowNode = Node<ZoneNodeData, "zone">;

export function zoneLabel(zone: RecipeEditorZone): string {
  if (zone.name) return zone.name;
  return zone.kind === "workspace"
    ? "Configuration workspace"
    : "Configuration sandbox";
}

function zoneIcon(zone: RecipeEditorZone) {
  if (zone.kind === "sandbox") return Box;
  return zone.mode === "git" ? FolderGit2 : Folder;
}

/** A workspace or sandbox drawn as a frame around the zones or tasks it contains. */
export function ZoneNode({ data, selected }: NodeProps<ZoneFlowNode>) {
  const { zone, problems, collapsed, editable, minimum, drop } = data;
  const Icon = zoneIcon(zone);
  const Toggle = collapsed ? ChevronRight : ChevronDown;
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col border",
        zone.kind === "workspace"
          ? "border-dashed border-input bg-card/30"
          : "border-border bg-secondary/25",
        selected && "border-primary",
        problems.length > 0 && !selected && "border-destructive/70",
        data.found && "ring-2 ring-warning",
        drop === "allowed" && "ring-2 ring-primary",
        drop === "refused" && "ring-2 ring-destructive",
      )}
      data-testid={`zone-${zone.id}`}
    >
      <NodeResizer
        isVisible={selected && editable && !collapsed}
        minWidth={minimum.width}
        minHeight={minimum.height}
        lineClassName="!border-primary"
        handleClassName="!size-2 !border-primary !bg-background"
        onResizeEnd={(_, frame) => data.onResize(frame)}
      />
      <header className="flex h-11 shrink-0 items-center gap-2 px-3">
        <button
          type="button"
          className="nodrag text-muted-foreground hover:text-foreground"
          aria-label={collapsed ? "Expand zone" : "Collapse zone"}
          aria-expanded={!collapsed}
          onClick={data.onCollapse}
        >
          <Toggle className="size-4" aria-hidden />
        </button>
        <Icon className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="truncate font-mono text-[0.8125rem] font-medium">
          {zoneLabel(zone)}
        </span>
        <span className="text-[0.6875rem] tracking-wide text-muted-foreground uppercase">
          {zone.type ?? (zone.declared ? "reference" : "implied")}
        </span>
        {collapsed && data.count > 0 && (
          <span className="text-xs text-muted-foreground">
            {data.count} inside
          </span>
        )}
        {problems.length > 0 && (
          <span
            className="flex items-center gap-1 text-xs text-destructive"
            title={problems.map((problem) => problem.message).join("\n")}
          >
            <TriangleAlert className="size-3.5" aria-hidden />
            {problems.length}
          </span>
        )}
        <span className="ml-auto flex flex-wrap justify-end gap-1">
          {zone.features.map((feature) => (
            <span
              key={feature}
              className="flex items-center gap-1 bg-secondary px-1.5 py-0.5 font-mono text-[0.625rem] text-muted-foreground"
            >
              {feature}
              {editable && (
                <button
                  type="button"
                  className="nodrag hover:text-foreground"
                  aria-label={`Remove ${feature}`}
                  onClick={() => data.onRemoveFeature(feature)}
                >
                  <X className="size-3" aria-hidden />
                </button>
              )}
            </span>
          ))}
        </span>
      </header>
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
