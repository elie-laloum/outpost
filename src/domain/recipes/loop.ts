import { configurationError } from "../configuration-diagnostic.ts";
import { recipeCommandFields } from "../recipe-templates.ts";
import { recipeTemplatePattern } from "../recipe.constants.ts";
import {
  recipeCommand,
  recipeFields,
  recipeInteger,
  recipeMapping,
  recipeText,
} from "./document-fields.ts";
import { validateRecipeExpression } from "./expressions.ts";
import { recipeLoopKeys, recipeLoopValues } from "./loop.constants.ts";
import { recipeObject, recipeReference } from "./values.ts";
import type { RecipeDocument, RecipeStep } from "../recipe.types.ts";
import type { RecipeSourcePath } from "./expressions.types.ts";
import type {
  RecipeDeclarativeLoop,
  RecipeLoopAttempt,
  RecipeLoopCheck,
  RecipeLoopConversation,
} from "./loop.types.ts";

const parsed = new WeakMap<object, RecipeDeclarativeLoop | null>();

function reference(value: unknown): boolean {
  return recipeObject(value) && Object.hasOwn(value, "$ref");
}

/** Whether a loop delegates both phases to extension callbacks, refusing a mix of both forms. */
function callbackLoop(loop: Record<string, unknown>, path: string): boolean {
  if (recipeReference(loop)) return true;
  const attempt = reference(loop.attempt);
  if (attempt === reference(loop.check)) return attempt;
  throw configurationError(
    `${path} must declare both phases as callbacks or both as recipe steps`,
    path,
    "mixed-loop",
    "Reference callbacks with $ref in attempt and check, or declare an agent attempt with a command or agent check.",
  );
}

function attemptOf(value: unknown, path: string): RecipeLoopAttempt {
  const attempt = recipeFields(value, path, recipeLoopKeys.attempt);
  const conversation = attempt.conversation ?? "new";
  if (conversation !== "new" && conversation !== "continue")
    throw configurationError(
      `${path}.conversation must be new or continue`,
      `${path}.conversation`,
    );
  if (attempt.followUp !== undefined && conversation !== "continue")
    throw configurationError(
      `${path}.followUp requires conversation: continue`,
      `${path}.followUp`,
      "invalid-configuration",
      "Remove followUp, or set conversation: continue to send it in the same conversation.",
    );
  const dispatch =
    attempt.dispatch === undefined
      ? undefined
      : recipeMapping(attempt.dispatch, `${path}.dispatch`);
  if (dispatch && !recipeReference(dispatch))
    validateRecipeLoopDispatch(conversation, dispatch, `${path}.dispatch`);
  return {
    agent: recipeText(attempt.agent, `${path}.agent`),
    brief: recipeText(attempt.brief, `${path}.brief`),
    conversation,
    ...(attempt.followUp === undefined
      ? {}
      : { followUp: recipeText(attempt.followUp, `${path}.followUp`) }),
    ...(dispatch === undefined ? {} : { dispatch }),
  };
}

/** Outpost owns the conversation between rounds; a single pass keeps it continuable. */
export function validateRecipeLoopDispatch(
  conversation: RecipeLoopConversation,
  dispatch: Readonly<Record<string, unknown>>,
  path: string,
): void {
  if (dispatch.continuation !== undefined)
    throw configurationError(
      `${path}.continuation is managed by the loop`,
      `${path}.continuation`,
      "invalid-configuration",
      "Remove continuation; set conversation: continue on the attempt to resume the previous round.",
    );
  if (
    conversation === "continue" &&
    dispatch.passes !== undefined &&
    dispatch.passes !== 1
  )
    throw configurationError(
      `${path}.passes must be 1 when the loop continues its conversation`,
      `${path}.passes`,
      "invalid-configuration",
      "Remove passes, or set conversation: new.",
    );
}

