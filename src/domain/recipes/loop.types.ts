import type { Command } from "../command.types.ts";
import type { WorkflowJson } from "../workflow/checkpoint.types.ts";
import type { RecipeSourcePath } from "./expressions.types.ts";

/** `continue` resumes the agent's previous conversation; `new` starts a fresh one each round. */
export type RecipeLoopConversation = "continue" | "new";

export type RecipeLoopPhaseName = "attempt" | "check";

interface RecipeLoopStepBase {
  /** Location inside the loop: `["attempt"]` for the mapping shorthand, `["check", 1]` in a list. */
  readonly path: RecipeSourcePath;
}

export interface RecipeLoopCommandStep extends RecipeLoopStepBase {
  readonly kind: "command";
  readonly command: Command;
}

export interface RecipeLoopAgentStep extends RecipeLoopStepBase {
  readonly kind: "agent";
  readonly agent: string;
  readonly brief: string;
  readonly dispatch?: Readonly<Record<string, unknown>>;
}

export interface RecipeLoopAttemptAgent extends RecipeLoopAgentStep {
  readonly conversation: RecipeLoopConversation;
  /** Brief of rounds after the first. */
  readonly followUp?: string;
}

export interface RecipeLoopCheckAgent extends RecipeLoopAgentStep {
  /** Unvalidated `done` condition, compiled with the document by `recipeLoopDone()`. */
  readonly done?: WorkflowJson;
}

export type RecipeLoopAttemptStep =
  RecipeLoopAttemptAgent | RecipeLoopCommandStep;

export type RecipeLoopCheckStep = RecipeLoopCheckAgent | RecipeLoopCommandStep;

/** A loop whose attempt and check are ordered recipe steps run in the shared workspace. */
export interface RecipeDeclarativeLoop {
  readonly maxRounds: number;
  readonly attempt: readonly RecipeLoopAttemptStep[];
  readonly check: readonly RecipeLoopCheckStep[];
}

/** Rules a loop agent's dispatch options must follow. */
export interface RecipeLoopDispatchRules {
  readonly phase: RecipeLoopPhaseName;
  readonly conversation: RecipeLoopConversation;
}

/** A dispatch API constraint that requires one pass for a loop agent. */
export interface RecipeLoopPassRule {
  applies(
    rules: RecipeLoopDispatchRules,
    dispatch: Readonly<Record<string, unknown>>,
  ): boolean;
  readonly reason: string;
  readonly hint: string;
}

/** The parts of a response contract or declaration a loop check agent's rules read. */
export interface RecipeLoopResponseShape {
  readonly format?: string;
  readonly jsonSchema?: unknown;
}

/** An agent step with the phase that runs it. */
export type RecipeLoopAgentUse =
  | { readonly phase: "attempt"; readonly step: RecipeLoopAttemptAgent }
  | { readonly phase: "check"; readonly step: RecipeLoopCheckAgent };

/** The parts of a check agent, parsed or normalized, its response rules read. */
export interface RecipeLoopResponseCheck {
  readonly path: RecipeSourcePath;
  readonly done?: unknown;
}
