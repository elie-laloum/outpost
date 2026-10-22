import { type ReactNode, useEffect } from "react";
import {
  type FieldKind,
  type JsonSchema,
  documentSchema,
  fieldKind,
  schemaAt,
  schemaChoice,
  schemaNames,
  schemaProperties,
  schemaVariant,
} from "@/lib/schema";
import { useEditor } from "@/lib/store";
import { record } from "./action-forms";
import {
  ChoiceField,
  type FieldValue,
  ListField,
  NumberField,
  TextField,
  YamlField,
} from "./fields";

type Path = readonly (string | number)[];
export type SchemaSetter = (path: Path, value: FieldValue<unknown>) => void;

interface FieldProps {
  readonly root: JsonSchema;
  readonly schema: unknown;
  readonly label: string;
  readonly value: unknown;
  readonly path: Path;
  readonly set: SchemaSetter;
  readonly depth: number;
  readonly choices?: readonly string[];
}

const fields: Readonly<Record<FieldKind, (props: FieldProps) => ReactNode>> = {
  text: ({ label, value, path, set }) => (
    <TextField
      label={label}
      mono
      value={typeof value === "string" ? value : undefined}
      onCommit={(next) => set(path, next)}
    />
  ),
  number: ({ label, value, path, set }) => (
    <NumberField
      label={label}
      value={value}
      onCommit={(next) => set(path, next)}
    />
  ),
  boolean: ({ label, value, path, set }) => (
    <ChoiceField
      label={label}
      value={typeof value === "boolean" ? String(value) : undefined}
      choices={["true", "false"]}
      onCommit={(next) => set(path, next === "true")}
    />
  ),
  choice: ({ label, value, path, set, choices = [] }) => (
    <ChoiceField
      label={label}
      value={typeof value === "string" ? value : undefined}
      choices={choices}
      onCommit={(next) => set(path, next)}
    />
  ),
  list: ({ label, value, path, set }) => (
    <ListField
      label={label}
      value={value}
      onCommit={(next) => set(path, next)}
    />
  ),
  object: (props) =>
    props.depth > 2 ? (
      fields.yaml(props)
    ) : (
      <details open={props.value !== undefined} className="border-l pl-3">
        <summary className="cursor-pointer font-mono text-xs select-none">
          {props.label}
        </summary>
        <div className="mt-3">
          <SchemaForm {...props} depth={props.depth + 1} />
        </div>
      </details>
    ),
  yaml: ({ label, value, path, set }) => (
    <YamlField
      label={label}
      value={value}
      onCommit={(next) => set(path, next)}
    />
  ),
};

/**
 * Fields for a value of a JSON Schema: a choice for the property that names its variant,
 * the fields it holds or requires, and the other fields folded away.
 */
export function SchemaForm({
  root,
  schema,
  value,
  path,
  set,
  depth = 0,
  hidden = [],
}: Omit<FieldProps, "label" | "depth"> & {
  readonly depth?: number;
  /** Fields the canvas edits, kept when the variant changes. */
  readonly hidden?: readonly string[];
}) {
  const choice = schemaChoice(root, schema, value);
  const variant = schemaVariant(root, choice, value);
  const current = record(value);
  if (variant && variant === choice.reference)
    return fields.text({
      root,
      schema: undefined,
      label: "$ref",
      value: current.$ref,
      path: [...path, "$ref"],
      set,
      depth,
    });
  if (!variant?.properties)
    return fields.yaml({
      root,
      schema,
      label: "Value",
      value,
      path,
      set,
      depth,
    });
  const { discriminator } = choice;
  // A new variant keeps the canvas fields and the fields it still accepts.
  const switched = (next: string) => {
    const target = choice.variants.find((item) =>
      schemaNames(root, schemaProperties(item)[discriminator!]).includes(next),
    );
    const accepted = schemaProperties(target ?? {});
    return {
      ...Object.fromEntries(
        Object.entries(current).filter(
          ([key]) =>
            key !== discriminator && (hidden.includes(key) || key in accepted),
        ),
      ),
      [discriminator!]: next,
    };
  };
  const names = choice.variants.flatMap((item) =>
    discriminator
      ? schemaNames(root, schemaProperties(item)[discriminator]).filter(
          (name): name is string => typeof name === "string",
        )
      : [],
  );
  const required = new Set(
    Array.isArray(variant.required) ? variant.required : [],
  );
  const entries = Object.entries(schemaProperties(variant)).filter(
    ([key]) =>
      key !== discriminator && key !== "$schema" && !hidden.includes(key),
  );
  const field = ([key, property]: [string, unknown]) => {
    const { kind, choices } = fieldKind(root, property);
    const Field = fields[kind];
    return (
      <Field
        key={key}
        root={root}
        schema={property}
        label={required.has(key) ? `${key} *` : key}
        value={current[key]}
        path={[...path, key]}
        set={set}
        depth={depth}
        {...(choices ? { choices } : {})}
      />
    );
  };
  const shown = entries.filter(([key]) => key in current || required.has(key));
  const folded = entries.filter(
    ([key]) => !(key in current) && !required.has(key),
  );
  return (
    <div className="flex flex-col gap-3">
      {discriminator && names.length > 1 && (
        <ChoiceField
          label={discriminator}
          value={
            typeof current[discriminator] === "string"
              ? (current[discriminator] as string)
              : undefined
          }
          choices={names}
          hint="Changing it keeps the fields the new choice accepts."
          onCommit={(next) => set(path, switched(next))}
        />
      )}
      {shown.map(field)}
      {folded.length > 0 && (
        <details>
          <summary className="cursor-pointer text-xs text-muted-foreground select-none">
            More fields ({folded.length})
          </summary>
          <div className="mt-3 flex flex-col gap-3">{folded.map(field)}</div>
        </details>
      )}
    </div>
  );
}

/** The version 3 document schema of a file, fetched once. */
export function useDocumentSchema(name: "recipe" | "configuration") {
  const schema = useEditor((store) => store.schemas[name]);
  const load = useEditor((store) => store.loadSchema);
  useEffect(() => load(name), [load, name]);
  return schema && { root: schema, document: documentSchema(schema) };
}

/** A schema form for the value at a path of a document, or YAML until the schema arrives. */
export function DocumentForm({
  name,
  value,
  path,
  set,
  hidden,
}: {
  readonly name: "recipe" | "configuration";
  readonly value: unknown;
  readonly path: Path;
  readonly set: SchemaSetter;
  readonly hidden?: readonly string[];
}) {
  const schema = useDocumentSchema(name);
  const target = schema && schemaAt(schema.root, schema.document, path);
  if (!schema || !target)
    return (
      <YamlField
        label="Declaration"
        value={value}
        onCommit={(next) => set(path, next)}
      />
    );
  return (
    <SchemaForm
      root={schema.root}
      schema={target}
      value={value}
      path={path}
      set={set}
      {...(hidden ? { hidden } : {})}
    />
  );
}
