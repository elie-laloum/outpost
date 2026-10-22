import { CircleCheck, TriangleAlert, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { useEditor } from "@/lib/store";
import type { EditorView, RecipeEditorDiagnostic } from "@/lib/types";
import { cn } from "@/lib/utils";

const connectionLabels = {
  connecting: "Connecting…",
  live: "Live",
  offline: "Reconnecting…",
} as const;

function location(diagnostic: RecipeEditorDiagnostic): string {
  if (!diagnostic.line) return diagnostic.path.join(".");
  return `${diagnostic.line}:${diagnostic.column ?? 1}`;
}

/** Validation summary, connection state and the list of every diagnostic. */
export function StatusBar({
  onShow,
}: {
  /** Opens a view, selecting the scene node a diagnostic belongs to. */
  readonly onShow: (view: EditorView, node?: string) => void;
}) {
  const state = useEditor((store) => store.state);
  const connection = useEditor((store) => store.connection);
  const info = useEditor((store) => store.info);
  const [open, setOpen] = useState(false);
  const diagnostics = state?.diagnostics ?? [];
  const summary =
    diagnostics.length === 1 ? "1 problem" : `${diagnostics.length} problems`;
  const show = (diagnostic: RecipeEditorDiagnostic) => {
    if (diagnostic.node) return onShow("canvas", diagnostic.node);
    onShow(diagnostic.file === "config" ? "config" : "yaml");
  };
  return (
    <footer className="shrink-0 border-t text-xs">
      {open && diagnostics.length > 0 && (
        <ul
          className="max-h-48 overflow-y-auto border-b py-1"
          aria-label="Diagnostics"
        >
          {diagnostics.map((diagnostic, index) => (
            <li key={index}>
              <button
                type="button"
                className="flex w-full gap-3 px-4 py-1 text-left hover:bg-secondary"
                onClick={() => show(diagnostic)}
              >
                <span className="w-44 shrink-0 truncate font-mono text-muted-foreground">
                  {diagnostic.file} {location(diagnostic)}
                </span>
                <span className="flex-1">
                  {diagnostic.message}
                  {diagnostic.hint && (
                    <span className="ml-2 text-muted-foreground">
                      {diagnostic.hint}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex h-7 items-center gap-4 px-3 text-muted-foreground">
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5",
            diagnostics.length > 0 && "text-destructive",
          )}
          disabled={!diagnostics.length}
          onClick={() => setOpen(!open)}
        >
          {diagnostics.length > 0 ? (
            <TriangleAlert className="size-3.5" />
          ) : (
            <CircleCheck className="size-3.5 text-success" />
          )}
          {diagnostics.length > 0 ? summary : "Valid"}
        </button>
        <span className="truncate">{info?.directory}</span>
        <span className="ml-auto flex items-center gap-1.5">
          {connection === "live" ? (
            <Wifi className="size-3.5" />
          ) : (
            <WifiOff className="size-3.5 text-warning" />
          )}
          {connectionLabels[connection]}
        </span>
        {info && <span>Outpost {info.version}</span>}
      </div>
    </footer>
  );
}
