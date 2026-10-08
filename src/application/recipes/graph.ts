import { recipeFamilies } from "../../domain/recipes/schema.constants.ts";
import { mapRecipeSchema } from "../../domain/recipes/schema-walk.ts";
import {
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
  const extensions = new Map<string, RecipeExtensionDeclaration>();
  if (configuration.version === 2) {
    const workspace = recipeRecord(configuration.workspace ?? {}, "workspace");
    for (const key of [
      "repository",
      "branch",
      "sandboxProvider",
      "observation",
    ])
      if (Object.hasOwn(workspace, key))
        throw new Error(
          `workspace.${key} must be declared at the configuration root`,
        );
    const provider = recipeRecord(configuration.sandbox, "sandbox");
    const { provider: shorthand, ...options } = provider;
    declarations.set(
      "sandbox",
      shorthand ? { ...options, type: shorthand } : provider,
    );
    expected.set("sandbox", "sandboxProvider");
    declarations.set("workspace", { ...workspace, type: "options" });
    expected.set("workspace", "sandboxOptions");
  }
  for (const [family, kind] of Object.entries(recipeFamilies)) {
    if (configuration[family] === undefined) continue;
    if (family === "agents" && configuration.version === 1) continue;
    for (const [name, value] of Object.entries(
      recipeRecord(configuration[family], family),
    )) {
      const key = `${family}.${name}`;
      if (family === "agents" && !recipeReference(value)) {
        const agent = recipeRecord(value, key);
        if (typeof agent.harness === "string") {
          const { harness, model, type, ...settings } = agent;
          declarations.set(key, {
            type: type ?? "composed",
            harness: { type: harness, ...settings },
            ...(model === undefined ? {} : { model }),
          });
          expected.set(key, kind);
          continue;
        }
        declarations.set(key, { type: "composed", ...agent });
        expected.set(key, kind);
        continue;
      }
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
    const key = `extensions.${name}`;
    extensions.set(key, extension);
    expected.set(key, extension.kind);
  }
  const building = new Set<string>();
  function normalize(
    schema: Readonly<Record<string, unknown>>,
    options: unknown,
    name: string,
    dependencies: string[],
  ): Record<string, unknown> {
    const normalized = recipeRecord(
      mapRecipeSchema(
        schema,
        options,
        (shape, value, path) => {
          if (typeof shape.component !== "string") return value;
          const target = component(value, shape.component, path);
          dependencies.push(target);
          return { $ref: target };
        },
        name,
      ),
      name,
    );
    validateRecipeSchema(schema, normalized, name);
    return normalized;
  }
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
    const normalized = normalize(
      definition.schema,
      options,
      name,
      dependencies,
    );
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
    const extension = extensions.get(name);
    if (extension) {
      const dependencies: string[] = [];
      const options = extension.schema
        ? normalize(
            extension.schema,
            extension.options ?? {},
            name,
            dependencies,
          )
        : {};
      nodes.set(name, { name, kind, extension, options, dependencies });
      building.delete(name);
      return;
    }
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
  for (const name of extensions.keys()) build(name);
  const observation =
    configuration.observation === undefined
      ? undefined
      : component(configuration.observation, "observation", "observation");
  return { nodes, ...(observation ? { observation } : {}) };
}
