import { invariant } from "./errors.ts";
import { harnessHooks } from "./hook.ts";
import { hookCommand } from "./hook-command.ts";
import { AGENT_PROFILE_HOOK_FIELDS } from "./agent-profile.constants.ts";
import type { NativeHook } from "./agent-hook.types.ts";
import type { AgentProfileHooks } from "./agent-profile.types.ts";

export function profileHooks(value: AgentProfileHooks): AgentProfileHooks {
  invariant(
    value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).every((key) => AGENT_PROFILE_HOOK_FIELDS.has(key)),
    "Profile hooks accept claude, codex, copilot, kimi, antigravity and outpost sections",
  );
  return Object.freeze({
    ...(value.claude === undefined
      ? {}
      : { claude: declarations("claude", value.claude) }),
    ...(value.codex === undefined
      ? {}
      : { codex: declarations("codex", value.codex) }),
    ...(value.copilot === undefined
      ? {}
      : { copilot: declarations("copilot", value.copilot) }),
    ...(value.kimi === undefined
      ? {}
      : { kimi: declarations("kimi", value.kimi) }),
    ...(value.antigravity === undefined
      ? {}
      : { antigravity: declarations("antigravity", value.antigravity) }),
    ...(value.outpost === undefined
      ? {}
      : { outpost: harnessHooks(value.outpost) }),
  });
}

function declarations<Agent extends string>(
  agent: Agent,
  hooks: readonly NativeHook<Agent>[],
): readonly NativeHook<Agent>[] {
  invariant(
    Array.isArray(hooks) &&
      hooks.every(
        (hook) =>
          hook !== null &&
          typeof hook === "object" &&
          hook.kind === "native-hook" &&
          hook.agent === agent &&
          typeof hook.on === "string" &&
          typeof hook.run === "function" &&
          typeof hook.name === "string" &&
          hook.name.trim().length > 0 &&
          Number.isFinite(hook.timeoutMs) &&
          hook.timeoutMs > 0 &&
          hook.timeoutMs <= 600_000 &&
          (hook.matcher === undefined || typeof hook.matcher === "string"),
      ),
    `Declare profile ${agent} hooks with its own hook factory`,
  );
  return Object.freeze(
    hooks.map((hook) =>
      Object.freeze({
        ...hook,
        ...(hook.command === undefined
          ? {}
          : { command: hookCommand(hook.command) }),
      }),
    ),
  );
}
