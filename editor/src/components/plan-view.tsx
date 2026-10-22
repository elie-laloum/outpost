import { RefreshCw, TriangleAlert } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useEditor } from "@/lib/store";
import type { RecipePlan } from "@/lib/types";

function Row({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-4 border-b py-2 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function sandboxSummary(plan: RecipePlan): string {
  const sandbox = plan.sandbox;
  if (!sandbox) return "Resolved by the configuration";
  if (!sandbox.placement)
    return `${sandbox.provider}, capabilities checked at execution`;
  return `${sandbox.provider} (${sandbox.placement}; supports ${sandbox.bindings?.join(", ")})`;
}

/** The static plan `outpost recipe plan` prints, computed from the unsaved drafts. */
export function PlanView() {
  const revision = useEditor((store) => store.state?.revision);
  const ready = useEditor(
    (store) => !!store.state?.recipe && !!store.state.config,
  );
  const [plan, setPlan] = useState<RecipePlan>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    const timer = setTimeout(() => {
      api<RecipePlan>("/api/project/plan")
        .then((next) => {
          setPlan(next);
          setError(undefined);
        })
        .catch((failure: unknown) =>
          setError(
            failure instanceof Error ? failure.message : String(failure),
          ),
        )
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [ready, revision]);
  if (!ready)
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        The plan needs both a recipe and a configuration.
      </div>
    );
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="flex-1 text-sm font-medium">Execution plan</h2>
          {loading && (
            <RefreshCw
              className="size-4 animate-spin text-muted-foreground"
              aria-label="Updating"
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          A static plan of the unsaved drafts: no sandbox is allocated, no
          secret is read and no extension is imported. Runtime capabilities are
          checked again before execution.
        </p>
        {error && (
          <div
            role="alert"
            className="flex gap-2 border border-destructive/40 bg-destructive/10 p-3 text-sm"
          >
            <TriangleAlert className="size-4 shrink-0 text-destructive" />
            {error}
          </div>
        )}
        {plan && (
          <dl className="border px-4">
            <Row label="Recipe">{plan.name}</Row>
            <Row label="Workspace">
              <code className="font-mono text-xs">
                {JSON.stringify(plan.workspace)}
              </code>
            </Row>
            {plan.binding && (
              <Row label="Binding">{`${plan.binding} on ${sandboxSummary(plan)}`}</Row>
            )}
            {(plan.agents ?? []).map((agent) => (
              <Row key={agent.component} label={`Agent ${agent.component}`}>
                {agent.candidates
                  .map((candidate) =>
                    candidate.harness
                      ? `${candidate.harness}, continuation ${candidate.continuation ? "supported" : "unsupported"}`
                      : `${candidate.component}, capabilities checked at execution`,
                  )
                  .join("; or ")}
              </Row>
            ))}
            <Row label="Environment">
              {plan.environment.join(", ") || "none"}
            </Row>
            <Row label="Tasks">
              <ol className="flex flex-col gap-1">
                {plan.tasks.map((task) => (
                  <li key={task.key} className="font-mono text-xs">
                    {task.key}
                    {task.after.length > 0 && (
                      <span className="text-muted-foreground">
                        {" "}
                        after {task.after.join(", ")}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </Row>
            <Row label="Components">
              <div className="flex flex-wrap gap-1">
                {plan.requirements.length === 0 && "none"}
                {plan.requirements.map((item) => (
                  <Badge
                    key={item.name}
                    variant={item.extension ? "default" : "secondary"}
                    className="font-mono"
                  >
                    {item.name}
                  </Badge>
                ))}
              </div>
            </Row>
            <Row label="Publications">
              {plan.outputs.length +
                Object.values(plan.workspaceOutputs).flat().length}
            </Row>
          </dl>
        )}
      </div>
    </div>
  );
}
