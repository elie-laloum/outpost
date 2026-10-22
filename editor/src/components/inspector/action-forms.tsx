import type { ReactNode } from "react";
import { taskTemplates } from "@/lib/templates";
import type { ConfigurationNames, RecipeEditorAction } from "@/lib/types";
import {
  ChoiceField,
  type FieldValue,
  ListField,
  TextField,
  YamlField,
  removed,
} from "./fields";

export type TaskSetter = (
  path: readonly (string | number)[],
  value: FieldValue<unknown>,
) => void;

export interface ActionFormProps {
  readonly task: Readonly<Record<string, unknown>>;
  readonly action: RecipeEditorAction;
  readonly set: TaskSetter;
  readonly names: ConfigurationNames;
}

export function record(value: unknown): Readonly<Record<string, unknown>> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

const text = (value: unknown) =>
  typeof value === "string" ? value : undefined;

function referenceName(value: unknown, section: string): string | undefined {
  const target = text(record(value).$ref);
  return target?.startsWith(`${section}.`)
    ? target.slice(section.length + 1)
    : undefined;
}

function CommandForm({ task, set }: ActionFormProps) {
  const command = record(task.command);
  return (
    <>
      <TextField
        label="Executable"
        mono
        value={text(command.executable)}
        onCommit={(value) => set(["command", "executable"], value)}
      />
      <ListField
        label="Arguments"
        value={command.arguments}
        onCommit={(value) => set(["command", "arguments"], value)}
      />
      <TextField
        label="Working directory"
        mono
        hint="Relative to the workspace; defaults to its root."
        value={text(command.directory)}
        onCommit={(value) => set(["command", "directory"], value)}
      />
      <YamlField
        label="Environment variables"
        hint="A map of names to values, such as LOG_LEVEL: debug."
        value={command.variables}
        onCommit={(value) => set(["command", "variables"], value)}
      />
    </>
  );
}

function AgentForm({ task, set, names }: ActionFormProps) {
  return (
    <>
      <ChoiceField
        label="Agent"
        hint="Agents are declared under agents in the configuration."
        value={text(task.agent)}
        choices={names.agents}
        onCommit={(value) => set(["agent"], value)}
      />
      <TextField
        label="Brief"
        multiline
        hint="Use {{ inputs.name }} or {{ steps.key.path }} to insert values."
        value={text(task.brief)}
        onCommit={(value) => set(["brief"], value)}
      />
    </>
  );
}

function GateForm({ task, set }: ActionFormProps) {
  const gate = record(task.gate);
  return (
    <>
      <ChoiceField
        label="Kind"
        value={text(gate.kind)}
        choices={["approval", "pause"]}
        onCommit={(value) => set(["gate", "kind"], value)}
      />
      <TextField
        label="Prompt"
        multiline
        value={text(gate.prompt)}
        onCommit={(value) => set(["gate", "prompt"], value)}
      />
      <ListField
        label="Actors"
        hint="Who may answer, one per line."
        value={gate.actors}
        onCommit={(value) => set(["gate", "actors"], value)}
      />
      <ChoiceField
        label="Authentication"
        hint="Signed gates are answered with the outpost recipe decide command."
        value={text(gate.authentication) ?? "unsigned"}
        choices={["unsigned", "signed"]}
        onCommit={(value) =>
          set(["gate", "authentication"], value === "signed" ? value : removed)
        }
      />
    </>
  );
}

function CallForm({ task, set, names }: ActionFormProps) {
  return (
    <>
      <ChoiceField
        label="Function"
        hint="Functions alias callback extensions in the configuration."
        value={referenceName(task.call, "functions")}
        choices={names.functions}
        onCommit={(value) => set(["call"], { $ref: `functions.${value}` })}
      />
      <YamlField
        label="Arguments"
        value={task.arguments}
        onCommit={(value) => set(["arguments"], value)}
      />
    </>
  );
}

function ValueForm({ task, set }: ActionFormProps) {
  return (
    <YamlField
      label="Value"
      hint="A literal, or { $input: name } and { $step: key, path: [field] } references."
      value={task.value}
      onCommit={(value) => set(["value"], value === removed ? null : value)}
    />
  );
}

function ReferenceForm({ task, action, set }: ActionFormProps) {
  return (
    <TextField
      label="Configuration entry"
      mono
      hint="The component declared in the configuration, such as gates.review."
      value={text(record(task[action]).$ref)}
      onCommit={(value) => set([action, "$ref"], value)}
    />
  );
}

function GenericForm({ task, action, set }: ActionFormProps) {
  return (
    <YamlField
      label={taskTemplates[action].label}
      hint="Edited as YAML; the YAML view shows the whole recipe."
      value={task[action]}
      onCommit={(value) => set([action], value)}
    />
  );
}

const actionForms: Partial<
  Record<RecipeEditorAction, (props: ActionFormProps) => ReactNode>
> = {
  command: CommandForm,
  agent: AgentForm,
  gate: GateForm,
  call: CallForm,
  value: ValueForm,
};

/** The form for a task kind; a `$ref` to a configuration component edits only the reference. */
export function ActionForm(props: ActionFormProps) {
  const reference =
    props.action !== "call" &&
    typeof record(props.task[props.action]).$ref === "string";
  if (reference) return <ReferenceForm {...props} />;
  const Form = actionForms[props.action] ?? GenericForm;
  return <Form {...props} />;
}
