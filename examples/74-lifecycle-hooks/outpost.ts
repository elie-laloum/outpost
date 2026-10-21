import assert from "node:assert/strict";
import { createAgent } from "@elie-laloum/outpost/core";
import {
  createHarness,
  createHarnessFileTools,
  defineHarnessHook,
  defineHarnessPermissions,
} from "@elie-laloum/outpost/harness";
import type { ModelProvider } from "@elie-laloum/outpost/harness";

import { profile } from "./profile.ts";

export function createOfflineAgent() {
  let requests = 0;
  const modelProvider: ModelProvider = {
    name: "lifecycle-demo",
    async request(request) {
      assert.match(request.system ?? "", /Explain only the supplied notes/);
      assert.match(
        JSON.stringify(request.messages),
        /Read README.md before answering/,
      );
      const usage = { input: 10, cached: 0, output: 5 };
      if (requests++ === 0)
        return {
          text: "",
          stopReason: "tool-calls",
          content: [
            {
              type: "tool-call",
              id: "read-notes",
              name: "read_file",
              input: { path: "README.md" },
            },
          ],
          usage,
        };
      assert.equal(requests, 2);
      const blocks = request.messages?.at(-1)?.content ?? [];
      assert.ok(
        blocks.some(
          (block) =>
            block.type === "tool-result" &&
            !block.isError &&
            block.content.includes("Lifecycle example notes"),
        ),
      );
      return {
        text: "DRAFT: hooks observe and transform an agent turn.\n<outpost>done</outpost>",
        stopReason: "end",
        usage,
      };
    },
  };

  return createAgent({
    model: "offline",
    harness: createHarness({
      modelProvider,
      profile,
      tools: [createHarnessFileTools()],
      permissions: defineHarnessPermissions({
        default: "deny",
        rules: [
          { effect: "allow", tools: ["read_file"], paths: ["README.md"] },
        ],
      }),
      limits: { maxSteps: 3, maxToolCalls: 1 },
      hooks: [
        defineHarnessHook({
          on: "before-model",
          run({ system }) {
            return {
              system: `${system ?? ""}\nExplain only the supplied notes.`,
            };
          },
        }),
        defineHarnessHook({
          on: "after-model",
          run({ result }) {
            if (result.text.startsWith("DRAFT:"))
              return {
                result: { text: result.text.replace("DRAFT:", "Reviewed:") },
              };
          },
        }),
        defineHarnessHook({
          on: "before-tool",
          run({ call }) {
            console.log(`[before-tool] ${call.name}`);
            if (call.name !== "read_file")
              return { deny: "This example only reads notes." };
          },
        }),
        defineHarnessHook({
          on: "after-tool",
          run({ call, status }) {
            console.log(`[after-tool] ${call.name}: ${status}`);
          },
        }),
        defineHarnessHook({
          on: "stop",
          run() {
            console.log("[stop] Answer ready.");
          },
        }),
        defineHarnessHook({
          on: "run-end",
          run({ reason }) {
            console.log(`[run-end] ${reason}`);
          },
        }),
      ],
    }),
  });
}
