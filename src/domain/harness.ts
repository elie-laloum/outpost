import type { ConversationStore } from "./conversation.types.ts";
import { invariant, positive } from "./errors.ts";
import {
  HARNESS_DEFAULTS,
  HARNESS_FIELDS,
  USAGE_FIELDS,
} from "./harness.constants.ts";
import type {
  CustomHarness,
  CustomHarnessOptions,
  HarnessLimits,
  HarnessToolExecution,
  ResolvedHarnessLimits,
} from "./harness.types.ts";
import { harnessHooks } from "./hook.ts";
import { harnessInstructions } from "./instructions.ts";
import { harnessTools } from "./tool.ts";

export function harness(options: CustomHarnessOptions): CustomHarness {
  invariant(
    options !== null && typeof options === "object",
    "Harness options must be an object",
  );
  invariant(
    !("run" in options),
    "harness() no longer accepts run; declare tools, instructions and limits",
  );
  const unsupported = Object.keys(options).filter(
    (key) => !HARNESS_FIELDS.has(key),
  );
  invariant(
    unsupported.length === 0,
    `Unsupported harness option: ${unsupported.join(", ")}`,
  );
  invariant(
    typeof options.modelProvider?.request === "function",
    "Custom harness requires a model provider",
  );
  invariant(
    options.modelProvider.validate === undefined ||
      typeof options.modelProvider.validate === "function",
    "Model provider validate must be a function",
  );
  invariant(
    options.cache === undefined || typeof options.cache === "boolean",
    "Harness cache must be boolean",
  );
  invariant(
    options.permissions === undefined ||
      options.permissions?.kind === "permissions",
    "Declare permissions with defineHarnessPermissions",
  );
  invariant(
    options.context === undefined || options.context?.kind === "context",
    "Declare context strategies with defineHarnessContextStrategy",
  );
  invariant(
    options.conversations === undefined ||
      options.conversations === false ||
      conversationStore(options.conversations),
    "Harness conversations must be a conversation store or false",
  );
  return Object.freeze({
    kind: "custom",
    modelProvider: options.modelProvider,
    instructions: harnessInstructions(options.instructions),
    tools: harnessTools(options.tools ?? []),
    limits: limits(options.limits ?? {}),
    toolExecution: toolExecution(options.toolExecution ?? {}),
    hooks: harnessHooks(options.hooks),
    ...(options.permissions ? { permissions: options.permissions } : {}),
    ...(options.context ? { context: options.context } : {}),
    ...(options.conversations === undefined
      ? {}
      : { conversations: options.conversations }),
    cache: options.cache ?? HARNESS_DEFAULTS.cache,
  });
}

function limits(value: HarnessLimits): ResolvedHarnessLimits {
  invariant(
    value !== null && typeof value === "object",
    "Harness limits must be an object",
  );
  const maxSteps = positive(
    value.maxSteps ?? HARNESS_DEFAULTS.maxSteps,
    "Harness maxSteps",
  );
  if (value.maxToolCalls !== undefined)
    positive(value.maxToolCalls, "Harness maxToolCalls");
  if (value.usage !== undefined) {
    invariant(
      value.usage !== null &&
        typeof value.usage === "object" &&
        Object.keys(value.usage).every((key) => USAGE_FIELDS.includes(key)),
      "Harness usage limits accept input, cached, cacheCreated and output",
    );
    for (const limit of Object.values(value.usage))
      invariant(
        Number.isSafeInteger(limit) && limit >= 0,
        "Harness usage limits must be nonnegative integers",
      );
  }
  return Object.freeze({
    maxSteps,
    ...(value.maxToolCalls === undefined
      ? {}
      : { maxToolCalls: value.maxToolCalls }),
    ...(value.usage === undefined
      ? {}
      : { usage: Object.freeze({ ...value.usage }) }),
  });
}

function toolExecution(
  value: HarnessToolExecution,
): Required<HarnessToolExecution> {
  invariant(
    value !== null && typeof value === "object",
    "Harness toolExecution must be an object",
  );
  invariant(
    value.onError === undefined ||
      value.onError === "return-to-model" ||
      value.onError === "fail",
    'Tool onError must be "return-to-model" or "fail"',
  );
  return Object.freeze({
    concurrency: positive(
      value.concurrency ?? HARNESS_DEFAULTS.concurrency,
      "Tool concurrency",
    ),
    deadlineMs: positive(
      value.deadlineMs ?? HARNESS_DEFAULTS.toolDeadlineMs,
      "Tool deadlineMs",
    ),
    onError: value.onError ?? HARNESS_DEFAULTS.onError,
  });
}

function conversationStore(value: ConversationStore): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.locate === "function" &&
    typeof value.capture === "function" &&
    typeof value.restore === "function"
  );
}
