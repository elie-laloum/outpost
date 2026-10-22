import type { DispatchAgent } from "../../domain/fallback-agent.types.ts";
import type { SpeculationOptions } from "../speculation.types.ts";
import type {
  AgentConflictResolverOptions,
  IntegrationOptions,
} from "../conflict-resolution.types.ts";
import type { RecipeConfiguration } from "../recipe.types.ts";
import type { SandboxOptions } from "../outpost.types.ts";
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
/** Sandbox options of the Git zones; `sandbox` exists when the configuration workspace uses Git. */
export interface RecipeGitZoneOptions {
  readonly sandbox?: SandboxOptions;
  readonly integration?: RecipeIntegrationSettings;
  /** Options of each named sandbox that opens a Git workspace, including that workspace. */
  readonly sandboxes?: Readonly<Record<string, SandboxOptions>>;
}
export interface RecipeRuntimeConfiguration
  extends RecipeConfiguration, RecipeGitZoneOptions {
  readonly sandbox: SandboxOptions;
}
