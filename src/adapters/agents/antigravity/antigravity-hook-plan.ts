import { randomUUID } from "node:crypto";
import type { AgentHookPlan } from "../../../domain/agent-hook.types.ts";
import { installHookConfiguration } from "../../../infrastructure/hook-configuration.ts";
import { nativeHooks } from "../native-hooks.ts";
import { hookGroups } from "../hook-groups.ts";
import type { AntigravityHook } from "./antigravity-hooks.types.ts";

export function antigravityHookPlan(
  value: readonly AntigravityHook[],
): AgentHookPlan {
  const handlers = nativeHooks("antigravity", value);
  return {
    handlers,
    async prepare(sandbox, commands, signal) {
      const hooks = hookGroups(handlers, commands);
      for (const phase of [
        "SessionStart",
        "PreInvocation",
        "PostInvocation",
        "Stop",
      ]) {
        const entries = handlers.flatMap((hook, index) =>
          hook.on === phase
            ? [
                {
                  type: "command",
                  command: commands[index],
                  timeout: Math.ceil(hook.timeoutMs / 1000),
                },
              ]
            : [],
        );
        if (entries.length) hooks[phase] = entries;
      }
      const close = await installHookConfiguration(
        sandbox,
        {
          kind: "entry",
          path: ".gemini/config/hooks.json",
          key: `outpost-${randomUUID()}`,
          value: hooks,
        },
        signal,
      );
      return { command: (command) => command, close };
    },
  };
}
