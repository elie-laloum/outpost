import { invariant } from "../../../domain/errors.ts";
import type { AgentHookPlan } from "../../../domain/agent-hook.types.ts";
import { nativeHooks } from "../native-hooks.ts";
import { hookGroups } from "../hook-groups.ts";
import type { ClaudeHook } from "./claude-hooks.types.ts";
import type { ClaudeSettings } from "../settings.types.ts";
import { claudeProfileScript } from "./claude-profile.ts";
import { claudeGuardedHook } from "./claude-hook-plan.constants.ts";

export function claudeHookPlan(
  value: readonly ClaudeHook[],
  settings: ClaudeSettings = {},
): AgentHookPlan {
  const handlers = nativeHooks("claude", value);
  return {
    handlers,
    async prepare(_sandbox, commands) {
      const guarded = commands.map((command, index) => {
        if (
          settings.profile?.allowedTools === undefined ||
          handlers[index]?.on !== "PreToolUse"
        )
          return command;
        const source = claudeGuardedHook.replace(
          "CONFIG",
          JSON.stringify({
            command,
            guard: claudeProfileScript(settings),
            timeoutMs: handlers[index]!.timeoutMs,
          }),
        );
        return `node -e "eval(Buffer.from('${Buffer.from(source).toString("base64")}','base64').toString())"`;
      });
      const hooks = hookGroups(handlers, guarded);
      return {
        command(command) {
          const args = [...(command.arguments ?? [])];
          const index = args.indexOf("--settings");
          const parsed: unknown = index < 0 ? {} : JSON.parse(args[index + 1]!);
          invariant(
            parsed !== null &&
              typeof parsed === "object" &&
              !Array.isArray(parsed),
            "Claude inline settings must be an object",
          );
          const existing = Object.fromEntries(Object.entries(parsed));
          const previous: unknown = existing.hooks;
          invariant(
            previous === undefined ||
              (previous !== null &&
                typeof previous === "object" &&
                !Array.isArray(previous)),
            "Claude inline hooks must be an object",
          );
          const combined: Record<string, unknown[]> = {};
          for (const [phase, entries] of Object.entries(previous ?? {})) {
            invariant(
              Array.isArray(entries),
              "Claude hook event declarations must be arrays",
            );
            combined[phase] = entries;
          }
          for (const [phase, entries] of Object.entries(hooks))
            combined[phase] = [...(combined[phase] ?? []), ...entries];
          if (index >= 0) args.splice(index, 2);
          return {
            ...command,
            arguments: [
              "--settings",
              JSON.stringify({ ...existing, hooks: combined }),
              ...args,
            ],
          };
        },
        close: async () => undefined,
      };
    },
  };
}
