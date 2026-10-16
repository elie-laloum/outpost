import { randomUUID } from "node:crypto";
import type { AgentHookPlan } from "../../../domain/agent-hook.types.ts";
import { installHookConfiguration } from "../../../infrastructure/hook-configuration.ts";
import { nativeHooks } from "../native-hooks.ts";
import type { KimiHook } from "./kimi-hooks.types.ts";

export function kimiHookPlan(value: readonly KimiHook[]): AgentHookPlan {
  const handlers = nativeHooks("kimi", value);
  return {
    handlers,
    async prepare(sandbox, commands, signal) {
      const marker = randomUUID();
      const content =
        `\n# Outpost hooks ${marker}\n` +
        handlers
          .map((hook, index) =>
            [
              "[[hooks]]",
              `event = ${JSON.stringify(hook.on)}`,
              `command = ${JSON.stringify(commands[index])}`,
              `timeout = ${Math.ceil(hook.timeoutMs / 1000)}`,
              ...(hook.matcher === undefined
                ? []
                : [`matcher = ${JSON.stringify(hook.matcher)}`]),
            ].join("\n"),
          )
          .join("\n") +
        `\n# End Outpost hooks ${marker}\n`;
      const close = await installHookConfiguration(
        sandbox,
        {
          kind: "append",
          path: ".kimi-code/config.toml",
          content,
          rejectPattern: `^\\s*(?:hooks|"hooks"|'hooks')\\s*=`,
        },
        signal,
      );
      return { command: (command) => command, close };
    },
  };
}
