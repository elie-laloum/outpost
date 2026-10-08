import { createAgentConflictResolver } from "../agent-conflict-resolver.ts";
import { createReporter } from "../../infrastructure/reporter.ts";
import { createCustomReporter } from "../../infrastructure/custom-reporter.ts";
import { agentObservation } from "../../domain/agent-observation.ts";
import type { ReporterOptions } from "../../infrastructure/reporter.types.ts";
import type { OpenTelemetryOptions } from "../../infrastructure/opentelemetry.types.ts";
import type {
  RecipeConflictResolverOptions,
  RecipeCustomReporterOptions,
} from "./advanced-components.types.ts";
import type { ObservationSink } from "../../domain/observation.types.ts";

export function createRecipeConflictResolver({
  agent,
  ...options
}: RecipeConflictResolverOptions) {
  return createAgentConflictResolver(agent, options);
}

export function createRecipeReporter(
  options: ReporterOptions,
): ObservationSink {
  const report = createReporter(options);
  return {
    observe(value) {
      report({
        ...value.event,
        ...(value.scope.pass === undefined ? {} : { pass: value.scope.pass }),
      });
    },
  };
}

export function createRecipeCustomReporter({
  handlers,
  ...options
}: RecipeCustomReporterOptions) {
  const report = createCustomReporter(handlers, options);
  return {
    observe(value: Parameters<ObservationSink["observe"]>[0]) {
      const event = agentObservation(value);
      if (event) report(event);
    },
    close: () => report.flush(),
  };
}

export async function createRecipeOpenTelemetry(options: OpenTelemetryOptions) {
  const { createOpenTelemetryObserver } =
    await import("../../infrastructure/opentelemetry.ts");
  const observer = createOpenTelemetryObserver(options);
  return { ...observer.sink, close: () => observer.close() };
}
