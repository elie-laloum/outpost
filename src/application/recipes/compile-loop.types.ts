import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";
import type {
  LoopCheckResult,
  LoopTaskContext,
} from "../../domain/workflow/loop-task.types.ts";
import type { ResponseSpec } from "../../domain/response.types.ts";
import type { RecipeLoopPhaseName } from "../../domain/recipes/loop.types.ts";
import type { DispatchAgent } from "../../domain/fallback-agent.types.ts";
import type { RecipeCompilationContext } from "./compilation.types.ts";
import type { NormalizedRecipeLoopCheckAgent } from "./normalized.types.ts";

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

/** Identifies a loop step in failures: its phase, 1-based rank and agent or command. */
export interface RecipeLoopStepLabel {
  readonly phase: RecipeLoopPhaseName;
  readonly rank: number;
  readonly agent?: string;
  readonly command?: string;
}

/** How a check agent's answer becomes a verdict: the response it requests and its reading. */
export interface RecipeLoopVerdict {
  readonly response?: ResponseSpec<unknown>;
  decide(value: unknown, task: LoopTaskContext): LoopCheckResult;
}

export type RecipeLoopVerdictKind = "contract" | "response" | "condition";

export type RecipeLoopVerdictStrategy = (
  check: NormalizedRecipeLoopCheckAgent,
  agent: DispatchAgent,
  context: RecipeCompilationContext,
) => RecipeLoopVerdict;
