import { createObservation } from "../../infrastructure/observation-client.ts";
import { nativeRecipeGuards } from "./native.ts";
import type { Transport } from "../../domain/transport.types.ts";
import { nativeRecipeSchemas } from "./native-schemas.constants.ts";
import { createObservationHub } from "../../domain/observation.ts";
import { recipeObject, recipeSchema } from "../../domain/recipes/values.ts";
import { validateRecipeSchema } from "../../infrastructure/recipes/schema.ts";
import type { RecipeComponentDefinition } from "../../domain/recipes/component.types.ts";
import type { ObservationSink } from "../../domain/observation.types.ts";
import type {
  ComponentGuards,
  ConsoleSinkOptions,
  ObservationComponentOptions,
} from "./components.types.ts";

export const observationGuards: ComponentGuards = {
  observation: (
    value,
  ): value is import("../../domain/observation.types.ts").ObservationHub =>
    recipeObject(value) &&
    ["emit", "child", "redact", "flush", "close"].every(
      (key) => typeof value[key] === "function",
    ),
  sink: (value): value is ObservationSink => nativeRecipeGuards.sink!(value),
};

export const observationComponents: readonly RecipeComponentDefinition[] = [
  {
    name: "sink.console",
    kind: "sink",
    schema: recipeSchema({
      format: { enum: ["text", "json"] },
      stream: { enum: ["stdout", "stderr"] },
    }),
    create(value) {
      const options = validateRecipeSchema<ConsoleSinkOptions>(
        this.schema,
        value,
        "console",
      );
      return {
        observe(
          event: import("../../domain/observation.types.ts").Observation,
        ) {
          const line =
            options.format === "json"
              ? JSON.stringify(event)
              : `[${event.source}${event.scope.taskKey ? `:${event.scope.taskKey}` : ""}] ${JSON.stringify(event.event)}`;
          process[options.stream ?? "stderr"].write(`${line}\n`);
        },
      };
    },
    accepts: observationGuards.sink,
  },
  ...["observation.client", "observation.hub"].map(
    (name): RecipeComponentDefinition => ({
      name,
      kind: "observation",
      schema: {
        ...nativeRecipeSchemas[name]!,
        properties: {
          ...(recipeObject(nativeRecipeSchemas[name]!.properties)
            ? nativeRecipeSchemas[name]!.properties
            : {}),
          redact: {
            type: "array",
            items: {
              anyOf: [
                { type: "string" },
                {
                  type: "object",
                  required: ["pattern"],
                  additionalProperties: false,
                  properties: {
                    pattern: { type: "string" },
                    flags: { type: "string" },
                  },
                },
              ],
            },
          },
        },
      },
      async create(value, context) {
        const options = validateRecipeSchema<ObservationComponentOptions>(
          this.schema,
          value,
          "observation",
        );
        const sinks: ObservationSink[] = [];
        for (const reference of options.sinks ?? []) {
          const sink = await context.resolve(reference.$ref, "sink");
          if (!observationGuards.sink(sink))
            throw new Error(`Invalid observation sink: ${reference.$ref}`);
          sinks.push(sink);
        }
        const {
          redact,
          sinks: references,
          transporter: reference,
          ...limits
        } = options;
        let transporter: Transport | undefined;
        if (reference) {
          const value = await context.resolve(reference.$ref, "transport");
          if (!isTransport(value))
            throw new Error("Invalid observation transport");
          transporter = value;
        }
        const create =
          name === "observation.client"
            ? createObservation
            : createObservationHub;
        return create({
          ...(transporter ? { transporter } : {}),
          ...limits,
          sinks,
          ...(redact
            ? {
                redact: redact.map((pattern) =>
                  typeof pattern === "string"
                    ? new RegExp(pattern, "g")
                    : new RegExp(pattern.pattern, pattern.flags),
                ),
              }
            : {}),
        });
      },
      accepts: observationGuards.observation,
      async dispose(value) {
        if (observationGuards.observation(value)) await value.close();
      },
    }),
  ),
];

function isTransport(value: unknown): value is Transport {
  return nativeRecipeGuards.transport!(value);
}
