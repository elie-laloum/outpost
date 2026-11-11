import { configurationError } from "../configuration-diagnostic.ts";
import { recipeCommandFields } from "../recipe-templates.ts";
import {
  recipeCommand,
  recipeFields,
  recipeInteger,
  recipeMapping,
  recipeText,
} from "./document-fields.ts";
import {
  recipeJson,
  validateRecipeCondition,
  validateRecipeExpression,
} from "./expressions.ts";
import {
  recipeLoopFieldHints,
  recipeLoopKeys,
  recipeLoopValues,
} from "./loop.constants.ts";
import { recipeObject, recipeReference } from "./values.ts";
import type { RecipeDocument, RecipeStep } from "../recipe.types.ts";
import type {
  RecipeConditionNode,
  RecipeSourcePath,
} from "./expressions.types.ts";
import type {
  RecipeDeclarativeLoop,
  RecipeLoopAgentStep,
  RecipeLoopAgentUse,
  RecipeLoopAttemptStep,
  RecipeLoopCheckAgent,
  RecipeLoopCheckStep,
  RecipeLoopCommandStep,
  RecipeLoopDispatchRules,
  RecipeLoopPassRule,
  RecipeLoopPhaseName,
  RecipeLoopResponseCheck,
  RecipeLoopResponseShape,
} from "./loop.types.ts";

/** Dispatch API rule: a continued conversation or a typed response needs one pass. */
const singlePassRules: readonly RecipeLoopPassRule[] = [
  {
    applies: (rules) => rules.conversation === "continue",
    reason: "the loop continues its conversation",
    hint: "Remove passes, or set conversation: new.",
  },
  {
    applies: (rules) => rules.phase === "check",
    reason: "a check agent answers with a typed response",
    hint: "Remove passes; a check agent answers in one pass.",
  },
  {
    applies: (_rules, dispatch) => dispatch.response !== undefined,
    reason: "the step expects a typed response",
    hint: "Remove passes, or remove response.",
  },
];

const parsed = new WeakMap<object, RecipeDeclarativeLoop | null>();
const conditions = new WeakMap<RecipeLoopCheckAgent, RecipeConditionNode>();

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
    "Reference callbacks with $ref in attempt and check, or declare agent and command steps in both.",
  );
}

/** Outpost owns each agent's conversation between rounds; one pass keeps it continuable. */
export function validateRecipeLoopDispatch(
  rules: RecipeLoopDispatchRules,
  dispatch: Readonly<Record<string, unknown>>,
  path: string,
): void {
  if (dispatch.continuation !== undefined)
    throw configurationError(
      `${path}.continuation is managed by the loop`,
      `${path}.continuation`,
      "invalid-configuration",
      "Remove continuation; set conversation: continue on an attempt agent to resume its previous round.",
    );
  if (dispatch.passes === undefined || dispatch.passes === 1) return;
  const rule = singlePassRules.find(({ applies }) => applies(rules, dispatch));
  if (!rule) return;
  throw configurationError(
    `${path}.passes must be 1 when ${rule.reason}`,
    `${path}.passes`,
    "invalid-configuration",
    rule.hint,
  );
}

function inlineDispatch(
  step: Readonly<Record<string, unknown>>,
  path: string,
  rules: RecipeLoopDispatchRules,
): Pick<RecipeLoopAgentStep, "dispatch"> {
  if (step.dispatch === undefined) return {};
  const dispatch = recipeMapping(step.dispatch, `${path}.dispatch`);
  if (!recipeReference(dispatch))
    validateRecipeLoopDispatch(rules, dispatch, `${path}.dispatch`);
  return { dispatch };
}

function commandStep(
  step: Readonly<Record<string, unknown>>,
  path: string,
  at: RecipeSourcePath,
): RecipeLoopCommandStep {
  recipeFields(step, path, recipeLoopKeys.command, recipeLoopFieldHints);
  return {
    kind: "command",
    path: at,
    command: recipeCommand(step.command, `${path}.command`),
  };
}

