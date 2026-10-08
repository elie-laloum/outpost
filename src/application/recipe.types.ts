import type { DispatchAgent } from "../domain/fallback-agent.types.ts";
import type { Sandbox } from "./outpost.types.ts";

export interface RecipeBindings {
  readonly sandbox: Sandbox;
  readonly agents?: Readonly<Record<string, DispatchAgent>>;
}
