import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";
import type { DispatchAgent } from "../domain/fallback-agent.types.ts";
import type { Sandbox, SandboxOptions } from "./outpost.types.ts";
import type { FileSandbox } from "./file-sandbox.types.ts";

export interface RecipeBindings {
  readonly sandbox: Sandbox;
  readonly agents?: Readonly<Record<string, DispatchAgent>>;
  readonly inputs?: Readonly<Record<string, WorkflowJson>>;
}

export interface FileRecipeBindings extends Omit<RecipeBindings, "sandbox"> {
  readonly sandbox: FileSandbox;
}

export interface MixedRecipeBindings extends Omit<RecipeBindings, "sandbox"> {
  readonly sandbox: Sandbox | FileSandbox;
}

export interface FileRecipeConfiguration extends Omit<
  RecipeConfiguration,
  "sandbox"
> {
  readonly sandbox: import("./file-sandbox.types.ts").FileSandboxOptions;
}

export interface RecipeConfiguration {
  readonly sandbox: SandboxOptions;
  readonly agents?: Readonly<Record<string, DispatchAgent>>;
}
