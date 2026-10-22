import { cn } from "@/lib/utils";
import type { RecipeEditorRun } from "@/lib/types";

/** Text and border colors for task, report and process states. */
export const statusTones: Readonly<Record<string, string>> = {
  done: "border-success/50 text-success",
  failed: "border-destructive/60 text-destructive",
  rejected: "border-destructive/60 text-destructive",
  active: "border-primary text-primary",
  running: "border-primary text-primary",
  paused: "border-warning/60 text-warning",
  "waiting-input": "border-warning/60 text-warning",
  interrupted: "border-warning/60 text-warning",
};

/** Node borders for live task statuses on the canvas. */
export const statusBorders: Readonly<Record<string, string>> = {
  done: "border-success/70",
  failed: "border-destructive",
  rejected: "border-destructive",
  active: "border-primary",
  paused: "border-warning",
  "waiting-input": "border-warning",
};

export function runLabel(run: RecipeEditorRun): string {
  if (run.state === "running" || run.state === "interrupted") return run.state;
  return run.status ?? (run.state === "cancelled" ? "cancelled" : "failed");
}

export function StatusBadge({
  status,
  className,
}: {
  readonly status: string;
  readonly className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center border px-1.5 py-0.5 font-mono text-[0.6875rem]",
        statusTones[status] ?? "border-border text-muted-foreground",
        className,
      )}
    >
      {status}
    </span>
  );
}
