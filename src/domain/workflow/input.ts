import { randomUUID } from "node:crypto";
import { checkpointValue } from "./checkpoint-value.ts";
import { validateAnswer, validateInputQuestion } from "./input-validation.ts";
import type { Task, WorkflowExecutionState } from "../workflow.types.ts";
import type { WorkflowJson } from "./checkpoint.types.ts";
import type {
  TaskInteractionContext,
  TaskInteractionRecord,
  WorkflowAnswerRecord,
} from "./input.types.ts";

export class InputSuspension extends Error {
  readonly interaction: TaskInteractionRecord;
  constructor(interaction: TaskInteractionRecord) {
    super("Task is waiting for human input");
    this.interaction = interaction;
  }
}

export function immutableInput<T>(value: T): T {
  checkpointValue(value);
  const copy: T = structuredClone(value);
  function freeze(item: unknown): void {
    if (item === null || typeof item !== "object") return;
    for (const child of Object.values(item)) freeze(child);
    Object.freeze(item);
  }
  freeze(copy);
  return copy;
}

export function interactionContext(
  item: Task,
  runtime: WorkflowExecutionState,
  attempt: number,
  signal: AbortSignal,
  isActive: () => boolean,
): TaskInteractionContext {
  const record = runtime.record(item);
  const current = () => {
    signal.throwIfAborted();
    if (
      !isActive() ||
      !runtime.options.checkpoint ||
      record.status !== "active" ||
      record.attempts !== attempt ||
      attempt === 0
    )
      throw new Error(
        "Interaction requires an active checkpointed task attempt",
      );
  };
  return {
    get state() {
      return record.interaction?.state;
    },
    get answer() {
      return record.interaction?.answer;
    },
    async save(state: WorkflowJson) {
      current();
      record.interaction = immutableInput({ ...record.interaction, state });
      await runtime.persist();
    },
    suspend(question, state) {
      current();
      validateInputQuestion(question);
      const pending = immutableInput({
        state,
        request: {
          ...question,
          id: randomUUID(),
          executionId: runtime.executionId,
          key: item.key,
          requestedAt: new Date().toISOString(),
        },
      });
      throw new InputSuspension(pending);
    },
  };
}

export function prepareAnswers(
  runtime: WorkflowExecutionState,
): readonly WorkflowAnswerRecord[] {
  const answers: WorkflowAnswerRecord[] = [];
  const seen = new Set<string>();
  for (const value of runtime.options.answers ?? []) {
    const item = [...runtime.records.keys()].find(
      (task) => task.key === value.key,
    );
    const record = item && runtime.record(item);
    const request = record?.interaction?.request;
    if (
      !item?.interaction ||
      !request ||
      record?.status !== "waiting-input" ||
      record.interaction?.answer ||
      seen.has(item.key)
    )
      throw new Error("Stale or duplicate workflow answer");
    validateAnswer(
      value,
      { ...request },
      item.interaction,
      runtime.executionId,
      item.key,
    );
    seen.add(item.key);
    answers.push(
      immutableInput({ ...value, answeredAt: new Date().toISOString() }),
    );
  }
  return answers;
}

export function applyAnswers(
  runtime: WorkflowExecutionState,
  answers: readonly WorkflowAnswerRecord[],
): void {
  for (const answer of answers) {
    const item = [...runtime.records.keys()].find(
      (task) => task.key === answer.key,
    )!;
    const record = runtime.record(item);
    record.interaction = immutableInput({ ...record.interaction, answer });
    record.status = "waiting";
    delete record.finishedAt;
    runtime.emit({ type: "input-answer", key: item.key, status: "waiting" });
  }
}
