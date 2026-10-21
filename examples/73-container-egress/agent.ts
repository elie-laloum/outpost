import { createAgent } from "@elie-laloum/outpost/core";
import {
  createHarness,
  createHarnessShellTools,
  defineHarnessHook,
} from "@elie-laloum/outpost/harness";
import type { AgentModel } from "@elie-laloum/outpost/core";
import type { ModelProvider } from "@elie-laloum/outpost/harness";

export function createWikipediaAgent(
  modelProvider: ModelProvider,
  model: AgentModel,
) {
  let attempted = false;
  return createAgent({
    model,
    harness: createHarness({
      modelProvider,
      tools: [createHarnessShellTools({ deadlineMs: 15_000 })],
      limits: { maxSteps: 6, maxToolCalls: 2 },
      hooks: [
        defineHarnessHook({
          on: "after-tool",
          run({ call }) {
            if (call.name === "shell") attempted = true;
          },
        }),
        defineHarnessHook({
          on: "stop",
          run({ text }) {
            if (!attempted)
              return {
                continue:
                  "Use shell to run a Node.js fetch of Wikipedia before answering.",
              };
            const summary = text.match(/<resume>([\s\S]*?)<\/resume>/)?.[1];
            const lines = summary?.trim().split(/\r?\n/);
            if (lines?.length !== 2 || lines.some((line) => !line.trim()))
              return {
                continue: "Return exactly two nonempty lines inside <resume>.",
              };
          },
        }),
      ],
    }),
  });
}
