import type {
  ArtifactContract,
  ArtifactReference,
  ArtifactStore,
} from "../domain/artifact.types.ts";
import type { TaskContext, TaskOptions } from "../domain/workflow.types.ts";

export type ArtifactTaskOptions<T> = Omit<
  TaskOptions<ArtifactReference>,
  "perform"
> & {
  readonly store: ArtifactStore;
  readonly contract: ArtifactContract<T>;
  readonly produce: (context: TaskContext) => T | Promise<T>;
  readonly parents?: (context: TaskContext) => readonly ArtifactReference[];
};
