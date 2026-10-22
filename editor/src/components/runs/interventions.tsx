import { Check, ShieldAlert, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRuns } from "@/lib/runs";
import { useEditor } from "@/lib/store";
import type {
  RecipeEditorRun,
  RecipeReport,
  TaskRecord,
  WorkflowInputRequest,
} from "@/lib/types";
import { record } from "../inspector/action-forms";

/** Actors the recipe draft names for a task's dialogue. */
function useActors(key: string): readonly string[] {
  const recipe = useEditor((store) => store.state?.recipe?.value);
  return useMemo(() => {
    const tasks = record(recipe).tasks;
    const task = record(
      Array.isArray(tasks)
        ? tasks.find((item) => record(item).key === key)
        : undefined,
    );
    const actors = record(task.interactive).actors ?? record(task.gate).actors;
    return Array.isArray(actors)
      ? actors.filter((actor): actor is string => typeof actor === "string")
      : [];
  }, [recipe, key]);
}

function Actor({
  id,
  actors,
  value,
  onChange,
}: {
  readonly id: string;
  readonly actors: readonly string[];
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>Actor</Label>
      <Input
        id={id}
        list={`${id}-actors`}
        className="font-mono text-xs"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <datalist id={`${id}-actors`}>
        {actors.map((actor) => (
          <option key={actor} value={actor} />
        ))}
      </datalist>
    </div>
  );
}

function AnswerForm({
  run,
  request,
}: {
  readonly run: RecipeEditorRun;
  readonly request: WorkflowInputRequest;
}) {
  const start = useRuns((store) => store.start);
  const actors = useActors(request.key);
  const [actor, setActor] = useState(actors[0] ?? "");
  const [value, setValue] = useState("");
  const free = request.allowFreeText || !request.choices?.length;
  return (
    <div className="flex flex-col gap-3 border border-warning/40 p-4">
      <p className="text-sm">
        <span className="font-mono text-xs text-muted-foreground">
          {request.key}
        </span>{" "}
        {request.question}
      </p>
      {request.choices && (
        <div className="flex flex-wrap gap-2">
          {request.choices.map((choice) => (
            <Button
              key={choice}
              size="sm"
              variant={value === choice ? "default" : "outline"}
              onClick={() => setValue(choice)}
            >
              {choice}
            </Button>
          ))}
        </div>
      )}
      {free && (
        <Input
          aria-label="Answer"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      )}
      <Actor
        id={`answer-${request.id}`}
        actors={actors}
        value={actor}
        onChange={setActor}
      />
      <Button
        size="sm"
        className="self-start"
        disabled={!value || !actor}
        onClick={() =>
          void start({
            action: "answer",
            from: run.id,
            answer: {
              executionId: request.executionId,
              key: request.key,
              requestId: request.id,
              actor,
              value,
            },
          })
        }
      >
        <Check /> Answer and resume
      </Button>
    </div>
  );
}

function GateForm({
  run,
  report,
  task,
}: {
  readonly run: RecipeEditorRun & { readonly runId: string };
  readonly report: RecipeReport;
  readonly task: TaskRecord & {
    readonly pause: NonNullable<TaskRecord["pause"]>;
  };
}) {
  const start = useRuns((store) => store.start);
  const [actor, setActor] = useState(task.pause.actors[0] ?? "");
  const [reason, setReason] = useState("");
  const { pause } = task;
  if (pause.authentication === "signed")
    return (
      <div className="flex flex-col gap-2 border border-warning/40 p-4 text-sm">
        <p className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-warning" />
          {pause.prompt}
        </p>
        <p className="text-xs text-muted-foreground">
          This gate requires a signed decision. Sign a decision file with its
          proof outside the editor, then submit it:
        </p>
        <code className="block bg-secondary p-2 font-mono text-xs break-all">
          {`outpost recipe decide --file ${run.recipe} --config ${run.config} --run-id ${run.runId} --decision decision.json`}
        </code>
      </div>
    );
  const approve = pause.kind === "pause" ? "resume" : "approve";
  const decide = (action: "approve" | "resume" | "reject") =>
    void start({
      action: "decide",
      from: run.id,
      decision: {
        executionId: report.executionId ?? "",
        key: task.key,
        requestId: pause.id,
        action,
        actor,
        reason,
      },
    });
  return (
    <div className="flex flex-col gap-3 border border-warning/40 p-4">
      <p className="text-sm">
        <span className="font-mono text-xs text-muted-foreground">
          {task.key}
        </span>{" "}
        {pause.prompt}
      </p>
      <Actor
        id={`gate-${pause.id}`}
        actors={pause.actors}
        value={actor}
        onChange={setActor}
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`reason-${pause.id}`}>Reason</Label>
        <Textarea
          id={`reason-${pause.id}`}
          rows={2}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!actor || !report.executionId}
          onClick={() => decide(approve)}
        >
          <Check /> {approve === "resume" ? "Resume" : "Approve"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!actor || !report.executionId}
          onClick={() => decide("reject")}
        >
          <X /> Reject
        </Button>
      </div>
    </div>
  );
}

/** Pending questions and gates of a finished run, answered by a durable resume. */
export function Interventions({
  run,
  report,
}: {
  readonly run: RecipeEditorRun;
  readonly report: RecipeReport;
}) {
  const requests =
    run.status === "waiting-input" ? (report.inputRequests ?? []) : [];
  const gates = report.tasks.filter(
    (task): task is TaskRecord & { pause: NonNullable<TaskRecord["pause"]> } =>
      task.status === "paused" && !!task.pause,
  );
  if (!requests.length && !gates.length) return null;
  const { runId } = run;
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">Waiting for you</h3>
      {!runId && (
        <p className="text-sm text-warning">
          Answers and decisions resume a durable run. Declare
          workflow.checkpoint in the recipe to continue this one later.
        </p>
      )}
      {runId &&
        requests.map((request) => (
          <AnswerForm key={request.id} run={run} request={request} />
        ))}
      {runId &&
        gates.map((task) => (
          <GateForm
            key={task.pause.id}
            run={{ ...run, runId }}
            report={report}
            task={task}
          />
        ))}
    </section>
  );
}