function checkOf(value: unknown, path: string): RecipeLoopCheck {
  const check = recipeMapping(value, path);
  if (Object.hasOwn(check, "command")) {
    recipeFields(check, path, recipeLoopKeys.commandCheck);
    return {
      kind: "command",
      command: recipeCommand(check.command, `${path}.command`),
    };
  }
  if (!Object.hasOwn(check, "agent"))
    throw configurationError(
      `${path} requires a command or an agent with a brief`,
      path,
      "missing-field",
    );
  recipeFields(check, path, recipeLoopKeys.agentCheck);
  return {
    kind: "agent",
    agent: recipeText(check.agent, `${path}.agent`),
    brief: recipeText(check.brief, `${path}.brief`),
  };
}

/** Reads a declarative loop; callback loops return undefined and stay component options. */
export function parseRecipeLoop(
  value: unknown,
  path: string,
): RecipeDeclarativeLoop | undefined {
  const loop = recipeMapping(value, path);
  if (callbackLoop(loop, path)) return undefined;
  recipeFields(loop, path, recipeLoopKeys.loop);
  return {
    maxRounds: recipeInteger(loop.maxRounds, `${path}.maxRounds`),
    attempt: attemptOf(loop.attempt, `${path}.attempt`),
    check: checkOf(loop.check, `${path}.check`),
  };
}

/** Component name of a loop attempt's dispatch options in the recipe graph. */
export function recipeLoopDispatchComponent(key: string): string {
  return `tasks.${key}.loop.attempt.dispatch`;
}

/** The declarative loop of a validated task, read once per document. */
export function declarativeRecipeLoop(
  step: RecipeStep,
): RecipeDeclarativeLoop | undefined {
  if (!step.loop) return undefined;
  let loop = parsed.get(step.loop);
  if (loop === undefined) {
    loop = parseRecipeLoop(step.loop, `${step.key}.loop`) ?? null;
    parsed.set(step.loop, loop);
  }
  return loop ?? undefined;
}

function usesLoopValue(text: string, name: string): boolean {
  return [...text.matchAll(recipeTemplatePattern)].some(
    (match) => match[1]!.trim() === `loop.${name}`,
  );
}

/** Validates loop expressions and requires the attempt to see the check feedback. */
export function validateRecipeLoopExpressions(
  document: RecipeDocument,
  step: RecipeStep,
  loop: RecipeDeclarativeLoop,
  sourcePath: RecipeSourcePath,
): void {
  const at = (values: readonly string[], ...path: RecipeSourcePath) => ({
    document,
    step,
    loop: values,
    sourcePath: [...sourcePath, ...path],
  });
  const { attempt, check } = loop;
  validateRecipeExpression(
    attempt.brief,
    at(recipeLoopValues.attempt, "attempt", "brief"),
  );
  if (attempt.followUp !== undefined)
    validateRecipeExpression(
      attempt.followUp,
      at(recipeLoopValues.attempt, "attempt", "followUp"),
    );
  if (check.kind === "agent")
    validateRecipeExpression(
      check.brief,
      at(recipeLoopValues.check, "check", "brief"),
    );
  if (check.kind === "command")
    for (const [value, path] of recipeCommandFields(check.command))
      validateRecipeExpression(
        value,
        at(recipeLoopValues.command, "check", "command", ...path),
      );
  const field =
    attempt.conversation === "new" ? "brief" : ("followUp" as const);
  const text = attempt[field];
  if (text === undefined || usesLoopValue(text, "feedback")) return;
  throw configurationError(
    `${step.key}: the loop attempt ${field} must include {{ loop.feedback }}`,
    [...sourcePath, "attempt", field],
    "missing-loop-feedback",
    attempt.conversation === "new"
      ? "A new conversation starts without the check feedback: place {{ loop.feedback }} in the brief, or set conversation: continue."
      : "Place {{ loop.feedback }} in followUp, or remove followUp to send the default feedback message.",
  );
}
