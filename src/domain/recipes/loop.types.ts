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

export type RecipeLoopCheck =
  | { readonly kind: "command"; readonly command: Command }
  | { readonly kind: "agent"; readonly agent: string; readonly brief: string };

/** A loop whose attempt and check are recipe steps run in the shared workspace. */
export interface RecipeDeclarativeLoop {
  readonly maxRounds: number;
  readonly attempt: RecipeLoopAttempt;
  readonly check: RecipeLoopCheck;
}
