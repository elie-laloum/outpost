import { recipeFamilies } from "../../domain/recipes/schema.constants.ts";
import {
  recipeObject,
  recipeRecord,
  recipeReference,
  recipeString,
} from "../../domain/recipes/values.ts";
import type {
  RecipeExtensionDeclaration,
  RecipeRegistry,
} from "../../domain/recipes/component.types.ts";
import { validateRecipeSchema } from "../../infrastructure/recipes/schema.ts";
import { recipeModulePath } from "../../infrastructure/recipes/extensions.ts";
import { extensionSchema } from "./schemas.constants.ts";
import type {
  RecipeComponentGraph,
  RecipeComponentNode,
} from "./components.types.ts";

export function recipeComponentGraph(
  configuration: Readonly<Record<string, unknown>>,
  registry: RecipeRegistry,
  directory: string,
): RecipeComponentGraph {
  const nodes = new Map<string, RecipeComponentNode>();
  const expected = new Map<string, string>();
  const declarations = new Map<string, unknown>();
  for (const [family, kind] of Object.entries(recipeFamilies)) {
    if (configuration[family] === undefined) continue;
    // Legacy agent declarations are normalized by the configuration reader.
    if (family === "agents") continue;
    for (const [name, value] of Object.entries(
      recipeRecord(configuration[family], family),
    )) {
      const key = `${family}.${name}`;
      declarations.set(key, value);
      expected.set(key, kind);
    }
  }
  for (const [name, source] of Object.entries(
    recipeRecord(configuration.extensions ?? {}, "extensions"),
  )) {
    const extension = validateRecipeSchema<RecipeExtensionDeclaration>(
      extensionSchema,
      source,
      `extensions.${name}`,
    );
    recipeModulePath(extension.module, directory);
    if (extension.factory && !extension.schema)
      throw new Error(`Extension factory ${name} requires a static schema`);
    if (!extension.factory && (extension.options || extension.dispose))
      throw new Error(
        `Borrowed extension ${name} cannot declare options or disposal`,
      );
    if (extension.schema)
      validateRecipeSchema(
        extension.schema,
        extension.options ?? {},
        `extensions.${name}.options`,
      );
    const key = `extensions.${name}`;
    nodes.set(key, {
      name: key,
      kind: extension.kind,
      extension,
      options: extension.options ?? {},
      dependencies: [],
    });
    expected.set(key, extension.kind);
  }
  const building = new Set<string>();
  function component(source: unknown, kind: string, name: string): string {
    const reference = recipeReference(source);
    if (reference) {
      if (expected.get(reference) !== kind)
        throw new Error(
          `Component ${name} requires ${kind}, got reference ${reference}`,
        );
      build(reference);
      return reference;
    }
    const record = recipeRecord(source, name);
    const type = record.type ?? (kind === "observation" ? "hub" : undefined);
    const definition = registry.get(
      `${kind}.${recipeString(type, `${name}.type`)}`,
    );
    if (definition.kind !== kind)
      throw new Error(`Component ${name} requires ${kind}`);
    if (definition.experimental && configuration.experimental !== true)
      throw new Error(`${definition.name} requires experimental: true`);
    const dependencies: string[] = [];
    const options = Object.fromEntries(
      Object.entries(record).filter(([key]) => key !== "type"),
    );
    function visit(schema: unknown, value: unknown, path: string): unknown {
      if (!recipeObject(schema)) return value;
      if (typeof schema.component === "string") {
        const target = component(value, schema.component, path);
        dependencies.push(target);
        return { $ref: target };
      }
      if (Array.isArray(value) && schema.items)
        return value.map((item, index) =>
          visit(schema.items, item, `${path}.${index}`),
        );
      if (recipeObject(value) && recipeObject(schema.properties)) {
        const properties = schema.properties;
        return Object.fromEntries(
          Object.entries(value).map(([key, item]) => [
            key,
            visit(properties[key], item, `${path}.${key}`),
          ]),
        );
      }
      return value;
    }
    const normalized = recipeRecord(
      visit(definition.schema, options, name),
      name,
    );
    validateRecipeSchema(definition.schema, normalized, name);
    nodes.set(name, {
      name,
      kind,
      definition,
      options: normalized,
      dependencies,
    });
    return name;
  }
  function build(name: string): void {
    if (building.has(name))
      throw new Error(`Recipe component dependency cycle: ${name}`);
    if (nodes.has(name)) return;
    building.add(name);
    const kind = expected.get(name);
    if (!kind) throw new Error(`Unknown recipe component reference: ${name}`);
    const target = component(declarations.get(name), kind, name);
    if (target !== name) {
      nodes.set(name, {
        name,
        kind,
        options: { $ref: target },
        dependencies: [target],
      });
    }
    building.delete(name);
  }
  for (const name of declarations.keys()) build(name);
  const observation =
    configuration.observation === undefined
      ? undefined
      : component(configuration.observation, "observation", "observation");
  return { nodes, ...(observation ? { observation } : {}) };
}
