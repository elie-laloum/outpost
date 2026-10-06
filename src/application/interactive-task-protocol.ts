import { invariant } from "../domain/errors.ts";
import { defineJsonResponse } from "../domain/response.ts";
import { interactiveResponseSchema } from "./interactive-task.constants.ts";
import { checkpointValue } from "../domain/workflow/checkpoint-value.ts";
import {
  inputObject,
  validateInputQuestion,
} from "../domain/workflow/input-validation.ts";
import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";
import type {
  InteractiveAgentState,
  InteractiveAgentTurn,
} from "./interactive-task.types.ts";

export const interactiveResponse = defineJsonResponse<InteractiveAgentTurn>({
  tag: "interaction",
  jsonSchema: interactiveResponseSchema,
  repairs: 1,
  schema(value) {
    invariant(inputObject(value), "Interactive response must be an object");
    if (value.kind === "question") {
      validateInputQuestion(value);
      return {
        kind: "question",
        question: value.question,
        ...(value.choices ? { choices: value.choices } : {}),
        ...(value.allowFreeText !== undefined
          ? { allowFreeText: value.allowFreeText }
          : {}),
      };
    }
    invariant(
      value.kind === "completed" && Object.hasOwn(value, "output"),
      "Expected a question or completed output",
    );
    const output = checkpointValue(value.output);
    invariant(
      output.kind === "json",
      "Interactive output must be lossless JSON",
    );
    return { kind: "completed", output: output.value };
  },
});

export function interactiveState(
  value: WorkflowJson | undefined,
): InteractiveAgentState | undefined {
  if (value === undefined) return undefined;
  assertState(value);
  return value;
}

function assertState(value: unknown): asserts value is InteractiveAgentState {
  invariant(
    inputObject(value) &&
      typeof value.turns === "number" &&
      Number.isSafeInteger(value.turns) &&
      value.turns >= 0 &&
      typeof value.branch === "string" &&
      !!value.branch &&
      typeof value.directory === "string" &&
      !!value.directory &&
      (value.conversation === undefined ||
        (typeof value.conversation === "string" && !!value.conversation)) &&
      (value.turns === 0 || !!value.conversation),
    "Invalid interactive agent checkpoint state",
  );
  if (value.completed === undefined) return;
  const completed = value.completed;
  invariant(
    inputObject(completed) &&
      Object.hasOwn(completed, "output") &&
      completed.conversation === value.conversation &&
      completed.branch === value.branch &&
      completed.directory === value.directory &&
      completed.turns === value.turns,
    "Invalid completed interactive agent checkpoint",
  );
  checkpointValue(completed.output);
}
