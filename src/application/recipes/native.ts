import { resolve } from "node:path";
import {
  recipeObject,
  recipeRecord,
  recipeReference,
  recipeString,
} from "../../domain/recipes/values.ts";
import { mapRecipeSchema } from "../../domain/recipes/schema-walk.ts";
import { validateRecipeSchema } from "../../infrastructure/recipes/schema.ts";
import {
  nativeRecipeSchemas,
  nativeRecipeFactoryParameters,
} from "./native-schemas.constants.ts";
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

function isAgent(value: unknown): boolean {
  if (!recipeObject(value)) return false;
  if (value.kind === "fallback")
    return (
      Array.isArray(value.agents) &&
      value.agents.every(isAgent) &&
      Array.isArray(value.on)
    );
  if (value.kind === "replay")
    return recipeMethods(value, ["nextTurn", "pendingSteering"]);
  if (value.kind === "cli") return recipeMethods(value, ["request", "events"]);
  return value.kind === "custom" && nativeRecipeGuards.harness!(value.harness);
}

function taggedComponent(
  value: unknown,
  kind: string,
  methods: readonly string[] = [],
): boolean {
  return (
    recipeObject(value) && value.kind === kind && recipeMethods(value, methods)
  );
}

export const nativeRecipeGuards: Readonly<
  Record<string, (value: unknown) => boolean>
> = {
  resolver: (value) => typeof value === "function",
  queue: (value) =>
    recipeMethods(value, [
      "enqueue",
      "get",
      "claim",
      "renew",
      "complete",
      "cancel",
    ]),
  job: (value) => typeof value === "function",
  cron: (value) => recipeMethods(value, ["next", "previous"]),
  schedule: (value) =>
    recipeObject(value) &&
    typeof value.name === "string" &&
    typeof value.handler === "string" &&
    recipeMethods(value.cron, ["next", "previous"]),
  triggerSource: (value) => recipeMethods(value, ["verify"]),
  triggerMapper: (value) => typeof value === "function",
  service: (value) => recipeMethods(value, ["start"]),
  checkpointStore: (value) => recipeMethods(value, ["acquire"]),
  taskCacheStore: (value) => recipeMethods(value, ["read", "write"]),
  artifactStore: (value) => recipeMethods(value, ["put", "get"]),
  artifact: (value) => recipeMethods(value, ["encode", "decode"]),
  verifier: (value) => typeof value === "function",
  sink: (value) => recipeMethods(value, ["observe"]),
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
  agent: isAgent,
  modelProvider: (value) => recipeMethods(value, ["request"]),
  decisionProvider: (value) => recipeMethods(value, ["request"]),
  tool: (value) =>
    taggedComponent(value, "tool", ["execute", "resources", "validate"]),
  toolset: (value) =>
    taggedComponent(value, "toolset") &&
    recipeObject(value) &&
    Array.isArray(value.tools),
  permissions: (value) => taggedComponent(value, "permissions", ["evaluate"]),
  hook: (value) => taggedComponent(value, "hook", ["run"]),
  skill: (value) => taggedComponent(value, "skill"),
  context: (value) => taggedComponent(value, "context", ["compact"]),
  instructions: (value) => taggedComponent(value, "instructions", ["resolve"]),
  response: (value) => recipeMethods(value, ["read"]),
  decision: (value) => taggedComponent(value, "decision"),
  routing: (value) => taggedComponent(value, "model-routing"),
  validator: (value) =>
    recipeObject(value) && recipeMethods(value["~standard"], ["validate"]),
  steering: (value) => recipeMethods(value, ["send"]),
  telemetry: recipeObject,
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
  const mapped = mapRecipeSchema(
    schema,
    value,
    (shape, item) => {
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
    },
    "",
    schema,
    (kind, value) =>
      recipeObject(value) &&
      typeof value.$ref === "string" &&
      Object.keys(value).length === 1 &&
      context.kindOf(value.$ref) === kind,
  );
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
      ...([
        "sink.run",
        "sink.custom",
        "sink.opentelemetry",
        "queue.sqlite",
        "queue.bullmq",
      ].includes(name)
        ? {
            async dispose(value: unknown) {
              if (recipeObject(value) && typeof value.close === "function")
                await value.close();
            },
          }
        : {}),
      ...(name === "sandboxProvider.firecracker" ? { experimental: true } : {}),
      async create(options, context) {
        const value = await resolveRecipeOptions(schema, options, context);
        const factory = await load();
        if (typeof factory !== "function")
          throw new Error(`Invalid native component factory: ${name}`);
        const parameters = nativeRecipeFactoryParameters[name] ?? [];
        return factory(
          Object.fromEntries(
            Object.entries(value).filter(([key]) => !parameters.includes(key)),
          ),
          ...parameters.map((key) => value[key]),
        );
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

export const dispatchOptionsComponent: RecipeComponentDefinition = {
  name: "dispatchOptions.options",
  kind: "dispatchOptions",
  schema: nativeRecipeSchemas["dispatch.options"]!,
  accepts: recipeObject,
  create(options, context) {
    return resolveRecipeOptions(this.schema, options, context);
  },
};
