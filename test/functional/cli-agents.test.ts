import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { builtInAgentRecord } from "../../src/adapters/agents/catalog.ts";
import { initialize } from "../../src/cli/scaffold.ts";
import { createAgent as composeAgent } from "../../src/domain/agent.ts";
import {
  createAntigravityHarness,
  createCopilotHarness,
  createSandbox,
  dispatch,
  createKimiHarness,
  type AgentEvent,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

const protocolFixtures = builtInAgentRecord((agent) => agent.protocol);

const harnesses = {
  antigravity: createAntigravityHarness,
  copilot: createCopilotHarness,
  kimi: createKimiHarness,
} as const;

function fixture(
  name: keyof typeof harnesses,
  lines: readonly string[],
  status = 0,
) {
  const adapter = composeAgent({ harness: harnesses[name]() });
  return {
    ...adapter,
    capture: false,
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

for (const name of Object.keys(harnesses) as (keyof typeof harnesses)[]) {
  test(`${name} dispatch aggregates a real streamed process without synthetic native files`, async (t) => {
    const root = await repository(t);
    const observed: AgentEvent[] = [];
    const result = await dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      agent: fixture(name, protocolFixtures[name][0]!.lines),
      branch: { mode: "named", name: `${name}-fixture` },
      logging: false,
      brief: { text: "fixture-prompt" },
      observe(event) {
        observed.push(event);
      },
    });
    assert.equal(result.text, "fixture-result");
    assert.equal(result.conversation, "fixture-conversation");
    assert.equal(result.transcript, undefined);
    assert.ok(observed.some((event) => event.kind === "tool"));
    for (const continuation of [
      result.resume,
      ...(name === "kimi" ? [] : [result.fork]),
    ])
      await assert.rejects(
        continuation({ brief: { text: "continue" } }),
        /native conversations|automated fork|missing|incomplete/,
      );
  });
}

test("final-event agents reject truncated or failed turns while keeping the sandbox reusable", async (t) => {
  const root = await repository(t);
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent: composeAgent({ harness: createCopilotHarness() }),
    branch: { mode: "named", name: "cli-agent-errors" },
    logging: false,
  });
  const done = "<outpost>done</outpost>";
  const cases = [
    [
      "copilot",
      [JSON.stringify({ type: "assistant.message", data: { content: done } })],
      0,
      /without a successful final event/,
    ],
    [
      "copilot",
      [JSON.stringify({ type: "result", sessionId: "s", exitCode: 1 })],
      0,
      /exit code 1/,
    ],
    [
      "antigravity",
      [
        JSON.stringify({
          event: "result",
          result: { status: "CANCELED", response: done },
        }),
      ],
      0,
      /status CANCELED/,
    ],
    [
      "kimi",
      [JSON.stringify({ role: "assistant", content: done })],
      3,
      /status 3/,
    ],
  ] as const;
  for (const [name, lines, status, error] of cases)
    await assert.rejects(
      sandbox.dispatch({
        agent: fixture(name, lines, status),
        brief: { text: "go" },
      }),
      error,
    );
  const result = await sandbox.dispatch({
    agent: fixture("kimi", [
      JSON.stringify({ role: "meta", type: "system.version" }),
      JSON.stringify({ role: "assistant", content: done }),
    ]),
    brief: { text: "go" },
  });
  assert.equal(result.completed, true);
  assert.equal(result.text, done);
});

test("new agents scaffold their harness, image installation and declared API keys", async (t) => {
  const root = await repository(t);
  for (const [agent, authentication, declared, model] of [
    ["antigravity", "usage", "GEMINI_API_KEY=\n", undefined],
    ["copilot", "account-token", "COPILOT_GITHUB_TOKEN=\n", undefined],
    ["kimi", "usage", "KIMI_API_KEY=\n", "fixture-model"],
  ] as const) {
    const directory = join(root, agent);
    await initialize({
      directory,
      agent,
      authentication,
      sandboxProvider: "docker",
      build: false,
      ...(model ? { model } : {}),
    });
    assert.match(
      await readFile(join(directory, "run.ts"), "utf8"),
      new RegExp(`harness: create${agent}Harness`, "i"),
    );
    assert.equal(
      await readFile(join(directory, ".env.example"), "utf8"),
      declared,
    );
    const recipe = await readFile(join(directory, "Dockerfile"), "utf8");
    assert.match(recipe, /@github\/copilot@1\.0\.88/);
    assert.match(recipe, /@moonshot-ai\/kimi-code@2\.1\.1/);
    assert.doesNotMatch(recipe, /gemini-cli/);
    assert.match(recipe, /antigravity-cli\/1\.2\.12-/);
    assert.match(recipe, /sha512sum/);
    assert.match(recipe, /ENV AGY_CLI_DISABLE_AUTO_UPDATE=true/);
    assert.doesNotMatch(recipe, /install\.sh/);
    assert.match(recipe, /^ENV XDG_CACHE_HOME=\/tmp\/\.cache$/m);
  }
});
