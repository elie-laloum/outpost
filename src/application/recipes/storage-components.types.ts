import type { ArtifactContractOptions } from "../../domain/artifact.types.ts";
import type { JsonSchema } from "../../domain/tool.types.ts";
import type { StandardValidator } from "../../domain/response.types.ts";
import type {
  InteractiveAgentTaskOptions,
  FileInteractiveAgentTaskOptions,
} from "../interactive-task.types.ts";
import type { ArtifactTaskOptions } from "../artifact-tasks.types.ts";
import type { WorkflowGate } from "../../domain/workflow/gates.types.ts";

export interface RecipeJsonArtifactOptions extends ArtifactContractOptions {
  readonly jsonSchema: JsonSchema;
  readonly schema?:
    | StandardValidator<unknown>
    | ((input: unknown) => unknown | Promise<unknown>);
}
export type RecipeInteractiveSettings =
  | Omit<InteractiveAgentTaskOptions, "key" | "after">
  | Omit<FileInteractiveAgentTaskOptions, "key" | "after">;
export type RecipeGateSettings = WorkflowGate;
export type RecipeArtifactSettings = Pick<
  ArtifactTaskOptions<unknown>,
  "store" | "contract" | "parents"
> &
  Partial<Pick<ArtifactTaskOptions<unknown>, "produce">>;