function attemptStep(
  value: unknown,
  path: string,
  at: RecipeSourcePath,
): RecipeLoopAttemptStep {
  const step = recipeMapping(value, path);
  if (Object.hasOwn(step, "command")) return commandStep(step, path, at);
  recipeFields(step, path, recipeLoopKeys.attemptAgent, recipeLoopFieldHints);
  const conversation = step.conversation ?? "new";
  if (conversation !== "new" && conversation !== "continue")
    throw configurationError(
      `${path}.conversation must be new or continue`,
      `${path}.conversation`,
    );
  const dispatch = inlineDispatch(step, path, {
    phase: "attempt",
    conversation,
  });
  return {
    kind: "agent",
    path: at,
    agent: recipeText(step.agent, `${path}.agent`),
    brief: recipeText(step.brief, `${path}.brief`),
    conversation,
    ...(step.followUp === undefined
      ? {}
      : { followUp: recipeText(step.followUp, `${path}.followUp`) }),
    ...dispatch,
  };
}

function checkStep(
  value: unknown,
  path: string,
  at: RecipeSourcePath,
): RecipeLoopCheckStep {
  const step = recipeMapping(value, path);
  if (Object.hasOwn(step, "command")) return commandStep(step, path, at);
  if (!Object.hasOwn(step, "agent"))
    throw configurationError(
      `${path} requires a command or an agent with a brief`,
      path,
      "missing-field",
    );
  recipeFields(step, path, recipeLoopKeys.checkAgent, recipeLoopFieldHints);
  const dispatch = inlineDispatch(step, path, {
    phase: "check",
    conversation: "new",
  });
  return {
    kind: "agent",
    path: at,
    agent: recipeText(step.agent, `${path}.agent`),
    brief: recipeText(step.brief, `${path}.brief`),
    ...dispatch,
    ...(step.done === undefined ? {} : { done: recipeJson(step.done) }),
  };
}

/** Reads a phase as a list of steps; a single mapping is the shorthand for a one-step list. */
function phaseSteps<T>(
  value: unknown,
  path: string,
  phase: RecipeLoopPhaseName,
  read: (value: unknown, path: string, at: RecipeSourcePath) => T,
): T[] {
  if (!Array.isArray(value)) return [read(value, path, [phase])];
  if (!value.length)
    throw configurationError(
      `${path} must list at least one step`,
      path,
      "invalid-configuration",
      "Declare one or more agent or command steps.",
    );
  return value.map((item, index) =>
    read(item, `${path}[${index}]`, [phase, index]),
  );
}

/** Reads a declarative loop; callback loops return undefined and stay component options. */
export function parseRecipeLoop(
  value: unknown,
  path: string,
): RecipeDeclarativeLoop | undefined {
  const loop = recipeMapping(value, path);
  if (callbackLoop(loop, path)) return undefined;
  recipeFields(loop, path, recipeLoopKeys.loop);
  const maxRounds = recipeInteger(loop.maxRounds, `${path}.maxRounds`);
  const attempt = phaseSteps(
    loop.attempt,
    `${path}.attempt`,
    "attempt",
    attemptStep,
  );
  if (!attempt.some((step) => step.kind === "agent"))
    throw configurationError(
      `${path}.attempt requires an agent step`,
      `${path}.attempt`,
      "missing-loop-agent",
      "Add an agent step; run commands that only prepare the work as a task before the loop, linked with after.",
    );
  return {
    maxRounds,
    attempt,
    check: phaseSteps(loop.check, `${path}.check`, "check", checkStep),
  };
}

/** Component name of a loop agent's dispatch options in the recipe graph. */
export function recipeLoopDispatchComponent(
  key: string,
  step: Pick<RecipeLoopAgentStep, "path">,
): string {
  return `tasks.${key}.loop.${step.path.join(".")}.dispatch`;
}

function declaresField(
  schema: Readonly<Record<string, unknown>>,
  field: string,
  type: string,
): boolean {
  const property = recipeObject(schema.properties)
    ? schema.properties[field]
    : undefined;
  const declared = recipeObject(property) ? property.type : undefined;
  return (
    recipeObject(property) &&
    Array.isArray(schema.required) &&
    schema.required.includes(field) &&
    (declared === undefined ||
      declared === type ||
      (Array.isArray(declared) && declared.includes(type)))
  );
}

