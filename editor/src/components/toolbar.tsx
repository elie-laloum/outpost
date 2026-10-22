import {
  FileCode2,
  FolderOpen,
  ListChecks,
  LoaderCircle,
  Network,
  Play,
  Redo2,
  Puzzle,
  Save,
  Undo2,
  History,
} from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRuns } from "@/lib/runs";
import { useEditor } from "@/lib/store";
import type { EditorView } from "@/lib/types";

const shortcut =
  typeof navigator !== "undefined" && /Mac/.test(navigator.platform)
    ? "⌘"
    : "Ctrl+";

function Action({
  label,
  keys,
  children,
  ...props
}: ComponentProps<typeof Button> & { label: string; keys?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {keys ? `${label} (${shortcut}${keys})` : label}
      </TooltipContent>
    </Tooltip>
  );
}

function FileName({
  path,
  dirty,
}: {
  readonly path?: string;
  readonly dirty?: boolean;
}) {
  if (!path) return null;
  return (
    <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
      {path}
      {dirty && (
        <span className="size-1.5 bg-primary" aria-label="Unsaved changes" />
      )}
    </span>
  );
}

export function Toolbar({
  view,
  onView,
  onOpen,
  onRun,
}: {
  readonly view: EditorView;
  readonly onView: (view: EditorView) => void;
  readonly onOpen: () => void;
  readonly onRun: () => void;
}) {
  const active = useRuns((store) =>
    store.runs.some((run) => run.state === "running"),
  );
  const state = useEditor((store) => store.state);
  const pending = useEditor((store) => store.pending);
  const undo = useEditor((store) => store.undo);
  const redo = useEditor((store) => store.redo);
  const save = useEditor((store) => store.save);
  const dirty =
    !!state &&
    (state.recipe?.dirty || state.config?.dirty || state.layoutDirty);
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b px-3">
      <div className="flex items-baseline gap-2 pr-2">
        <span className="font-semibold tracking-tight">Outpost</span>
        <span className="text-xs text-muted-foreground">recipe editor</span>
      </div>
      <Action
        label="Open"
        variant="ghost"
        size="icon-sm"
        onClick={onOpen}
        keys="O"
      >
        <FolderOpen />
      </Action>
      <div className="flex min-w-0 items-center gap-3">
        <FileName path={state?.recipe?.path} dirty={state?.recipe?.dirty} />
        <FileName path={state?.config?.path} dirty={state?.config?.dirty} />
      </div>
      <Tabs
        value={view}
        onValueChange={(next) => onView(next as EditorView)}
        className="mx-auto"
      >
        <TabsList>
          <TabsTrigger value="canvas">
            <Network /> Canvas
          </TabsTrigger>
          <TabsTrigger value="yaml">
            <FileCode2 /> YAML
          </TabsTrigger>
          <TabsTrigger value="extensions" disabled={!state?.config}>
            <Puzzle /> Extensions
          </TabsTrigger>
          <TabsTrigger value="plan" disabled={!state?.config}>
            <ListChecks /> Plan
          </TabsTrigger>
          <TabsTrigger value="runs" disabled={!state?.config}>
            <History /> Runs
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Action
        label="Undo"
        variant="ghost"
        size="icon-sm"
        keys="Z"
        disabled={!state?.canUndo}
        onClick={() => void undo()}
      >
        <Undo2 />
      </Action>
      <Action
        label="Redo"
        variant="ghost"
        size="icon-sm"
        keys="Shift+Z"
        disabled={!state?.canRedo}
        onClick={() => void redo()}
      >
        <Redo2 />
      </Action>
      <Button
        size="sm"
        disabled={!dirty || pending > 0}
        onClick={() => void save()}
      >
        <Save /> Save
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={!state?.recipe || !state.config || active}
        onClick={onRun}
      >
        {active ? <LoaderCircle className="animate-spin" /> : <Play />}
        {active ? "Running" : "Run"}
      </Button>
    </header>
  );
}
