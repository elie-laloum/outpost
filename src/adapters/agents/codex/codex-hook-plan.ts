import { createHash } from "node:crypto";
import type { AgentHookPlan } from "../../../domain/agent-hook.types.ts";
import { nativeHooks } from "../native-hooks.ts";
import type { CodexHook } from "./codex-hooks.types.ts";

function toml(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(toml).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .map(([key, entry]) => `${JSON.stringify(key)}=${toml(entry)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b, "en"))
        .map(([key, entry]) => [key, canonical(entry)]),
    );
  return value;
}

export function codexHookPlan(value: readonly CodexHook[]): AgentHookPlan {
  const handlers = nativeHooks("codex", value);
  return {
    handlers,
    async prepare(_sandbox, commands) {
      const groups: Record<string, unknown[]> = {};
      const state: Record<string, unknown> = {};
      handlers.forEach((hook, index) => {
        const label = hook.on.replace(
          /[A-Z]/g,
          (letter, index: number) =>
            `${index ? "_" : ""}${letter.toLowerCase()}`,
        );
        const timeout =
          hook.on === "SessionEnd" || hook.on === "Interrupt"
            ? Math.min(3, Math.ceil(hook.timeoutMs / 1000))
            : Math.ceil(hook.timeoutMs / 1000);
        const matcher = ["Stop", "UserPromptSubmit", "Interrupt"].includes(
          hook.on,
        )
          ? undefined
          : hook.matcher;
        const group = {
          ...(matcher === undefined ? {} : { matcher }),
          hooks: [
            {
              type: "command",
              command: commands[index],
              timeout,
              async: false,
            },
          ],
        };
        const siblings = (groups[hook.on] ??= []);
        const hash = `sha256:${createHash("sha256")
          .update(JSON.stringify(canonical({ event_name: label, ...group })))
          .digest("hex")}`;
        for (const source of [
          "/<session-flags>/config.toml",
          "C:\\<session-flags>\\config.toml",
        ])
          state[`${source}:${label}:${siblings.length}:0`] = {
            trusted_hash: hash,
            enabled: true,
          };
        siblings.push(group);
      });
      const args = Object.entries({ ...groups, state }).flatMap(
        ([key, value]) => ["-c", `hooks.${key}=${toml(value)}`],
      );
      return {
        command: (command) => ({
          ...command,
          arguments: [...args, ...(command.arguments ?? [])],
        }),
        close: async () => undefined,
      };
    },
  };
}
