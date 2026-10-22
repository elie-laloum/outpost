/** A JSON Schema node, as the editor's recipe and configuration schemas publish them. */
export type JsonSchema = Readonly<Record<string, unknown>>;

/** How a form edits a value of a schema. */
export type FieldKind =
  "text" | "number" | "boolean" | "choice" | "list" | "object" | "yaml";

/** The alternatives a value may take, the property naming them and the `$ref` form when allowed. */
export interface SchemaChoice {
  readonly variants: readonly JsonSchema[];
  readonly discriminator?: string;
  readonly reference?: JsonSchema;
}

const discriminators = ["type", "kind", "provider", "mode", "policy"];

function object(value: unknown): JsonSchema | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonSchema)
    : undefined;
}

export function schemaProperties(schema: JsonSchema): JsonSchema {
  return object(schema.properties) ?? {};
}

function required(schema: JsonSchema): readonly string[] {
  return Array.isArray(schema.required)
    ? schema.required.filter((key): key is string => typeof key === "string")
    : [];
}

/** Follows local `#/$defs/` references, stopping on a cycle. */
export function resolveSchema(
  root: JsonSchema,
  schema: unknown,
): JsonSchema | undefined {
  let current = object(schema);
  const seen = new Set<string>();
  while (
    current &&
    typeof current.$ref === "string" &&
    current.$ref.startsWith("#/$defs/") &&
    !seen.has(current.$ref)
  ) {
    seen.add(current.$ref);
    current = object(
      object(root.$defs)?.[
        decodeURIComponent(current.$ref.slice("#/$defs/".length))
      ],
    );
  }
  return current;
}

/** Every alternative of a schema, with nested `anyOf` and `oneOf` flattened. */
export function schemaVariants(
  root: JsonSchema,
  schema: unknown,
): JsonSchema[] {
  const resolved = resolveSchema(root, schema);
  if (!resolved) return [];
  const options = resolved.anyOf ?? resolved.oneOf;
  if (!Array.isArray(options)) return [resolved];
  return options.flatMap((option) => schemaVariants(root, option));
}

export function constantOf(root: JsonSchema, schema: unknown): unknown {
  const resolved = resolveSchema(root, schema);
  if (!resolved) return undefined;
  if ("const" in resolved) return resolved.const;
  return Array.isArray(resolved.enum) && resolved.enum.length === 1
    ? resolved.enum[0]
    : undefined;
}

/** The values a schema names with `const` or `enum`, directly or through its variants. */
export function schemaNames(root: JsonSchema, schema: unknown): unknown[] {
  return schemaVariants(root, schema).flatMap((variant) => {
    if ("const" in variant) return [variant.const];
    return Array.isArray(variant.enum) ? variant.enum : [];
  });
}

function isReference(schema: JsonSchema): boolean {
  const keys = required(schema);
  return keys.length === 1 && keys[0] === "$ref";
}

/** The variant of a versioned document schema that describes version 3. */
export function documentSchema(root: JsonSchema): JsonSchema | undefined {
  return (
    schemaVariants(root, root).find(
      (variant) => constantOf(root, schemaProperties(variant).version) === 3,
    ) ?? resolveSchema(root, root)
  );
}

/** The schema of the value at a path, following properties, maps and lists through every variant. */
export function schemaAt(
  root: JsonSchema,
  schema: JsonSchema | undefined,
  path: readonly (string | number)[],
): JsonSchema | undefined {
  let current = schema;
  for (const part of path) {
    if (!current) return undefined;
    const next = schemaVariants(root, current)
      .map((variant) =>
        typeof part === "number"
          ? variant.items
          : (schemaProperties(variant)[part] ??
            object(variant.additionalProperties)),
      )
      .find((candidate) => candidate !== undefined);
    current = resolveSchema(root, next);
  }
  return current;
}

/** Alternatives of a schema; when several properties name variants, the one the value uses wins. */
export function schemaChoice(
  root: JsonSchema,
  schema: unknown,
  value?: unknown,
): SchemaChoice {
  const all = schemaVariants(root, schema);
  const reference = all.find(isReference);
  const variants = all.filter((variant) => !isReference(variant));
  const named = (key: string) =>
    variants.filter(
      (variant) => schemaNames(root, schemaProperties(variant)[key]).length,
    ).length;
  const used = Object.keys(object(value) ?? {});
  const keys = [
    ...used,
    ...discriminators,
    ...new Set(
      variants.flatMap((variant) => Object.keys(schemaProperties(variant))),
    ),
  ];
  const discriminator = keys.find((key) => named(key) > 1);
  return {
    variants,
    ...(discriminator ? { discriminator } : {}),
    ...(reference ? { reference } : {}),
  };
}

function matches(root: JsonSchema, schema: JsonSchema, value: unknown) {
  const constant = constantOf(root, schema);
  if (constant !== undefined) return constant === value;
  const type = schema.type ?? (schema.properties ? "object" : undefined);
  if (Array.isArray(value)) return type === "array";
  if (value === null) return type === "null";
  if (typeof value === "object") return type === "object";
  if (typeof value === "number") return type === "number" || type === "integer";
  return type === typeof value;
}

/** The variant that describes a value: its `$ref` form, its discriminator, its type or its required fields. */
export function schemaVariant(
  root: JsonSchema,
  choice: SchemaChoice,
  value: unknown,
): JsonSchema | undefined {
  const fields = object(value);
  if (fields && "$ref" in fields && choice.reference) return choice.reference;
  const { discriminator } = choice;
  const names = (variant: JsonSchema) =>
    discriminator
      ? schemaNames(root, schemaProperties(variant)[discriminator])
      : [];
  const named =
    fields && discriminator
      ? choice.variants.find((variant) =>
          names(variant).includes(fields[discriminator]),
        )
      : undefined;
  if (named) return named;
  const typed = choice.variants.filter(
    (variant) =>
      value === undefined ||
      (matches(root, variant, value) &&
        (!fields || required(variant).every((key) => key in fields))),
  );
  return (
    typed.find((variant) => !names(variant).length) ??
    typed[0] ??
    choice.variants[0]
  );
}

/** The field that edits a value of the schema; anything without a simple form is edited as YAML. */
export function fieldKind(
  root: JsonSchema,
  schema: unknown,
): { readonly kind: FieldKind; readonly choices?: readonly string[] } {
  const variants = schemaChoice(root, schema).variants;
  const constants = variants.flatMap((variant) => {
    if (constantOf(root, variant) !== undefined)
      return [constantOf(root, variant)];
    return Array.isArray(variant.enum) ? variant.enum : [undefined];
  });
  if (constants.length && constants.every((item) => typeof item === "boolean"))
    return { kind: "boolean" };
  if (constants.length && constants.every((item) => typeof item === "string"))
    return { kind: "choice", choices: constants as string[] };
  if (variants.length > 1)
    return {
      kind: variants.every((variant) => variant.properties) ? "object" : "yaml",
    };
  const [only] = variants;
  if (!only) return { kind: "yaml" };
  const kinds: Readonly<Record<string, FieldKind>> = {
    string: "text",
    number: "number",
    integer: "number",
    boolean: "boolean",
  };
  const kind = typeof only.type === "string" ? kinds[only.type] : undefined;
  if (kind) return { kind };
  const items = resolveSchema(root, only.items);
  if (only.type === "array" && items?.type === "string")
    return { kind: "list" };
  return { kind: only.properties ? "object" : "yaml" };
}
