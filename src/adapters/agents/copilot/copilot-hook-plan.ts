import { randomUUID } from "node:crypto";
import type { AgentHookPlan } from "../../../domain/agent-hook.types.ts";
import { installHookConfiguration } from "../../../infrastructure/hook-configuration.ts";
import { nativeHooks } from "../native-hooks.ts";
import type { CopilotHook } from "./copilot-hooks.types.ts";

export function copilotHookPlan(value: readonly CopilotHook[]): AgentHookPlan {
  const handlers = nativeHooks("copilot", value);
  return {
    handlers,
    async prepare(sandbox, commands, signal) {
      const hooks: Record<string, unknown[]> = {};
      handlers.forEach((hook, index) =>
        (hooks[hook.on] ??= []).push({
          type: "command",
          bash: commands[index],
          powershell: commands[index],
          timeoutSec: Math.ceil(hook.timeoutMs / 1000),
          ...(hook.matcher === undefined ? {} : { matcher: hook.matcher }),
        }),
      );
      const close = await installHookConfiguration(
        sandbox,
        {
          kind: "exclusive",
          path: `.copilot/hooks/outpost-${randomUUID()}.json`,
          content: JSON.stringify({ version: 1, hooks }),
        },
        signal,
      );
      return { command: (command) => command, close };
    },
  };
}
