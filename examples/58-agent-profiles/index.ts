import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import {
  createAgent,
  createAntigravityHarness,
  createClaudeHarness,
  createCodexHarness,
  createCopilotHarness,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createKimiHarness,
  dispatch,
  OutpostError,
  type ModelProvider,
} from "@elie-laloum/outpost";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
import { demoRepository } from "../shared/repository.ts";
import { profile, restricted } from "./profile.ts";

const repository = demoRepository(import.meta.dirname);
for (const harness of [
  createClaudeHarness,
  createCodexHarness,
  createCopilotHarness,
  createKimiHarness,
  createAntigravityHarness,
]) {
  const agent = createAgent({ harness: harness({ profile }) });
  console.log(
    "Projected shared profile:",
    agent.name,
    agent.request({ text: "Read the notes." }).executable,
  );
}
assert.throws(
  () => createAgent({ harness: createCodexHarness({ profile: restricted }) }),
  (error) => error instanceof OutpostError && error.code === "configuration",
);
console.log("Codex refuses the restricted allowlist explicitly.");

let step = 0;
const modelProvider: ModelProvider = {
  name: "offline",
  async request(request) {
    assert.ok(request.system?.includes(profile.instructions!));
    assert.ok(
      request.tools?.some((tool) => tool.name === "mcp__docs__read_note"),
    );
    assert.ok(
      !request.tools?.some((tool) => tool.name === "mcp__docs__delete_note"),
    );
    const received =
      request.messages
        ?.at(-1)
        ?.content.filter((block) => block.type === "tool-result") ?? [];
    if (step === 1) assert.match(received[0]?.content ?? "", /Generated files/);
    if (step === 2) {
      assert.equal(received[0]?.isError, true);
      assert.match(received[0]?.content ?? "", /Denied/);
    }
    const calls = [
      { name: "mcp__docs__read_note", input: {} },
      {
        name: "write_file",
        input: { path: "generated.txt", content: "forbidden" },
      },
    ];
    const next = calls[step++];
    if (next)
      return {
        text: "",
        stopReason: "tool-calls",
        content: [{ type: "tool-call", id: `call-${step}`, ...next }],
      };
    return {
      text: "Read the note; refused the generated file edit.\n<outpost>done</outpost>",
    };
  },
};
const result = await dispatch({
  repository,
  sandboxProvider: createLocalSandboxProvider(),
  agent: createAgent({
    model: "offline",
    harness: createHarness({
      profile: restricted,
      modelProvider,
      tools: [createHarnessFileTools(), createHarnessEditTools()],
    }),
  }),
  brief: { text: "Read the note, then try to create generated.txt." },
  logging: false,
});
assert.equal(result.completed, true);
await assert.rejects(stat(join(repository, "generated.txt")), {
  code: "ENOENT",
});
console.log(result.text);
