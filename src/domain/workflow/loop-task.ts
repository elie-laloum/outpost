import { defineTask } from "./task.ts";
import type { Task } from "../workflow.types.ts";
import type { LoopDefinition, LoopTaskOptions } from "./loop-task.types.ts";

const definitions = new WeakMap<Task, LoopDefinition>();

export class LoopTaskExhausted extends Error {
  readonly key: string;
  readonly maxRounds: number;
  readonly feedback: string;

  constructor(key: string, maxRounds: number, feedback: string) {
    super(`Loop task ${key} exhausted its ${maxRounds} rounds`);
    this.name = "LoopTaskExhausted";
    this.key = key;
    this.maxRounds = maxRounds;
    this.feedback = feedback;
  }
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
  const item = defineTask<T>({
    ...base,
    perform() {
      throw new Error("defineLoopTask must be executed by a workflow");
    },
  });
  definitions.set(
    item,
    Object.freeze<LoopDefinition>({
      maxRounds,
      attempt,
      // The task's paired callbacks share T; checkpoint versions bind restored outputs to that contract.
      check: (context, result) => check(context, result as T),
    }),
  );
  return item;
}

export function loopDefinition(item: Task): LoopDefinition | undefined {
  return definitions.get(item);
}
