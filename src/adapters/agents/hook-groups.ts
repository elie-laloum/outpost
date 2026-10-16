import type { AgentHookHandler } from "../../domain/agent-hook.types.ts";

export function hookGroups(
  handlers: readonly AgentHookHandler[],
  commands: readonly string[],
): Record<string, unknown[]> {
  const groups: Record<string, unknown[]> = {};
  handlers.forEach((hook, index) => {
    (groups[hook.on] ??= []).push({
      ...(hook.matcher === undefined ? {} : { matcher: hook.matcher }),
      hooks: [
        {
          type: "command",
          command: commands[index],
          timeout: Math.ceil(hook.timeoutMs / 1000),
        },
      ],
    });
  });
  return groups;
}
