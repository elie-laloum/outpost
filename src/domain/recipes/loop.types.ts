import type { Command } from "../command.types.ts";

/** `continue` resumes the previous attempt's conversation; `new` starts a fresh one each round. */
export type RecipeLoopConversation = "continue" | "new";

export interface RecipeLoopAttempt {
  readonly agent: string;
  readonly brief: string;
  readonly conversation: RecipeLoopConversation;
  /** Brief of rounds after the first when the conversation continues. */
  readonly followUp?: string;
  readonly dispatch?: Readonly<Record<string, unknown>>;
}

export interface RecipeLoopCommandCheck {
  readonly kind: "command";
  readonly command: Command;
}

export interface RecipeLoopAgentCheck {
  readonly kind: "agent";
  readonly agent: string;
  readonly brief: string;
}

export type RecipeLoopCheck = RecipeLoopCommandCheck | RecipeLoopAgentCheck;

/** A loop whose attempt and check are recipe steps run in the shared workspace. */
export interface RecipeDeclarativeLoop {
  readonly maxRounds: number;
  readonly attempt: RecipeLoopAttempt;
  readonly check: RecipeLoopCheck;
}
