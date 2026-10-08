import type { DispatchAgent } from "../domain/fallback-agent.types.ts";
import type { Sandbox, SandboxOptions } from "./outpost.types.ts";

export interface RecipeBindings {
  readonly sandbox: Sandbox;
  readonly agents?: Readonly<Record<string, DispatchAgent>>;
  readonly inputs?: Readonly<Record<string, string | number | boolean>>;
}

export interface RecipeConfiguration {
  readonly sandbox: SandboxOptions;
  readonly agents?: Readonly<Record<string, DispatchAgent>>;
}
