import { recipeObject } from "./values.ts";
import type {
  RecipeSchemaVisitor,
  RecipeComponentMatch,
} from "./schema-walk.types.ts";

function dereference(schema: unknown, root: unknown): unknown {
  if (
    recipeObject(schema) &&
    typeof schema.$ref === "string" &&
    schema.$ref.startsWith("#/$defs/") &&
    recipeObject(root) &&
    recipeObject(root.$defs)
  )
    return root.$defs[schema.$ref.slice(8)];
  return schema;
}

function matches(
  source: unknown,
  value: unknown,
  root: unknown,
  componentMatch?: RecipeComponentMatch,
): boolean {
  const schema = dereference(source, root);
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
  if (Array.isArray(schema.anyOf))
    return schema.anyOf.some((item) =>
      matches(item, value, root, componentMatch),
    );
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
  const schema = recipeObject(found) ? found : source;
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
  const branch: unknown =
    component ??
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
