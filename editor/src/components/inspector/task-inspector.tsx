import { Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { diagnosticsByNode } from "@/lib/diagnostics";
import { taskTemplates } from "@/lib/templates";
import type { RecipeEditorNode } from "@/lib/types";
import { useRecipe } from "@/lib/use-recipe";
import { actionIcon } from "../canvas/action-icons";
import { ActionForm, type TaskSetter, record } from "./action-forms";
import { Problems } from "./problems";
import {
  EntityInspector,
  RunInspector,
  ZoneInspector,
} from "./scene-inspector";
import {
  type FieldValue,
  NumberField,
  TextField,
  YamlField,
  removed,
} from "./fields";

const keyPattern = {
  test: /^[A-Za-z0-9][A-Za-z0-9._-]*$/,
  message: "Use letters, digits, dots, dashes and underscores.",
};

function taskAt(recipe: unknown, index: number) {
  const tasks = record(recipe).tasks;
  return record(Array.isArray(tasks) ? tasks[index] : undefined);
}

function Dependencies({
  node,
  after,
}: {
  readonly node: RecipeEditorNode;
  readonly after: readonly string[];
}) {
  const { keys, edit, editable } = useRecipe();
  const key = node.key;
  if (!key) return null;
  const candidates = keys.filter(
    (other) => other !== key && !after.includes(other),
  );
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Runs after</Label>
      <div className="flex flex-wrap gap-1">
        {after.length === 0 && (
          <span className="text-xs text-muted-foreground">
            No dependency: the task can start first.
          </span>
        )}
        {after.map((source) => (
          <Badge key={source} variant="secondary" className="gap-1 font-mono">
            {source}
            <button
              type="button"
              aria-label={`Remove dependency on ${source}`}
              disabled={!editable}
              onClick={() =>
                void edit("recipe", [
                  { type: "disconnect", source, target: key },
                ])
              }
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      {candidates.length > 0 && (
        <Select
          value=""
          disabled={!editable}
          onValueChange={(source) =>
            void edit("recipe", [{ type: "connect", source, target: key }])
          }
        >
          <SelectTrigger size="sm" aria-label="Add a dependency">
            <SelectValue placeholder="Add a dependency…" />
          </SelectTrigger>
          <SelectContent>
            {candidates.map((candidate) => (
              <SelectItem key={candidate} value={candidate}>
                {candidate}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function TaskInspector({ node }: { readonly node: RecipeEditorNode }) {
  const { recipe, state, names, edit, select, editable } = useRecipe();
  const task = taskAt(recipe?.value, node.index);
  const problems =
    diagnosticsByNode(state?.diagnostics ?? []).get(`task:${node.id}`) ?? [];
  const set: TaskSetter = (path, value) =>
    void edit("recipe", [
      {
        type: "set",
        path: ["tasks", node.index, ...path],
        ...(value === removed ? {} : { value }),
      },
    ]);
  const Icon = actionIcon(node.action);
  const retry = record(task.retry);
  const after = Array.isArray(task.after)
    ? task.after.filter((item): item is string => typeof item === "string")
    : [];
  return (
    <fieldset disabled={!editable} className="flex flex-col gap-4">
      <header className="flex items-center gap-2">
        <Icon className="size-4 text-primary" aria-hidden />
        <h2 className="flex-1 truncate text-sm font-medium">
          {node.action ? taskTemplates[node.action].label : "Task"}
        </h2>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Delete task"
          disabled={!node.key}
          onClick={() => {
            if (!node.key) return;
            void edit("recipe", [{ type: "remove-task", key: node.key }]);
            select(undefined);
          }}
        >
          <Trash2 />
        </Button>
      </header>
      <Problems problems={problems} />
      <TextField
        label="Key"
        mono
        value={node.key}
        pattern={keyPattern}
        hint="Renaming updates dependencies and references."
        onCommit={(to) => {
          if (to === removed) return;
          if (!node.key) return set(["key"], to);
          void edit("recipe", [
            { type: "rename-task", key: node.key, to },
          ]).then((renamed) => renamed && select(`task:${to}`));
        }}
      />
      <Dependencies node={node} after={after} />
      <Separator />
      {node.action && (
        <ActionForm task={task} action={node.action} set={set} names={names} />
      )}
      {!node.action && (
        <p className="text-xs text-muted-foreground">
          Declare exactly one operation, such as command or agent, in the YAML
          view.
        </p>
      )}
      <Separator />
      <YamlField
        label="Condition"
        hint="Runs the task only when it holds, such as { eq: [{ $input: mode }, fast] }."
        value={task.when}
        onCommit={(value) => set(["when"], value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Retry attempts"
          minimum={1}
          value={retry.attempts}
          onCommit={(value: FieldValue<number>) =>
            set(["retry", "attempts"], value)
          }
        />
        <NumberField
          label="Retry delay (ms)"
          value={retry.delayMs}
          onCommit={(value) => set(["retry", "delayMs"], value)}
        />
      </div>
      <NumberField
        label="Timeout (ms)"
        minimum={1}
        value={task.timeoutMs}
        onCommit={(value) => set(["timeoutMs"], value)}
      />
    </fieldset>
  );
}

function RecipeInspector() {
  const { recipe, edit, editable } = useRecipe();
  const value = record(recipe?.value);
  const set = (path: string, next: FieldValue<unknown>) =>
    void edit("recipe", [
      {
        type: "set",
        path: [path],
        ...(next === removed ? {} : { value: next }),
      },
    ]);
  return (
    <fieldset disabled={!editable} className="flex flex-col gap-4">
      <h2 className="text-sm font-medium">Recipe</h2>
      <TextField
        label="Name"
        mono
        value={typeof value.name === "string" ? value.name : undefined}
        onCommit={(next) => set("name", next)}
      />
      <TextField
        label="Description"
        multiline
        value={
          typeof value.description === "string" ? value.description : undefined
        }
        onCommit={(next) => set("description", next)}
      />
      <YamlField
        label="Inputs"
        hint="Values requested at run time, such as goal: { type: string }."
        value={value.inputs}
        onCommit={(next) => set("inputs", next)}
      />
      <p className="text-xs text-muted-foreground">
        Select a task, zone or component to edit it, or press Delete to remove
        the selection.
      </p>
    </fieldset>
  );
}

/** Properties of the selected node, or of the recipe when nothing is selected. */
export function Inspector() {
  const { graph, scene, selected } = useRecipe();
  const task = graph?.nodes.find((item) => `task:${item.id}` === selected);
  const zone = scene?.zones.find((item) => `zone:${item.id}` === selected);
  const entity = scene?.entities.find(
    (item) => `entity:${item.id}` === selected,
  );
  return (
    <aside
      className="w-80 shrink-0 overflow-y-auto border-l bg-background p-4"
      aria-label="Properties"
    >
      {task && <TaskInspector key={task.id} node={task} />}
      {zone && <ZoneInspector key={zone.id} zone={zone} />}
      {entity && <EntityInspector key={entity.id} entity={entity} />}
      {selected === "run" && <RunInspector />}
      {!task && !zone && !entity && selected !== "run" && <RecipeInspector />}
    </aside>
  );
}
