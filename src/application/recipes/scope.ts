import { mapRecipeSchema } from "../../domain/recipes/schema-walk.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import { recipeReference } from "../../domain/recipes/values.ts";
import { importRecipeExtension } from "../../infrastructure/recipes/extensions.ts";
import { nativeRecipeGuards, resolveRecipeOptions } from "./native.ts";
import { redactValue } from "../../domain/redaction.ts";
import type { RecipeRegistry } from "../../domain/recipes/component.types.ts";
import type {
  RecipeComponentGraph,
  RecipeComponentScope,
  RecipeOwnedComponent,
} from "./components.types.ts";

export function createRecipeComponentScope(
  graph: RecipeComponentGraph,
  registry: RecipeRegistry,
  directory: string,
  signal: AbortSignal,
): RecipeComponentScope {
  const modules = new Map<string, Record<string, unknown>>();
  const values = new Map<string, Promise<unknown>>();
  const owned: RecipeOwnedComponent[] = [];
  const observerErrors: unknown[] = [];
  const secrets = new Set<string>();
  const redactions: RegExp[] = [];
  let closing: Promise<void> | undefined;
  let preparation: Promise<void> | undefined;
  function environment(variable: string): string {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(variable))
      throw new Error("Invalid environment variable reference");
    const value = process.env[variable];
    if (value === undefined)
      throw new Error(`Missing declared environment variable: ${variable}`);
    scope.protect([value]);
    return value;
  }
  function preflight(name: string, visited = new Set<string>()): void {
    if (visited.has(name)) return;
    visited.add(name);
    const node = graph.nodes.get(name);
    if (!node) return;
    mapRecipeSchema(
      node.definition?.schema ?? node.extension?.schema ?? {},
      node.options,
      (shape, value) => {
        if (
          shape.secret &&
          recipeObject(value) &&
          typeof value.env === "string"
        )
          environment(value.env);
        return value;
      },
    );
    for (const dependency of node.dependencies) preflight(dependency, visited);
  }
  function accepts(kind: string, value: unknown): boolean {
    return (
      nativeRecipeGuards[kind]?.(value) ??
      registry.components.some(
        (component) => component.kind === kind && component.accepts(value),
      )
    );
  }
  const scope: RecipeComponentScope = {
    observerErrors,
    redactions,
    recordObserverErrors(errors) {
      observerErrors.push(...errors);
    },
    protect(items) {
      for (const value of items) {
        if (!value || secrets.has(value)) continue;
        secrets.add(value);
        redactions.push(
          new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        );
      }
    },
    redact: <T>(value: T): T => redactValue(value, redactions),
    prepare() {
      preparation ??= (async () => {
        for (const node of graph.nodes.values()) {
          if (!node.extension) continue;
          const module = await importRecipeExtension(node.extension, directory);
          modules.set(node.name, module);
          if (node.extension.factory) continue;
          const value = module[node.extension.export];
          const dispose = node.extension.dispose
            ? module[node.extension.dispose]
            : undefined;
          if (typeof dispose === "function")
            owned.push({
              kind: node.kind,
              close: async () => {
                await dispose(value);
              },
            });
          if (!accepts(node.kind, value))
            throw new Error(
              `Extension ${node.name} returned an invalid ${node.kind}`,
            );
        }
      })();
      return preparation;
    },
    async resolve(name, kind) {
      if (closing) throw new Error("Recipe component scope is closed");
      signal.throwIfAborted();
      const node = graph.nodes.get(name);
      if (!node || node.kind !== kind)
        throw new Error(`Unknown ${kind} reference: ${name}`);
      const existing = values.get(name);
      if (existing) return existing;
      preflight(name);
      const pending = (async () => {
        await scope.prepare();
        const context = {
          directory,
          signal,
          resolve: scope.resolve,
          kindOf(name: string) {
            const node = graph.nodes.get(name);
            if (!node) throw new Error(`Unknown recipe component: ${name}`);
            return node.kind;
          },
          environment,
        };
        if (node.definition) {
          const value = await node.definition.create(node.options, context);
          if (
            kind === "variables" &&
            nativeRecipeGuards.variables!(value) &&
            typeof value === "object" &&
            value !== null
          )
            scope.protect(Object.values(value));
          const dispose = node.definition.dispose;
          if (dispose) owned.push({ kind, close: () => dispose(value) });
          if (!node.definition.accepts(value))
            throw new Error(
              `Invalid ${kind} created by ${node.definition.name}`,
            );
          return value;
        }
        if (node.extension) {
          const module = modules.get(name)!;
          const exported = module[node.extension.export];
          const value: unknown =
            node.extension.factory && typeof exported === "function"
              ? await exported(
                  await resolveRecipeOptions(
                    node.extension.schema ?? {},
                    node.options,
                    context,
                  ),
                  context,
                )
              : exported;
          if (
            kind === "variables" &&
            nativeRecipeGuards.variables!(value) &&
            typeof value === "object" &&
            value !== null
          )
            scope.protect(Object.values(value));
          const dispose = node.extension.dispose
            ? module[node.extension.dispose]
            : undefined;
          if (node.extension.factory && typeof dispose === "function")
            owned.push({
              kind,
              close: async () => {
                await dispose(value);
              },
            });
          if (!accepts(kind, value))
            throw new Error(`Extension ${name} returned an invalid ${kind}`);
          return value;
        }
        return scope.resolve(recipeReference(node.options)!, kind);
      })();
      values.set(name, pending);
      return pending;
    },
    close() {
      closing ??= (async () => {
        await Promise.allSettled(values.values());
        const failures: unknown[] = [];
        for (const component of owned.reverse()) {
          try {
            await component.close();
          } catch (error) {
            if (["observation", "sink"].includes(component.kind)) {
              observerErrors.push(error);
              continue;
            }
            failures.push(error);
          }
        }
        if (failures.length)
          throw new AggregateError(failures, "Recipe component cleanup failed");
      })();
      return closing;
    },
  };
  return scope;
}
