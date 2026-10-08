import { resolve } from "node:path";
import {
  recipeObject,
  recipeRecord,
  recipeReference,
  recipeString,
} from "../../domain/recipes/values.ts";
import { mapRecipeSchema } from "../../domain/recipes/schema-walk.ts";
import { validateRecipeSchema } from "../../infrastructure/recipes/schema.ts";
import { nativeRecipeSchemas } from "./native-schemas.constants.ts";
import { nativeRecipeFactories } from "./native-factories.ts";
import type {
  RecipeComponentDefinition,
  RecipeComponentContext,
} from "../../domain/recipes/component.types.ts";

export function recipeMethods(
  value: unknown,
  methods: readonly string[],
): boolean {
  return (
    recipeObject(value) &&
    methods.every((key) => typeof value[key] === "function")
  );
}

export const nativeRecipeGuards: Readonly<
  Record<string, (value: unknown) => boolean>
> = {
  sandboxProvider: (value) =>
    recipeMethods(value, ["acquire"]) &&
    recipeObject(value) &&
    ["mounted", "remote", "host"].includes(String(value.placement)),
  profile: (value) => recipeObject(value) && value.kind === "agent-profile",
  secretSource: (value) =>
    recipeMethods(value, ["resolve"]) &&
    recipeObject(value) &&
    typeof value.name === "string",
  workspace: (value) => recipeMethods(value, ["sandbox", "integrate", "close"]),
  sandbox: (value) => recipeMethods(value, ["command", "dispatch", "close"]),
  object: recipeObject,
  variables: (value) =>
    recipeObject(value) &&
    Object.values(value).every((item) => typeof item === "string"),
  callback: (value) => typeof value === "function",
  harness: (value) =>
    recipeObject(value) &&
    ((value.kind === "cli" && typeof value.bind === "function") ||
      (value.kind === "custom" &&
        recipeMethods(value.modelProvider, ["request"]))),
  agent: (value) =>
    recipeObject(value) &&
    (value.kind === "cli"
      ? recipeMethods(value, ["request", "events"])
      : value.kind === "custom" && nativeRecipeGuards.harness!(value.harness)),
  transport: (value) =>
    recipeMethods(value, ["read", "write", "remove", "list"]),
  conversations: (value) => recipeMethods(value, ["capture", "restore"]),
};

export async function resolveRecipeOptions(
  schema: Readonly<Record<string, unknown>>,
  value: unknown,
  context: RecipeComponentContext,
): Promise<Record<string, unknown>> {
  validateRecipeSchema(schema, value, "component options");
  const pending: Promise<unknown>[] = [];
  const slots = new Map<unknown, number>();
  const mapped = mapRecipeSchema(schema, value, (shape, item) => {
    if (typeof shape.component === "string") {
      const reference = recipeReference(item);
      if (!reference)
        throw new Error("Expected a normalized component reference");
      const slot = {};
      slots.set(slot, pending.length);
      pending.push(context.resolve(reference, shape.component));
      return slot;
    }
    if (shape.secret)
      return context.environment(
        recipeString(recipeRecord(item, "secret").env, "secret.env"),
      );
    if (shape.hostPath)
      return resolve(context.directory, recipeString(item, "host path"));
    if (shape.regexp) {
      const pattern = recipeRecord(item, "pattern");
      return new RegExp(
        recipeString(pattern.pattern, "pattern"),
        typeof pattern.flags === "string" ? pattern.flags : "",
      );
    }
    return item;
  });
  const resolved = await Promise.all(pending);
  function replace(item: unknown): unknown {
    const slot = slots.get(item);
    if (slot !== undefined) return resolved[slot];
    if (Array.isArray(item)) return item.map(replace);
    if (recipeObject(item) && !(item instanceof RegExp))
      return Object.fromEntries(
        Object.entries(item).map(([key, value]) => [key, replace(value)]),
      );
    return item;
  }
  return recipeRecord(replace(mapped), "component options");
}

export const nativeRecipeComponents: readonly RecipeComponentDefinition[] =
  Object.entries(nativeRecipeFactories).map(([name, load]) => {
    const kind = name.split(".")[0]!;
    const schema = nativeRecipeSchemas[name]!;
    const accepts = nativeRecipeGuards[kind];
    if (!accepts) throw new Error(`Missing native component guard: ${kind}`);
    return {
      name,
      kind,
      schema,
      accepts,
      ...(name === "sandboxProvider.firecracker" ? { experimental: true } : {}),
      async create(options, context) {
        const value = await resolveRecipeOptions(schema, options, context);
        const factory = await load();
        if (typeof factory !== "function")
          throw new Error(`Invalid native component factory: ${name}`);
        return factory(value);
      },
    };
  });

export const sandboxOptionsComponent: RecipeComponentDefinition = {
  name: "sandboxOptions.options",
  kind: "sandboxOptions",
  schema: nativeRecipeSchemas["sandbox.options"]!,
  accepts: recipeObject,
  create(options, context) {
    return resolveRecipeOptions(this.schema, options, context);
  },
};
