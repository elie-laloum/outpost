import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";
import type {
  LoopCheckResult,
  LoopTaskContext,
} from "../../domain/workflow/loop-task.types.ts";

/** JSON result of a declarative loop round, as projected into recipe outputs. */
export type RecipeLoopOutput = Readonly<Record<string, WorkflowJson>>;

/** The check of a declarative loop round, given the round's attempt output. */
export type RecipeLoopPhase = (
  task: LoopTaskContext,
  output: RecipeLoopOutput,
) => Promise<LoopCheckResult>;

/** Retained output of one command stream; `length` counts every character it produced. */
export interface RecipeLoopStream {
  readonly channel: "stdout" | "stderr";
  readonly text: string;
  readonly length: number;
}
