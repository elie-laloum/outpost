import type { DispatchAgent } from "../../domain/fallback-agent.types.ts";
import type { SpeculationOptions } from "../speculation.types.ts";
import type {
  AgentConflictResolverOptions,
  IntegrationOptions,
} from "../conflict-resolution.types.ts";
import type { RecipeConfiguration } from "../recipe.types.ts";
import type {
  ReporterHandlers,
  CustomReporterOptions,
} from "../../infrastructure/custom-reporter.types.ts";

export interface RecipeConflictResolverOptions extends AgentConflictResolverOptions {
  readonly agent: DispatchAgent;
}
export interface RecipeCustomReporterOptions extends CustomReporterOptions {
  readonly handlers: ReporterHandlers;
}
export type RecipeSpeculationSettings = Omit<
  SpeculationOptions<unknown>,
  "signal" | "observation"
>;
export type RecipeIntegrationSettings = Omit<IntegrationOptions, "signal">;
export interface RecipeRuntimeConfiguration extends RecipeConfiguration {
  readonly integration?: RecipeIntegrationSettings;
}
