import { checkpointValue } from "./checkpoint-value.ts";
import type { Task } from "../workflow.types.ts";
import type {
  TaskInteraction,
  WorkflowAnswer,
  WorkflowInputQuestion,
} from "./input.types.ts";

export function inputObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown): value is string {
  return typeof value === "string" && !!value.trim();
}

export function validateInteraction(value: TaskInteraction): void {
  if (
    !text(value.identity) ||
    !Array.isArray(value.actors) ||
    !value.actors.length ||
    value.actors.some((actor) => !text(actor)) ||
    new Set(value.actors).size !== value.actors.length
  )
    throw new Error(
      "Interaction identity and unique authorized actors are required",
    );
}

export function validateInputQuestion(
  value: unknown,
): asserts value is WorkflowInputQuestion {
  if (
    !inputObject(value) ||
    !text(value.question) ||
    (value.allowFreeText !== undefined &&
      typeof value.allowFreeText !== "boolean") ||
    (value.choices !== undefined &&
      (!Array.isArray(value.choices) ||
        !value.choices.length ||
        value.choices.some((choice) => !text(choice)) ||
        new Set(value.choices).size !== value.choices.length)) ||
    (value.allowFreeText === false && value.choices === undefined)
  )
    throw new Error("Invalid workflow input question");
}

export function validateAnswer(
  value: unknown,
  request: Record<string, unknown>,
  definition: TaskInteraction,
  executionId: string,
  key: string,
): asserts value is WorkflowAnswer {
  if (
    !inputObject(value) ||
    value.executionId !== executionId ||
    value.key !== key ||
    value.requestId !== request.id ||
    !text(value.actor) ||
    !definition.actors.includes(value.actor) ||
    !text(value.value) ||
    (request.allowFreeText === false &&
      (!Array.isArray(request.choices) ||
        !request.choices.includes(value.value)))
  )
    throw new Error("Invalid or unauthorized workflow answer");
}

export function validateInteractionRecord(
  record: Record<string, unknown>,
  item: Task,
  executionId: string,
): void {
  const value = record.interaction;
  const invalid = () =>
    new Error("Invalid workflow checkpoint interaction record");
  if (value === undefined) {
    if (record.status === "waiting-input") throw invalid();
    return;
  }
  if (!item.interaction || !inputObject(value)) throw invalid();
  if (value.state !== undefined) checkpointValue(value.state);
  if (value.request === undefined) {
    if (value.answer !== undefined || record.status === "waiting-input")
      throw invalid();
    return;
  }
  const request = value.request;
  validateInputQuestion(request);
  if (
    !inputObject(request) ||
    !text(request.id) ||
    request.executionId !== executionId ||
    request.key !== item.key ||
    !text(request.requestedAt) ||
    !Number.isFinite(Date.parse(request.requestedAt)) ||
    value.state === undefined
  )
    throw invalid();
  if (value.answer === undefined) {
    if (record.status !== "waiting-input") throw invalid();
    return;
  }
  if (record.status === "waiting-input") throw invalid();
  validateAnswer(
    value.answer,
    request,
    item.interaction,
    executionId,
    item.key,
  );
  if (
    !inputObject(value.answer) ||
    !text(value.answer.answeredAt) ||
    !Number.isFinite(Date.parse(value.answer.answeredAt))
  )
    throw invalid();
}
