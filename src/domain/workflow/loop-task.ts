import {
  loopFeedbackCharacters,
  loopTaskDefinition,
} from "./loop-task.constants.ts";
import { defineTask } from "./task.ts";
import type { Task, TaskOptions } from "../workflow.types.ts";
import type {
  LoopDefinition,
  LoopTaskOptions,
  LoopTaskCapability,
} from "./loop-task.types.ts";

export class LoopTaskExhausted extends Error {
  readonly key: string;
  readonly maxRounds: number;
  readonly feedback: string;

  /** `shown` is the feedback quoted in the message, such as a redacted copy; it defaults to `feedback`. */
  constructor(
    key: string,
    maxRounds: number,
    feedback: string,
    shown: string = feedback,
  ) {
    super(
      shown
        ? `Loop task ${key} exhausted its ${maxRounds} rounds: ${loopFeedbackExcerpt(shown)}`
        : `Loop task ${key} exhausted its ${maxRounds} rounds`,
    );
    this.name = "LoopTaskExhausted";
    this.key = key;
    this.maxRounds = maxRounds;
    this.feedback = feedback;
  }
}

/** Keeps the start and end of long feedback, where commands print their status and summary. */
export function loopFeedbackExcerpt(feedback: string): string {
  if (feedback.length <= loopFeedbackCharacters) return feedback;
  const half = loopFeedbackCharacters / 2;
  return `${feedback.slice(0, half)}\n… [${feedback.length - loopFeedbackCharacters} characters omitted] …\n${feedback.slice(-half)}`;
}

export function defineLoopTask<T>(options: LoopTaskOptions<T>): Task<T> {
  if (!Number.isSafeInteger(options.maxRounds) || options.maxRounds < 1)
    throw new Error("maxRounds must be a positive safe integer");
  if (
    typeof options.attempt !== "function" ||
    typeof options.check !== "function"
  )
    throw new Error("defineLoopTask requires attempt and check callbacks");
  const { maxRounds, attempt, check, ...base } = options;
  const declaration: TaskOptions<T> & LoopTaskCapability = {
    ...base,
    [loopTaskDefinition]: Object.freeze<LoopDefinition>({
      maxRounds,
      attempt,
      // Paired callbacks share T; checkpoint versions bind restored outputs to that contract.
      check: (context, result) => check(context, result as T),
    }),
    perform() {
      throw new Error("defineLoopTask must be executed by a workflow");
    },
  };
  return defineTask(declaration);
}

export function loopDefinition(
  item: Task & LoopTaskCapability,
): LoopDefinition | undefined {
  return item[loopTaskDefinition];
}
