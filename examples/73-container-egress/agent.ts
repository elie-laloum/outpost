import {
  createAgent,
  createHarness,
  defineHarnessHook,
} from "@elie-laloum/outpost";
import type { AgentModel, ModelProvider } from "@elie-laloum/outpost";
import { wikipedia } from "./wikipedia.ts";

export function createWikipediaAgent(
  modelProvider: ModelProvider,
  model: AgentModel,
) {
  let attempted = false;
  return createAgent({
    model,
    harness: createHarness({
      modelProvider,
      tools: [wikipedia],
      limits: { maxSteps: 6, maxToolCalls: 2 },
      hooks: [
        defineHarnessHook({
          on: "after-tool",
          run({ call }) {
            if (call.name === wikipedia.name) attempted = true;
          },
        }),
        defineHarnessHook({
          on: "stop",
          run({ text }) {
            if (!attempted)
              return { continue: "Call read_wikipedia before answering." };
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
