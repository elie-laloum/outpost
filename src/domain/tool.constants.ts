export const JSON_SCHEMA_KEYWORDS: ReadonlySet<string> = new Set([
  "type",
  "title",
  "description",
  "properties",
  "required",
  "additionalProperties",
  "items",
  "enum",
  "const",
  "minLength",
  "maxLength",
  "minimum",
  "maximum",
  "minItems",
  "maxItems",
]);

export const JSON_SCHEMA_TYPES: ReadonlySet<string> = new Set([
  "object",
  "array",
  "string",
  "number",
  "integer",
  "boolean",
  "null",
]);

export const STANDARD_JSON_SCHEMA_TARGET = "draft-2020-12";

export const HARNESS_TOOL_FIELDS: ReadonlySet<string> = new Set([
  "name",
  "description",
  "input",
  "readOnly",
  "resources",
  "execute",
]);
