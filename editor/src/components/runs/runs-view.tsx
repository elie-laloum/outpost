import {
  Play,
  RefreshCw,
  RotateCcw,
  Square,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { observationText } from "@/lib/observation-text";
import { useRuns } from "@/lib/runs";
import type {
  Observation,
  RecipeEditorRun,
  RecipeRunStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Interventions } from "./interventions";
import { StatusBadge, runLabel } from "./run-status";

const time = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });

function RunList({ onRun }: { readonly onRun: () => void }) {
  const runs = useRuns((store) => store.runs);
  const selected = useRuns((store) => store.selected);
  const choose = useRuns((store) => store.choose);
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r">
      <div className="flex h-10 items-center gap-2 border-b px-3">
        <h2 className="flex-1 text-sm font-medium">Runs</h2>
        <Button size="sm" onClick={onRun}>
          <Play /> Run
        </Button>
      </div>
      <ul className="flex-1 overflow-y-auto" aria-label="Run history">
        {runs.length === 0 && (
          <li className="p-3 text-sm text-muted-foreground">
            No run yet. Runs started here are kept in .outpost/editor/runs.
          </li>
        )}
        {runs.map((run) => (
          <li key={run.id}>
            <button
              type="button"
              onClick={() => void choose(run.id)}
              aria-current={selected === run.id ? "true" : undefined}
              className={cn(
                "flex w-full flex-col gap-1 border-b px-3 py-2 text-left hover:bg-card",
                selected === run.id && "bg-secondary",
              )}
            >
              <span className="flex items-center gap-2">
                <StatusBadge status={runLabel(run)} />
                <span className="text-sm">{run.action}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {time(run.startedAt)}
                {run.runId && <span className="font-mono"> · {run.runId}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Log({ events }: { readonly events: readonly Observation[] }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    void end.current?.scrollIntoView({ block: "end" });
  }, [events]);
  const lines = events.flatMap((observation) => {
    const text = observationText(observation);
    return text === undefined ? [] : [{ observation, text }];
  });
  return (
    <div
      className="max-h-96 overflow-y-auto border bg-card p-3 font-mono text-xs"
      role="log"
      aria-label="Run events"
    >
      {lines.length === 0 && (
        <span className="text-muted-foreground">No event yet.</span>
      )}
      {lines.map(({ observation, text }) => (
        <div key={observation.seq} className="flex gap-3 whitespace-pre-wrap">
          <span className="shrink-0 text-muted-foreground">
            {observation.at.slice(11, 19)}
          </span>
          <span className="w-28 shrink-0 truncate text-primary">
            {observation.scope.taskKey ?? observation.source}
          </span>
          <span className="min-w-0 break-words">{text}</span>
        </div>
      ))}
      <div ref={end} />
    </div>
  );
}

function StoredState({ run }: { readonly run: RecipeEditorRun }) {
  const [status, setStatus] = useState<RecipeRunStatus | null>();
  const [error, setError] = useState<string>();
  const check = () =>
    api<{ status: RecipeRunStatus | null }>("/api/runs/status", { id: run.id })
      .then((result) => {
        setStatus(result.status);
        setError(undefined);
      })
      .catch((failure: unknown) =>
        setError(failure instanceof Error ? failure.message : String(failure)),
      );
  return (
    <section className="flex flex-col gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={() => void check()}
      >
        <RefreshCw /> Check stored state
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {status === null && (
        <p className="text-sm text-muted-foreground">
          No checkpoint is stored for {run.runId}.
        </p>
      )}
      {status && (
        <div className="flex flex-col gap-1 border p-3 text-xs">
          <span>
            Revision <span className="font-mono">{status.revision}</span>
            {status.owned ? ", owned by a running process" : ", not owned"}
          </span>
          <div className="flex flex-wrap gap-1">
            {status.tasks.map((task) => (
              <span key={task.key} className="flex items-center gap-1">
                <span className="font-mono">{task.key}</span>
                <StatusBadge status={task.status} />
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function RunDetail() {
  const detail = useRuns((store) => store.detail);
  const events = useRuns((store) => store.events);
  const tasks = useRuns((store) => store.tasks);
  const cancel = useRuns((store) => store.cancel);
  const start = useRuns((store) => store.start);
  const [retry, setRetry] = useState(false);
  if (!detail)
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Choose a run, or start one from the saved drafts.
      </div>
    );
  const { run, report } = detail;
  const running = run.state === "running";
  const resumable = !!run.runId && !running && run.status !== "done";
  const errors = report?.errors ?? [];
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <header className="flex flex-wrap items-center gap-3">
          <StatusBadge status={runLabel(run)} />
          <h2 className="text-sm font-medium">
            {run.action} · {time(run.startedAt)}
          </h2>
          {run.exitCode !== undefined && (
            <span className="text-xs text-muted-foreground">
              exit {run.exitCode ?? "by signal"}
            </span>
          )}
          <span className="ml-auto flex items-center gap-2">
            {running && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => void cancel(run.id)}
              >
                <Square /> Stop
              </Button>
            )}
            {resumable && (
              <>
                <label className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={retry}
                    onChange={(event) => setRetry(event.target.checked)}
                  />
                  Retry interrupted tasks
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void start({
                      action: "resume",
                      from: run.id,
                      ...(retry ? { retryIncomplete: true } : {}),
                    })
                  }
                >
                  <RotateCcw /> Resume
                </Button>
              </>
            )}
          </span>
        </header>
        <p className="font-mono text-xs text-muted-foreground">
          {run.recipe} · {run.config}
          {run.runId && ` · run ${run.runId}`}
        </p>
        {(run.message || errors.length > 0) && (
          <div
            role="alert"
            className="flex flex-col gap-1 border border-destructive/40 bg-destructive/10 p-3 text-sm"
          >
            {run.message && (
              <span className="flex gap-2">
                <TriangleAlert className="size-4 shrink-0 text-destructive" />
                {run.message}
              </span>
            )}
            {errors.map((error, index) => (
              <span key={index}>{error.message}</span>
            ))}
          </div>
        )}
        {report && <Interventions run={run} report={report} />}
        <section className="flex flex-wrap gap-2" aria-label="Task statuses">
          {Object.entries(tasks).map(([key, status]) => (
            <span
              key={key}
              className="flex items-center gap-1.5 border px-2 py-1"
            >
              <span className="font-mono text-xs">{key}</span>
              <StatusBadge status={status} />
            </span>
          ))}
        </section>
        <Log events={events} />
        {report && Object.keys(report.outputs).length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Outputs</h3>
            <pre className="max-h-80 overflow-auto border bg-card p-3 font-mono text-xs">
              {JSON.stringify(report.outputs, null, 2)}
            </pre>
          </section>
        )}
        {run.runId && !running && <StoredState run={run} />}
        {detail.stderr.trim() && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">
              Process error output
            </summary>
            <pre className="mt-2 max-h-60 overflow-auto border bg-card p-3 font-mono">
              {detail.stderr}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

/** Run history, live events and durable interventions. */
export function RunsView({ onRun }: { readonly onRun: () => void }) {
  const failure = useRuns((store) => store.failure);
  const dismiss = useRuns((store) => store.dismiss);
  return (
    <div className="flex min-h-0 flex-1">
      <RunList onRun={onRun} />
      <div className="flex min-w-0 flex-1 flex-col">
        {failure && (
          <div
            role="alert"
            className="flex items-center gap-2 border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-sm"
          >
            <TriangleAlert className="size-4 text-destructive" />
            <span className="flex-1">{failure}</span>
            <Button variant="ghost" size="sm" onClick={dismiss}>
              Dismiss
            </Button>
          </div>
        )}
        <RunDetail />
      </div>
    </div>
  );
}
