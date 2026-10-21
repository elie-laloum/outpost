import { createAgentConflictResolver } from "../agent-conflict-resolver.ts";
import { createCustomReporter } from "../../infrastructure/custom-reporter.ts";
import type {
  RecipeConflictResolverOptions,
  RecipeCustomReporterOptions,
} from "./advanced-components.types.ts";

export function createRecipeConflictResolver({
  agent,
  ...options
}: RecipeConflictResolverOptions) {
  return createAgentConflictResolver(agent, options);
}

export function createRecipeCustomReporter({
  handlers,
  ...options
}: RecipeCustomReporterOptions) {
  const report = createCustomReporter(handlers, options);
  return {
    observe: report.observe,
    flush: report.flush,
    close: report.flush,
  };
}
