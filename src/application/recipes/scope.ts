import { recipeReference } from "../../domain/recipes/values.ts";
import { importRecipeExtension } from "../../infrastructure/recipes/extensions.ts";
import type { RecipeRegistry } from "../../domain/recipes/component.types.ts";
import type {
  RecipeComponentGraph,
  RecipeComponentScope,
} from "./components.types.ts";

export function createRecipeComponentScope(
  graph: RecipeComponentGraph,
  registry: RecipeRegistry,
  directory: string,
  signal: AbortSignal,
): RecipeComponentScope {
  const modules = new Map<string, Record<string, unknown>>();
  const values = new Map<string, Promise<unknown>>();
  const owned: (() => void | Promise<void>)[] = [];
  let closing: Promise<void> | undefined;
  let preparation: Promise<void> | undefined;
  const scope: RecipeComponentScope = {
    prepare() {
      preparation ??= (async () => {
        for (const node of graph.nodes.values()) {
          if (node.extension)
            modules.set(
              node.name,
              await importRecipeExtension(node.extension, directory),
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
      const pending = (async () => {
        await scope.prepare();
        const context = {
          directory,
          signal,
          resolve: scope.resolve,
          environment(variable: string) {
            if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(variable))
              throw new Error("Invalid environment variable reference");
            const value = process.env[variable];
            if (value === undefined)
              throw new Error(
                `Missing declared environment variable: ${variable}`,
              );
            return value;
          },
        };
        if (node.definition) {
          const value = await node.definition.create(node.options, context);
          const dispose = node.definition.dispose;
          if (dispose) owned.push(() => dispose(value));
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
              ? await exported(node.options, context)
              : exported;
          const dispose = node.extension.dispose
            ? module[node.extension.dispose]
            : undefined;
          if (typeof dispose === "function")
            owned.push(async () => {
              await dispose(value);
            });
          const candidates = registry.components.filter(
            (component) => component.kind === kind,
          );
          const valid =
            kind === "callback"
              ? typeof value === "function"
              : candidates.some((component) => component.accepts(value));
          if (!valid)
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
        for (const dispose of owned.reverse()) {
          try {
            await dispose();
          } catch (error) {
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
