import {
  ClientOnly,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";
import { Suspense, useEffect, useState } from "react";
import { Palette } from "@/components/canvas/palette";
import { RecipeCanvas } from "@/components/canvas/recipe-canvas";
import { Inspector } from "@/components/inspector/task-inspector";
import { ConfigView } from "@/components/config/config-view";
import { ConflictDialog, Notices } from "@/components/notices";
import { OpenDialog } from "@/components/open-dialog";
import { PlanView } from "@/components/plan-view";
import { RunDialog } from "@/components/runs/run-dialog";
import { RunsView } from "@/components/runs/runs-view";
import { StatusBar } from "@/components/status-bar";
import { Toolbar } from "@/components/toolbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { YamlView } from "@/components/yaml-view";
import { useEditor } from "@/lib/store";
import type { EditorView, PaletteItem } from "@/lib/types";
import { useRecipe } from "@/lib/use-recipe";

const views: readonly EditorView[] = [
  "canvas",
  "yaml",
  "config",
  "plan",
  "runs",
];

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { view?: EditorView } => {
    const view = views.find((item) => item === search.view);
    return view ? { view } : {};
  },
  component: () => (
    // The prerendered shell holds an empty boundary here; the workbench mounts after hydration.
    <Suspense fallback={null}>
      <ClientOnly>
        <Workbench />
      </ClientOnly>
    </Suspense>
  ),
});

const editableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  !!target.closest(
    "input, textarea, select, [contenteditable=true], .cm-editor",
  );

function useShortcuts(onOpen: () => void) {
  const { undo, redo, save } = useEditor.getState();
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        void save();
        return;
      }
      if (key === "o") {
        event.preventDefault();
        onOpen();
        return;
      }
      if (editableTarget(event.target)) return;
      if (key === "z" && !event.shiftKey) void undo();
      if ((key === "z" && event.shiftKey) || key === "y") void redo();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [onOpen, redo, save, undo]);
}

function CanvasView() {
  const {
    editable,
    configEditable,
    addTask,
    addZone,
    addFeature,
    addComponent,
  } = useRecipe();
  const clicks: {
    readonly [Type in PaletteItem["type"]]: (
      item: Extract<PaletteItem, { type: Type }>,
    ) => void;
  } = {
    task: ({ action }) => void addTask(action),
    zone: ({ kind, value }) => void addZone(kind, value),
    feature: ({ feature }) => void addFeature(feature),
    component: ({ family }) => void addComponent(family),
  };
  return (
    <ReactFlowProvider>
      <Palette
        disabled={{ recipe: !editable, config: !configEditable }}
        onAdd={(item) =>
          (clicks[item.type] as (item: PaletteItem) => void)(item)
        }
      />
      <RecipeCanvas />
      <Inspector />
    </ReactFlowProvider>
  );
}

function Workbench() {
  const { view = "canvas" } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const start = useEditor((store) => store.start);
  const select = useEditor((store) => store.select);
  const info = useEditor((store) => store.info);
  const opened = useEditor((store) => !!store.state?.recipe);
  const [choosing, setChoosing] = useState(false);
  const [running, setRunning] = useState(false);
  useEffect(() => start(), [start]);
  useShortcuts(() => setChoosing(true));
  const show = (next: EditorView, node?: string) => {
    if (node) select(node);
    void navigate({ search: next === "canvas" ? {} : { view: next } });
  };
  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        <Toolbar
          view={view}
          onView={(next) => show(next)}
          onOpen={() => setChoosing(true)}
          onRun={() => setRunning(true)}
        />
        <Notices />
        <main className="flex min-h-0 flex-1">
          {view === "canvas" && opened && <CanvasView />}
          {view === "yaml" && <YamlView role="recipe" />}
          {view === "config" && <ConfigView />}
          {view === "plan" && <PlanView />}
          {view === "runs" && <RunsView onRun={() => setRunning(true)} />}
          {view === "canvas" && !opened && (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Open or create a recipe to start.
            </div>
          )}
        </main>
        <StatusBar onShow={show} />
      </div>
      <OpenDialog
        open={choosing || (!!info && !opened)}
        onOpenChange={setChoosing}
      />
      <ConflictDialog />
      <RunDialog
        open={running}
        onOpenChange={setRunning}
        onStarted={() => show("runs")}
      />
    </TooltipProvider>
  );
}
