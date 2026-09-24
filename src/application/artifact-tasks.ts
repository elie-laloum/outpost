import { publishArtifact, readStoredArtifact } from "../domain/artifact.ts";
import { validateArtifactReference } from "../domain/artifact-reference.ts";
import type {
  ArtifactContract,
  ArtifactReference,
  ArtifactStore,
} from "../domain/artifact.types.ts";
import { task } from "../domain/workflow.ts";
import type { Task, TaskContext } from "../domain/workflow.types.ts";
import type { ArtifactTaskOptions } from "./artifact-tasks.types.ts";

export function artifactTask<T>(
  options: ArtifactTaskOptions<T>,
): Task<ArtifactReference> {
  const { store, contract, produce, parents, ...definition } = options;
  return task({
    ...definition,
    async perform(context) {
      const lineage = parents?.(context) ?? [];
      return publishArtifact(store, contract, await produce(context), {
        producer: {
          executionId: context.executionId,
          taskKey: definition.key,
          attempt: context.attempt,
        },
        parents: lineage,
        signal: context.signal,
      });
    },
  });
}

export async function readArtifact<T>(
  context: TaskContext,
  dependency: Task<ArtifactReference>,
  contract: ArtifactContract<T>,
  store: ArtifactStore,
): Promise<T> {
  const reference = validateArtifactReference(context.value(dependency));
  if (
    reference.producer.executionId !== context.executionId ||
    reference.producer.taskKey !== dependency.key
  )
    throw new Error("Artifact dependency producer mismatch");
  return readStoredArtifact(store, contract, reference, {
    signal: context.signal,
  });
}
