import { conversationFormat, isConversationStore } from "./conversation.ts";
import { agentProfile, profileMcpServers } from "./agent-profile.ts";
import { invariant, positive } from "./errors.ts";
import {
  HARNESS_DEFAULTS,
  HARNESS_FIELDS,
  USAGE_FIELDS,
} from "./harness.constants.ts";
import type {
  Harness,
  HarnessOptions,
  HarnessLimits,
  HarnessToolExecution,
  ResolvedHarnessLimits,
} from "./harness.types.ts";
import { harnessHooks } from "./hook.ts";
import { mcpLoginServers, mcpServers } from "./mcp-server.ts";
import {
  defineHarnessInstructions,
  harnessInstructions,
} from "./instructions.ts";
import { harnessSkills, skillCatalog, skillLoader } from "./skill.ts";
import { harnessTools } from "./tool.ts";
import { defineHarnessModelRouting } from "./harness-routing.ts";

export function createHarness(options: HarnessOptions): Harness {
  invariant(
    options !== null && typeof options === "object",
    "Harness options must be an object",
  );
  invariant(
    !("run" in options),
    "createHarness() no longer accepts run; declare tools, instructions and limits",
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
      isConversationStore(options.conversations),
    "Harness conversations must be a conversation store or false",
  );
  if (options.conversations)
    conversationFormat("Harness", options.conversations, "harness");
  const profile = agentProfile(options.profile);
  const servers = profileMcpServers(profile, options.mcpServers);
  const skills = harnessSkills(options.skills);
  invariant(
    options.routing === undefined || options.routing?.kind === "model-routing",
    "Declare routing with defineHarnessModelRouting",
  );
  const routing = (() => {
    if (!options.routing) return undefined;
    const { kind: _kind, ...settings } = options.routing;
    const declared = defineHarnessModelRouting(settings);
    for (const model of Object.values(declared.models))
      options.modelProvider.validate?.(model);
    return declared;
  })();
  return Object.freeze({
    kind: "custom",
    ...(profile === undefined ? {} : { profile }),
    ...(routing ? { routing } : {}),
    modelProvider: options.modelProvider,
    instructions: Object.freeze([
      ...harnessInstructions(profile?.instructions),
      ...harnessInstructions(options.instructions),
      ...(skills.length
        ? [defineHarnessInstructions(skillCatalog(skills))]
        : []),
    ]),
    tools: harnessTools([
      ...(options.tools ?? []),
      ...skills.flatMap((skill) => skill.tools),
      ...(skills.length ? [skillLoader(skills)] : []),
    ]),
    skills,
    limits: limits(options.limits ?? {}),
    toolExecution: toolExecution(options.toolExecution ?? {}),
    hooks: harnessHooks(options.hooks),
    ...(options.permissions ? { permissions: options.permissions } : {}),
    ...(options.context ? { context: options.context } : {}),
    ...(options.conversations === undefined
      ? {}
      : { conversations: options.conversations }),
    cache: options.cache ?? HARNESS_DEFAULTS.cache,
    ...(servers === undefined
      ? {}
      : { mcpServers: harnessMcpServers(servers) }),
  });
}

function limits(value: HarnessLimits): ResolvedHarnessLimits {
  invariant(
    value !== null && typeof value === "object",
    "Harness limits must be an object",
  );
  if (value.maxDelegationDepth !== undefined)
    invariant(
      Number.isSafeInteger(value.maxDelegationDepth) &&
        value.maxDelegationDepth >= 0,
      "Harness maxDelegationDepth must be a nonnegative integer",
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
    ...(value.maxDelegationDepth === undefined
      ? {}
      : { maxDelegationDepth: value.maxDelegationDepth }),
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

function harnessMcpServers(value: unknown) {
  const servers = mcpServers(value);
  const logins = mcpLoginServers(servers).map(([name]) => name);
  invariant(
    logins.length === 0,
    `The built-in harness cannot reuse a CLI OAuth login for MCP server ${logins.join(", ")}`,
  );
  return servers;
}
