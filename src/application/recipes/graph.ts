import { configurationError } from "../../domain/configuration-diagnostic.ts";
import { recipeFamilies } from "../../domain/recipes/schema.constants.ts";
import { mapRecipeSchema } from "../../domain/recipes/schema-walk.ts";
import type { RecipeDocument } from "../../domain/recipe.types.ts";
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
import {
  createJsonDecoder,
  validateJsonSchema,
} from "../../infrastructure/json-schema.ts";
import { recipeModulePath } from "../../infrastructure/recipes/extensions.ts";
import { extensionSchema } from "./schemas.constants.ts";
import type {
  RecipeComponentGraph,
  RecipeComponentNode,
} from "./components.types.ts";

const extensionDeclaration = createJsonDecoder<RecipeExtensionDeclaration>(
  extensionSchema,
  "extensions",
);

export function recipeComponentGraph(
  configuration: Readonly<Record<string, unknown>>,
  registry: RecipeRegistry,
  directory: string,
  document?: RecipeDocument,
): RecipeComponentGraph {
  const nodes = new Map<string, RecipeComponentNode>();
  const expected = new Map<string, string>();
  const declarations = new Map<string, unknown>();
  const extensions = new Map<string, RecipeExtensionDeclaration>();
  if (document?.version === 3) {
    if (configuration.version === 1)
      throw configurationError(
        "Recipe format 3 requires configuration version 2 or 3",
        ["version"],
        "unsupported-version",
        "Set version: 3 in the execution configuration.",
      );
    declarations.set("workflow", { ...document.workflow, type: "options" });
    expected.set("workflow", "workflowOptions");
  }
  for (const step of document?.tasks ?? []) {
    for (const [field, kind] of Object.entries({
      speculation: "speculation",
      queued: "queued",
      gate: "gate",
      interactive: "interactive",
      artifact: "artifactTask",
      options: "task",
      dispatch: "dispatch",
      loop: "loop",
      decision: "decisionTask",
      isolated: "isolated",
      call: "call",
    })) {
      if (!Object.hasOwn(step, field)) continue;
      const key = `tasks.${step.key}.${field}`;
      const source = new Map(Object.entries(step)).get(field);
      declarations.set(
        key,
        field !== "call" && recipeReference(source)
          ? source
          : {
              ...(field === "call"
                ? { perform: source }
                : recipeRecord(source, key)),
              type: "options",
            },
      );
      expected.set(key, `${kind}Options`);
    }
  }
  if (configuration.version !== 1) {
    declarations.set("integration", {
      ...recipeRecord(configuration.integration ?? {}, "integration"),
      type: "options",
    });
    expected.set("integration", "integrationOptions");
    const workspace = recipeRecord(configuration.workspace ?? {}, "workspace");
    for (const key of [
      "repository",
      "branch",
      "sandboxProvider",
      "observation",
    ])
      if (Object.hasOwn(workspace, key))
        throw configurationError(
          `workspace.${key} must be declared at the configuration root`,
          ["workspace", key],
          "misplaced-field",
          `Move ${key} out of workspace to the top level.`,
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
    const extension = extensionDeclaration.parse(source, `extensions.${name}`);
    recipeModulePath(extension.module, directory);
    if (extension.factory && !extension.schema)
      throw configurationError(
        `Extension factory ${name} requires a static schema`,
        ["extensions", name, "factory"],
        "invalid-extension",
        "Declare a JSON Schema for the factory options under schema.",
      );
    if (!extension.factory && (extension.options || extension.dispose))
      throw configurationError(
        `Borrowed extension ${name} cannot declare options or disposal`,
        ["extensions", name, extension.options ? "options" : "dispose"],
        "invalid-extension",
        "Declare factory to let Outpost create and dispose of the object.",
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
          if (typeof shape.contract === "string") {
            let node = nodes.get(target);
            while (node && !node.extension && !node.definition)
              node = nodes.get(recipeReference(node.options)!);
            if (node?.extension && node.extension.contract !== shape.contract)
              throw configurationError(
                `${path} requires callback contract ${shape.contract}`,
                path,
                "callback-contract",
                `Declare the extension with contract: ${shape.contract}.`,
              );
          }
          dependencies.push(target);
          return { $ref: target };
        },
        name,
        schema,
        (kind, value) => {
          if (!recipeObject(value)) return false;
          if (
            typeof value.$ref === "string" &&
            Object.keys(value).length === 1
          ) {
            const reference = value.$ref;
            const actual =
              expected.get(value.$ref) ?? nodes.get(value.$ref)?.kind;
            return (
              actual === kind ||
              (kind === "*" && actual !== undefined) ||
              (actual === undefined &&
                ["extensions", ...Object.keys(recipeFamilies)].some((family) =>
                  reference.startsWith(`${family}.`),
                ))
            );
          }
          return registry.components.some(
            (definition) =>
              definition.kind === kind &&
              definition.name === `${kind}.${value.type}`,
          );
        },
      ),
      name,
    );
    validateJsonSchema(schema, normalized, name);
    return normalized;
  }
  function component(source: unknown, kind: string, name: string): string {
    const reference = recipeReference(source);
    if (reference) {
      const actual = expected.get(reference);
      if (actual === undefined)
        throw configurationError(
          `Component ${name} requires ${kind}, got unknown reference ${reference}`,
          name,
          "unknown-reference",
          `Declare ${reference} in the execution configuration.`,
        );
      if (actual !== kind)
        throw configurationError(
          `Component ${name} requires ${kind}, got reference ${reference}`,
          name,
          "component-kind",
          `${reference} is a ${actual} component; reference a ${kind} component instead.`,
        );
      build(reference);
      return reference;
    }
    const record = recipeRecord(source, name);
    const type =
      record.type ??
      (kind === "observation" ? "client" : undefined) ??
      (kind.endsWith("Options") ? "options" : undefined);
    const componentType = recipeString(type, `${name}.type`);
    const definition = registry.components.find(
      (candidate) => candidate.name === `${kind}.${componentType}`,
    );
    if (!definition)
      throw configurationError(
        `Unknown ${kind} type ${componentType}`,
        `${name}.type`,
        "unknown-component",
        `Choose one of: ${registry.components
          .filter((candidate) => candidate.kind === kind)
          .map((candidate) => candidate.name.slice(kind.length + 1))
          .join(", ")}.`,
      );
    if (definition.kind !== kind)
      throw configurationError(
        `Component ${name} requires ${kind}`,
        name,
        "component-kind",
      );
    if (definition.experimental && configuration.experimental !== true)
      throw configurationError(
        `${definition.name} requires experimental: true`,
        name,
        "experimental-component",
        "Set experimental: true at the top level of the execution configuration.",
      );
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
      throw configurationError(
        `Recipe component dependency cycle: ${name}`,
        name,
        "component-cycle",
        "Remove one of the $ref links that lead back to this component.",
      );
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
