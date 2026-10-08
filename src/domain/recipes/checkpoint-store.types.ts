import type { WorkflowCheckpointStore } from "../workflow/checkpoint.types.ts";

export interface RecipeCheckpointInspection {
  readonly revision: string;
  readonly owned: boolean;
  readonly checkpoint: unknown;
}

export interface RecipeCheckpointStore extends WorkflowCheckpointStore {
  inspect(runId: string): Promise<RecipeCheckpointInspection | undefined>;
  recover(runId: string, revision: string): Promise<void>;
}
