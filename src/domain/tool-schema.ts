import { invariant } from "./errors.ts";
import { JSON_SCHEMA_KEYWORDS, JSON_SCHEMA_TYPES } from "./tool.constants.ts";
import type { JsonSchema, SchemaKeywordCheck } from "./tool.types.ts";

const plain = (value: unknown): value is Readonly<Record<string, unknown>> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const same = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);

const typeChecks: Readonly<Record<string, (value: unknown) => boolean>> = {
  object: plain,
  array: Array.isArray,
  string: (value) => typeof value === "string",
  number: (value) => typeof value === "number" && Number.isFinite(value),
  integer: (value) => Number.isInteger(value),
  boolean: (value) => typeof value === "boolean",
  null: (value) => value === null,
};

const keywordChecks: Readonly<Record<string, SchemaKeywordCheck>> = {
  enum: (schema, value, path) =>
    (schema.enum as readonly unknown[]).some((option) => same(option, value))
      ? []
      : [`${path} must be one of ${JSON.stringify(schema.enum)}`],
  const: (schema, value, path) =>
    same(schema.const, value)
      ? []
      : [`${path} must equal ${JSON.stringify(schema.const)}`],
  minLength: bound((value) =>
    typeof value === "string" ? [...value].length : undefined,
  )("minLength", (size, limit) => size >= limit, "at least", "characters"),
  maxLength: bound((value) =>
    typeof value === "string" ? [...value].length : undefined,
  )("maxLength", (size, limit) => size <= limit, "at most", "characters"),
  minimum: bound((value) => (typeof value === "number" ? value : undefined))(
    "minimum",
    (size, limit) => size >= limit,
    "at least",
    "",
  ),
  maximum: bound((value) => (typeof value === "number" ? value : undefined))(
    "maximum",
    (size, limit) => size <= limit,
    "at most",
    "",
  ),
  minItems: bound((value) => (Array.isArray(value) ? value.length : undefined))(
    "minItems",
    (size, limit) => size >= limit,
    "at least",
    "items",
  ),
  maxItems: bound((value) => (Array.isArray(value) ? value.length : undefined))(
    "maxItems",
    (size, limit) => size <= limit,
    "at most",
    "items",
  ),
  items: (schema, value, path) =>
    Array.isArray(value)
      ? value.flatMap((item, index) =>
          schemaIssues(schema.items as JsonSchema, item, `${path}[${index}]`),
        )
      : [],
  required: (schema, value, path) =>
    plain(value)
      ? (schema.required as readonly string[]).flatMap((key) =>
          Object.hasOwn(value, key) ? [] : [`${path}.${key} is required`],
        )
      : [],
  properties: (schema, value, path) =>
    plain(value)
      ? Object.entries(schema.properties as Record<string, JsonSchema>)
          .filter(([key]) => Object.hasOwn(value, key))
          .flatMap(([key, property]) =>
            schemaIssues(property, value[key], `${path}.${key}`),
          )
      : [],
  additionalProperties: (schema, value, path) => {
    if (!plain(value)) return [];
    const declared = plain(schema.properties) ? schema.properties : {};
    const extra = Object.keys(value).filter(
      (key) => !Object.hasOwn(declared, key),
    );
    if (schema.additionalProperties === false)
      return extra.map((key) => `${path}.${key} is not allowed`);
    if (!plain(schema.additionalProperties)) return [];
    const additional = schema.additionalProperties;
    return extra.flatMap((key) =>
      schemaIssues(additional, value[key], `${path}.${key}`),
    );
  },
};

export function validateSchemaDefinition(schema: unknown, root = true): void {
  invariant(plain(schema), "Tool input schema must be a JSON Schema object");
  invariant(
    Object.keys(schema).every((key) => JSON_SCHEMA_KEYWORDS.has(key)),
    `Unsupported JSON Schema keyword; use ${[...JSON_SCHEMA_KEYWORDS].join(", ")}`,
  );
  const types = schemaTypes(schema);
  invariant(
    types.every((type) => JSON_SCHEMA_TYPES.has(type)),
    "Unsupported JSON Schema type",
  );
  invariant(
    !root || (types.length === 1 && types[0] === "object"),
    "Tool input schema must describe an object",
  );
  invariant(
    schema.required === undefined ||
      (Array.isArray(schema.required) &&
        schema.required.every((key) => typeof key === "string")),
    "JSON Schema required must list property names",
  );
  invariant(
    schema.enum === undefined || Array.isArray(schema.enum),
    "JSON Schema enum must be an array",
  );
  for (const keyword of [
    "minLength",
    "maxLength",
    "minimum",
    "maximum",
    "minItems",
    "maxItems",
  ])
    invariant(
      schema[keyword] === undefined ||
        (typeof schema[keyword] === "number" &&
          Number.isFinite(schema[keyword])),
      `JSON Schema ${keyword} must be a number`,
    );
  if (schema.properties !== undefined) {
    invariant(
      plain(schema.properties),
      "JSON Schema properties must be an object",
    );
    for (const property of Object.values(schema.properties))
      validateSchemaDefinition(property, false);
  }
  if (schema.items !== undefined) validateSchemaDefinition(schema.items, false);
  if (plain(schema.additionalProperties))
    validateSchemaDefinition(schema.additionalProperties, false);
  invariant(
    schema.additionalProperties === undefined ||
      typeof schema.additionalProperties === "boolean" ||
      plain(schema.additionalProperties),
    "JSON Schema additionalProperties must be a boolean or a schema",
  );
}

export function schemaIssues(
  schema: JsonSchema,
  value: unknown,
  path = "input",
): readonly string[] {
  const types = schemaTypes(schema);
  if (types.length && !types.some((type) => typeChecks[type]!(value)))
    return [`${path} must be ${types.join(" or ")}`];
  return Object.keys(schema)
    .filter((keyword) => Object.hasOwn(keywordChecks, keyword))
    .flatMap((keyword) => keywordChecks[keyword]!(schema, value, path));
}

function schemaTypes(schema: JsonSchema): readonly string[] {
  if (schema.type === undefined) return [];
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  invariant(
    types.every((type) => typeof type === "string"),
    "JSON Schema type must be a name or a list of names",
  );
  return types;
}

function bound(measure: (value: unknown) => number | undefined) {
  return (
      keyword: string,
      accept: (size: number, limit: number) => boolean,
      relation: string,
      unit: string,
    ): SchemaKeywordCheck =>
    (schema, value, path) => {
      const size = measure(value);
      const limit =
        typeof schema[keyword] === "number" ? schema[keyword] : undefined;
      if (size === undefined || limit === undefined || accept(size, limit))
        return [];
      return [`${path} must be ${relation} ${limit}${unit ? ` ${unit}` : ""}`];
    };
}
