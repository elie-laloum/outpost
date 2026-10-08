import { createObservationHub } from "../../domain/observation.ts";
import { recipeObject, recipeSchema } from "../../domain/recipes/values.ts";
import { recipeScalarSchemas as schemas } from "../../domain/recipes/schema.constants.ts";
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
  sink: (value): value is ObservationSink =>
    recipeObject(value) && typeof value.observe === "function",
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
  {
    name: "observation.hub",
    kind: "observation",
    schema: recipeSchema({
      sinks: {
        type: "array",
        items: { ...schemas.reference, component: "sink" },
      },
      redact: schemas.strings,
      capacity: schemas.integer,
      deliveryTimeoutMs: schemas.integer,
      verbose: schemas.boolean,
    }),
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
      const { redact, sinks: references, ...limits } = options;
      return createObservationHub({
        ...limits,
        sinks,
        ...(redact
          ? { redact: redact.map((pattern) => new RegExp(pattern, "g")) }
          : {}),
      });
    },
    accepts: observationGuards.observation,
    async dispose(value) {
      if (observationGuards.observation(value)) await value.close();
    },
  },
];
