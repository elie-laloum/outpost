import { agent as composeAgent } from "../../src/domain/agent.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import {
  createSandbox,
  dispatch,
  geminiHarness,
  response,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { initialize } from "../../src/cli/scaffold.ts";
import { repository } from "../helpers.ts";
import { protocolFixtures } from "../../src/adapters/agents/protocol-fixtures.constants.ts";
import type { AgentEvent } from "../../src/index.ts";

function fixture(lines: readonly string[], status = 0) {
  const adapter = composeAgent({ harness: geminiHarness({}) });
  return {
    ...adapter,
    request: () => ({
      executable: process.execPath,
      arguments: [
        "--input-type=module",
        "-e",
        `for (const line of ${JSON.stringify(lines)}) { process.stdout.write(line.slice(0, 12)); await new Promise(resolve => setTimeout(resolve, 1)); process.stdout.write(line.slice(12) + "\\n"); } process.exitCode = ${status};`,
      ],
    }),
  };
}

test("Gemini dispatch aggregates a real streamed process, preserves observation and rejects native resume/fork", async (t) => {
  const root = await repository(t);
  const observed: AgentEvent[] = [];
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: fixture(protocolFixtures.gemini[0]!.lines),
    branch: { mode: "named", name: "gemini-fixture" },
    logging: false,
    brief: { text: "fixture-prompt" },
    observe(event) {
      observed.push(event);
    },
  });
  assert.equal(result.text, "fixture-result");
  assert.deepEqual(result.usage, { input: 10, cached: 2, output: 3 });
  assert.equal(result.conversation, "fixture-conversation");
  assert.equal(result.transcript, undefined);
  assert.ok(observed.some((event) => event.kind === "tool"));
  assert.ok(observed.some((event) => event.kind === "finished"));
  for (const continuation of [result.resume, result.fork])
    await assert.rejects(
      continuation({ brief: { text: "continue" } }),
      /does not support continuation or fork/,
    );
});

test("Gemini rejects truncated output, protocol failure and nonzero exit while preserving warm sandbox reuse", async (t) => {
  const root = await repository(t);
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: composeAgent({ harness: geminiHarness({}) }),
    branch: { mode: "named", name: "gemini-errors" },
    logging: false,
  });
  const success = JSON.stringify({ type: "result", status: "success" });
  const text = JSON.stringify({
    type: "message",
    role: "assistant",
    content: "<outpost>done</outpost>",
  });
  for (const [lines, status, error] of [
    [[text], 0, /without a successful final event/],
    [[text, success], 42, /status 42/],
    [
      [
        text,
        JSON.stringify({
          type: "result",
          status: "error",
          error: { message: "model failed" },
        }),
      ],
      0,
      /model failed/,
    ],
    [
      [
        JSON.stringify({
          type: "error",
          severity: "error",
          message: "stream failed",
        }),
        success,
      ],
      0,
      /stream failed/,
    ],
  ] as const)
    await assert.rejects(
      sandbox.dispatch({
        agent: fixture(lines, status),
        brief: { text: "go" },
      }),
      error,
    );
  const result = await sandbox.dispatch({
    agent: fixture([
      JSON.stringify({
        type: "error",
        severity: "warning",
        message: "retrying",
      }),
      JSON.stringify({
        type: "tool_result",
        status: "error",
        tool_id: "call",
        error: { message: "tool failed" },
      }),
      text,
      success,
    ]),
    brief: { text: "go" },
    observe() {
      throw new Error("observer failed");
    },
  });
  assert.equal(result.completed, true);
  assert.equal(result.text, "<outpost>done</outpost>");
  await assert.rejects(
    sandbox.dispatch({
      brief: { text: "Return <answer>text</answer>" },
      response: response.text({ tag: "answer", repairs: 1 }),
    }),
    /supports continuation/,
  );
});

test("Gemini scaffolding selects its adapter, API key declaration and pinned image installation", async (t) => {
  const root = await repository(t);
  for (const sandboxProvider of [
    "docker",
    "podman",
    "local",
    "vercel",
    "daytona",
  ] as const) {
    const directory = join(root, sandboxProvider);
    await initialize({ directory, agent: "gemini", sandboxProvider });
    assert.match(
      await readFile(join(directory, "run.ts"), "utf8"),
      /harness: geminiHarness/,
    );
    assert.equal(
      await readFile(join(directory, ".env.example"), "utf8"),
      "GEMINI_API_KEY=\n",
    );
    if (sandboxProvider === "docker" || sandboxProvider === "podman")
      assert.match(
        await readFile(
          join(
            directory,
            sandboxProvider === "docker" ? "Dockerfile" : "Containerfile",
          ),
          "utf8",
        ),
        /@google\/gemini-cli@0\.61\.0/,
      );
  }
});

test("Gemini completion markers wait for the authoritative final event before the settle timer", async (t) => {
  const root = await repository(t);
  const agent = composeAgent({ harness: geminiHarness({}) });
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    logging: false,
    branch: { mode: "named", name: "gemini-final" },
    agent: {
      ...agent,
      request: () => ({
        executable: process.execPath,
        arguments: [
          "-e",
          `console.log(JSON.stringify({type:"message",role:"assistant",content:"<outpost>done</outpost>"})); setTimeout(() => console.log(JSON.stringify({type:"result",status:"success",stats:{input_tokens:4,output_tokens:2,cached:1}})), 100);`,
        ],
      }),
    },
    brief: { text: "go" },
    settleMs: 10,
  });
  assert.equal(result.completed, true);
  assert.deepEqual(result.usage, { input: 4, output: 2, cached: 1 });
});
