import {
  createWorkflowCheckpointStore,
  recoverWorkflowCheckpoint,
  workflowCheckpointKey,
} from "../transport-checkpoint.ts";
import { jsonObject } from "../transport-json.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import { workflowCheckpointMaxBytes } from "../workflow-checkpoint.constants.ts";
import type { TransportStoreOptions } from "../../domain/transport.types.ts";
import type { RecipeCheckpointStore } from "../../domain/recipes/checkpoint-store.types.ts";

export function createRecipeCheckpointStore(
  options: TransportStoreOptions,
): RecipeCheckpointStore {
  return {
    ...createWorkflowCheckpointStore(options),
    async inspect(runId) {
      const value = await options.transporter.read(
        workflowCheckpointKey(runId),
        { maxBytes: workflowCheckpointMaxBytes + 1024 },
      );
      if (!value) return undefined;
      const envelope = jsonObject(value);
      if (
        !recipeObject(envelope) ||
        (envelope.owner !== null && typeof envelope.owner !== "string")
      )
        throw new Error("Invalid checkpoint ownership envelope");
      return {
        revision: value.revision,
        owned: envelope.owner !== null,
        checkpoint: envelope.checkpoint,
      };
    },
    recover: (runId, revision) =>
      recoverWorkflowCheckpoint({ ...options, runId, revision }),
  };
}