/** Checks a check agent's response; schemas without top-level `properties` are checked at runtime. */
export function validateRecipeLoopResponse(
  check: RecipeLoopResponseCheck,
  response: RecipeLoopResponseShape | undefined,
  loopPath: RecipeSourcePath,
): void {
  const at = [...loopPath, ...check.path];
  if (!response) {
    if (check.done === undefined) return;
    throw configurationError(
      "done requires a custom JSON response on the check agent",
      [...at, "done"],
      "invalid-configuration",
      "Declare dispatch.response with a JSON schema that requires feedback, or remove done to use the built-in { done, feedback } answer.",
    );
  }
  const path = [...at, "dispatch", "response"];
  if (response.format === "text")
    throw configurationError(
      "A loop check agent requires a JSON response",
      path,
      "invalid-configuration",
      "Declare a JSON response, or remove response to use the built-in { done, feedback } answer.",
    );
  const schema = response.jsonSchema;
  if (!recipeObject(schema) || !recipeObject(schema.properties)) return;
  const fields: readonly (readonly [string, string])[] =
    check.done === undefined
      ? [
          ["done", "boolean"],
          ["feedback", "string"],
        ]
      : [["feedback", "string"]];
  for (const [field, type] of fields)
    if (!declaresField(schema, field, type))
      throw configurationError(
        `The check agent response must declare ${field} as a required ${type}`,
        path,
        "invalid-configuration",
        check.done === undefined
          ? "Without a done condition, the response carries the verdict: require done (boolean) and feedback (string)."
          : "The done condition decides; require feedback (string) to explain a refusal.",
      );
}

/** The agent steps of both phases, attempt first, each in declaration order. */
export function recipeLoopAgents(
  loop: RecipeDeclarativeLoop,
): readonly RecipeLoopAgentUse[] {
  return [
    ...loop.attempt.flatMap((step) =>
      step.kind === "agent" ? [{ phase: "attempt" as const, step }] : [],
    ),
    ...loop.check.flatMap((step) =>
      step.kind === "agent" ? [{ phase: "check" as const, step }] : [],
    ),
  ];
}

/** Dispatch rules of a loop agent; check agents always start a new conversation. */
export function recipeLoopDispatchRules(
  use: RecipeLoopAgentUse,
): RecipeLoopDispatchRules {
  return use.phase === "attempt"
    ? { phase: "attempt", conversation: use.step.conversation }
    : { phase: "check", conversation: "new" };
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

/** Compiles a check agent's done condition once, with `$response` and the task's references. */
export function recipeLoopDone(
  document: RecipeDocument,
  step: RecipeStep,
  check: RecipeLoopCheckAgent,
  loopPath: RecipeSourcePath,
): RecipeConditionNode | undefined {
  if (check.done === undefined) return undefined;
  let condition = conditions.get(check);
  if (!condition) {
    condition = validateRecipeCondition(check.done, {
      document,
      step,
      loop: [],
      response: true,
      sourcePath: [...loopPath, ...check.path, "done"],
    });
    conditions.set(check, condition);
  }
  return condition;
}

function validateStep(
  document: RecipeDocument,
  task: RecipeStep,
  step: RecipeLoopAttemptStep | RecipeLoopCheckStep,
  phase: RecipeLoopPhaseName,
  sourcePath: RecipeSourcePath,
): void {
  const at = (values: readonly string[], ...path: RecipeSourcePath) => ({
    document,
    step: task,
    loop: values,
    sourcePath: [...sourcePath, ...step.path, ...path],
  });
  if (step.kind === "command") {
    for (const [value, path] of recipeCommandFields(step.command))
      validateRecipeExpression(
        value,
        at(recipeLoopValues.command, "command", ...path),
      );
    return;
  }
  const values = recipeLoopValues[phase];
  validateRecipeExpression(step.brief, at(values, "brief"));
  if ("followUp" in step && step.followUp !== undefined)
    validateRecipeExpression(step.followUp, at(values, "followUp"));
  if ("done" in step) recipeLoopDone(document, task, step, sourcePath);
}

/** Validates the text, commands and done conditions of every loop step. */
export function validateRecipeLoopExpressions(
  document: RecipeDocument,
  step: RecipeStep,
  loop: RecipeDeclarativeLoop,
  sourcePath: RecipeSourcePath,
): void {
  for (const item of loop.attempt)
    validateStep(document, step, item, "attempt", sourcePath);
  for (const item of loop.check)
    validateStep(document, step, item, "check", sourcePath);
}
