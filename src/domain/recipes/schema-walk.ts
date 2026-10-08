import { recipeObject } from "./values.ts";
import type {
  RecipeSchemaVisitor,
  RecipeComponentMatch,
} from "./schema-walk.types.ts";

function dereference(
  schema: unknown,
  root: unknown,
  seen = new Set<string>(),
): unknown {
  if (!recipeObject(schema)) return schema;
  if (typeof schema.$ref !== "string" || !schema.$ref.startsWith("#/"))
    return schema;
  if (seen.has(schema.$ref))
    throw new Error(
      "Recursive recipe schema reference without a value boundary",
    );
  seen.add(schema.$ref);
  let target = root;
  for (const part of schema.$ref.slice(2).split("/")) {
    const key = part.replace(/~1/g, "/").replace(/~0/g, "~");
    if (!recipeObject(target) || !Object.hasOwn(target, key))
      throw new Error(`Unknown recipe schema reference: ${schema.$ref}`);
    target = target[key];
  }
  const resolved = dereference(target, root, seen);
  const { $ref: _reference, ...siblings } = schema;
  return recipeObject(resolved) ? { ...resolved, ...siblings } : resolved;
}

function intersection(
  schema: Readonly<Record<string, unknown>>,
  root: unknown,
): Readonly<Record<string, unknown>> {
  if (!Array.isArray(schema.allOf)) return schema;
  const { allOf, ...base } = schema;
  let result = base;
  for (const item of allOf) {
    const resolved = dereference(item, root);
    if (!recipeObject(resolved)) continue;
    const part = intersection(resolved, root);
    if (
      result.component &&
      part.component &&
      result.component !== part.component
    )
      throw new Error("Conflicting recipe component categories in allOf");
    const left = recipeObject(result.properties) ? result.properties : {};
    const right = recipeObject(part.properties) ? part.properties : {};
    result = {
      ...result,
      ...part,
      properties: Object.fromEntries(
        [...new Set([...Object.keys(left), ...Object.keys(right)])].map(
          (key) => [
            key,
            left[key] && right[key]
              ? { allOf: [left[key], right[key]] }
              : (left[key] ?? right[key]),
          ],
        ),
      ),
      required: [
        ...new Set([
          ...(Array.isArray(result.required) ? result.required : []),
          ...(Array.isArray(part.required) ? part.required : []),
        ]),
      ],
    };
  }
  return result;
}

function matches(
  source: unknown,
  value: unknown,
  root: unknown,
  componentMatch?: RecipeComponentMatch,
): boolean {
  const resolved = dereference(source, root);
  const schema = recipeObject(resolved)
    ? intersection(resolved, root)
    : resolved;
  if (!recipeObject(schema)) return schema !== false;
  if (typeof schema.component === "string" && componentMatch)
    return componentMatch(schema.component, value);
  if (schema.component)
    return (
      recipeObject(value) &&
      (Object.hasOwn(value, "$ref") ||
        Object.hasOwn(value, "type") ||
        (schema.component === "observation" && Object.hasOwn(value, "sinks")))
    );
  if (schema.const !== undefined) return value === schema.const;
  if (Array.isArray(schema.enum)) return schema.enum.includes(value);
  const branches = schema.anyOf ?? schema.oneOf;
  if (Array.isArray(branches))
    return branches.some((item) => matches(item, value, root, componentMatch));
  if (schema.type === "array") return Array.isArray(value);
  if (schema.type === "null") return value === null;
  if (schema.type === "object") {
    if (!recipeObject(value)) return false;
    if (
      Array.isArray(schema.required) &&
      schema.required.some(
        (key) => typeof key === "string" && !Object.hasOwn(value, key),
      )
    )
      return false;
    const properties = recipeObject(schema.properties) ? schema.properties : {};
    return Object.entries(value).every(([key, item]) =>
      matches(
        properties[key] ?? schema.additionalProperties,
        item,
        root,
        componentMatch,
      ),
    );
  }
  if (schema.type === "integer") return Number.isInteger(value);
  if (typeof schema.type === "string") return typeof value === schema.type;
  return true;
}

export function recipeSchemaBranch(
  source: Readonly<Record<string, unknown>>,
  value: unknown,
  root: unknown = source,
  componentMatch?: RecipeComponentMatch,
): Readonly<Record<string, unknown>> {
  const found = dereference(source, root);
  const schema = intersection(recipeObject(found) ? found : source, root);
  const branches = schema.anyOf ?? schema.oneOf;
  if (!Array.isArray(branches)) return schema;
  const component = branches.find((candidate) => {
    const shape = dereference(candidate, root);
    return (
      recipeObject(shape) &&
      typeof shape.component === "string" &&
      matches(shape, value, root, componentMatch)
    );
  });
  const incompatible = componentMatch?.("*", value)
    ? branches.find((candidate) => {
        const shape = dereference(candidate, root);
        return recipeObject(shape) && typeof shape.component === "string";
      })
    : undefined;
  const branch: unknown =
    component ??
    incompatible ??
    branches.find((candidate) =>
      matches(candidate, value, root, componentMatch),
    ) ??
    (recipeObject(value) && typeof value.$ref === "string"
      ? branches.find((candidate) => {
          const shape = dereference(candidate, root);
          return recipeObject(shape) && typeof shape.component === "string";
        })
      : undefined);
  return recipeObject(branch)
    ? recipeSchemaBranch(branch, value, root, componentMatch)
    : schema;
}

export function mapRecipeSchema(
  schema: unknown,
  value: unknown,
  visitor: RecipeSchemaVisitor,
  path = "",
  root: unknown = schema,
  componentMatch?: RecipeComponentMatch,
): unknown {
  if (!recipeObject(schema)) return value;
  const selected = recipeSchemaBranch(schema, value, root, componentMatch);
  if (
    selected.component ||
    selected.secret ||
    selected.hostPath ||
    selected.regexp
  )
    return visitor(selected, value, path);
  if (Array.isArray(value))
    return value.map((item, index) =>
      mapRecipeSchema(
        Array.isArray(selected.prefixItems)
          ? (selected.prefixItems[index] ?? selected.items)
          : selected.items,
        item,
        visitor,
        `${path}.${index}`,
        root,
        componentMatch,
      ),
    );
  if (recipeObject(value)) {
    const properties = recipeObject(selected.properties)
      ? selected.properties
      : {};
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        mapRecipeSchema(
          properties[key] ?? selected.additionalProperties,
          item,
          visitor,
          `${path}.${key}`,
          root,
          componentMatch,
        ),
      ]),
    );
  }
  return value;
}
