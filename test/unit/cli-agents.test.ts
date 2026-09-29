import { builtInAgents } from "../../src/adapters/agents/catalog.ts";
import { agentVersions } from "../../src/providers/versions.constants.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { createAgent as composeAgent } from "../../src/domain/agent.ts";
import {
  createAntigravityHarness,
  createClaudeHarness,
  createCopilotHarness,
  createKimiHarness,
} from "../../src/index.ts";
import { prepareAdapter } from "../../src/application/agent-bootstrap.ts";
import { diagnoseAgentCli } from "../../src/application/doctor-agent.ts";
import { doctorAgents } from "../../src/application/doctor-agent.constants.ts";
import { decodeLine } from "../../src/adapters/agents/event-decoder.ts";
import type { Command } from "../../src/domain/command.types.ts";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";

const decoder = (
  harness: typeof createAntigravityHarness | typeof createCopilotHarness,
) => {
  const agent = composeAgent({ harness: harness({}) });
  return (value: unknown) => agent.events(JSON.stringify(value));
};

test("event decoding selects handlers by the protocol discriminant", () => {
  const handlers = {
    assistant: () => [{ kind: "text", text: "role" } as const],
  };
  assert.deepEqual(decodeLine('{"role":"assistant"}', handlers, "role"), [
    { kind: "text", text: "role" },
  ]);
  assert.deepEqual(decodeLine('{"type":"assistant"}', handlers, "role"), [
    { kind: "raw", value: { type: "assistant" } },
  ]);
  assert.deepEqual(decodeLine('{"type":"assistant"}', handlers), [
    { kind: "text", text: "role" },
  ]);
});

test("CLI adapters declare independent continuation and capture capabilities", () => {
  const expectations = [
    [
      createAntigravityHarness,
      "antigravity",
      "AGY_CLI_DISABLE_AUTO_UPDATE",
      "true",
    ],
    [createCopilotHarness, "copilot", "COPILOT_AUTO_UPDATE", "false"],
    [createKimiHarness, "kimi", "KIMI_CODE_NO_AUTO_UPDATE", "1"],
  ] as const;
  for (const [harness, name, variable, value] of expectations) {
    const variables = { CUSTOM: "fixture" };
    const agent = composeAgent({ harness: harness({ variables }) });
    variables.CUSTOM = "changed";
    assert.equal(agent.name, name);
    assert.equal(agent.variables?.[variable], value);
    assert.equal(agent.variables?.CUSTOM, "fixture");
    assert.equal(agent.resumable, true);
    assert.equal(agent.forkable, name === "kimi");
    assert.equal(agent.capture, name === "antigravity" ? false : undefined);
    assert.equal(
      agent.conversations,
      name === "antigravity" ? undefined : name,
    );
    assert.ok(Object.isFrozen(agent));
    assert.equal(
      composeAgent({
        harness: harness({ variables: { [variable]: "override" } }),
      }).variables?.[variable],
      "override",
    );
    assert.ok(
      agent
        .request({ continuation: { id: "session" } })
        .arguments?.includes("session"),
    );
    assert.throws(
      () => agent.request({ continuation: { id: "session", fork: true } }),
      /automated fork|fork preparation/,
    );
    assert.throws(
      () => agent.request({ continuation: { id: "../bad" } }),
      /Invalid conversation/,
    );
  }
  assert.equal(
    composeAgent({ harness: createAntigravityHarness() }).requiresFinishedEvent,
    true,
  );
  assert.equal(
    composeAgent({ harness: createCopilotHarness() }).requiresFinishedEvent,
    true,
  );
  assert.equal(
    composeAgent({ harness: createKimiHarness() }).requiresFinishedEvent,
    undefined,
  );
});

test("Antigravity sends prompts as stream-json input and preserves interactive modes", () => {
  const agent = composeAgent({
    harness: createAntigravityHarness(),
    model: "fixture-model",
  });
  assert.deepEqual(agent.request({ text: "-literal\nsecond line" }), {
    executable: "agy",
    variables: { AGY_CLI_DISABLE_AUTO_UPDATE: "true" },
    arguments: [
      "--model",
      "fixture-model",
      "--dangerously-skip-permissions",
      "--input-format",
      "stream-json",
      "--output-format",
      "stream-json",
    ],
    stdin: `${JSON.stringify({ event: "user", message: { content: "-literal\nsecond line" } })}\n`,
  });
  assert.deepEqual(
    composeAgent({
      harness: createAntigravityHarness({ mode: "plan" }),
    }).request({}).arguments,
    [
      "--mode",
      "plan",
      "--input-format",
      "stream-json",
      "--output-format",
      "stream-json",
    ],
  );
  assert.deepEqual(
    composeAgent({ harness: createAntigravityHarness() }).request({
      interactive: true,
      text: "Inspect",
    }),
    {
      executable: "agy",
      variables: { AGY_CLI_DISABLE_AUTO_UPDATE: "true" },
      arguments: ["--prompt-interactive", "Inspect"],
      interactive: true,
    },
  );
  assert.deepEqual(
    composeAgent({ harness: createAntigravityHarness() }).request({
      interactive: true,
    }).arguments,
    [],
  );
});

test("Antigravity decodes streamed steps and treats canceled or empty turns as failures", () => {
  const decode = decoder(createAntigravityHarness);
  assert.deepEqual(
    decode({
      event: "step_update",
      step_update: { step_type: "agent_response", text_delta: "hello" },
    }),
    [{ kind: "text", text: "hello" }],
  );
  assert.deepEqual(
    decode({
      event: "result",
      result: { status: "SUCCESS", response: "   " },
    }),
    [{ kind: "failure", message: "Antigravity returned an empty response" }],
  );
  assert.deepEqual(decode({ event: "result", result: {} }), [
    {
      kind: "failure",
      message: "Antigravity ended the turn with status unknown",
    },
  ]);
  assert.deepEqual(
    decode({
      event: "result",
      result: { status: "SUCCESS", response: "done", usage: { bad: "x" } },
    }),
    [
      { kind: "usage", tokens: { input: 0, cached: 0, output: 0 } },
      { kind: "result", text: "done" },
      { kind: "finished" },
    ],
  );
  for (const value of [
    { event: "init" },
    { event: "step_update" },
    { event: "step_update", step_update: { step_type: "checkpoint" } },
    { event: "step_update", step_update: { step_type: "constructor" } },
    {
      event: "step_update",
      step_update: { step_type: "agent_response", text_delta: "" },
    },
    {
      event: "step_update",
      step_update: { step_type: "tool", state: "ACTIVE", tool_name: "x" },
    },
    { event: "step_update", step_update: { step_type: "tool", state: "DONE" } },
  ])
    assert.deepEqual(decode(value), [{ kind: "raw", value }]);
});

test("Copilot reads prompts from stdin and decodes messages, tools and final exit codes", () => {
  const agent = composeAgent({
    harness: createCopilotHarness(),
    model: "fixture-model",
  });
  assert.deepEqual(agent.request({ text: "-literal" }), {
    executable: "copilot",
    arguments: [
      "--model",
      "fixture-model",
      "--output-format",
      "json",
      "--allow-all",
      "--no-ask-user",
    ],
    stdin: "-literal",
  });
  assert.equal(agent.request({}).stdin, "");
  assert.deepEqual(
    composeAgent({ harness: createCopilotHarness() }).request({
      interactive: true,
      text: "Inspect",
    }),
    {
      executable: "copilot",
      arguments: ["--interactive", "Inspect"],
      interactive: true,
    },
  );
  assert.deepEqual(
    composeAgent({ harness: createCopilotHarness() }).request({
      interactive: true,
    }).arguments,
    [],
  );
  const decode = decoder(createCopilotHarness);
  assert.deepEqual(
    decode({
      type: "assistant.message",
      data: {
        content: "text",
        toolRequests: [{ name: "view", arguments: { path: "a" } }, {}],
      },
    }),
    [
      { kind: "text", text: "text" },
      { kind: "tool", name: "view", input: { path: "a" } },
    ],
  );
  assert.deepEqual(
    decode({ type: "result", exitCode: 0, outcome: "blocked" }),
    [
      {
        kind: "failure",
        message: "GitHub Copilot CLI was blocked before completing the prompt",
      },
    ],
  );
  assert.deepEqual(decode({ type: "result" }), [
    {
      kind: "failure",
      message: "GitHub Copilot CLI ended with exit code unknown",
    },
  ]);
  for (const value of [
    { type: "assistant.message" },
    { type: "assistant.message", data: { content: "" } },
    { type: "session.error", data: {} },
  ])
    assert.deepEqual(decode(value), [{ kind: "raw", value }]);
});

test("Kimi passes the prompt as an option value and decodes role-based lines", () => {
  const agent = composeAgent({
    harness: createKimiHarness(),
    model: "kimi-code/fixture",
  });
  assert.deepEqual(agent.request({ text: "-literal" }), {
    executable: "kimi",
    arguments: [
      "--model",
      "kimi-code/fixture",
      "--prompt",
      "-literal",
      "--output-format",
      "stream-json",
    ],
  });
  assert.deepEqual(
    composeAgent({ harness: createKimiHarness() }).request({
      interactive: true,
    }),
    { executable: "kimi", arguments: [], interactive: true },
  );
  assert.throws(
    () =>
      composeAgent({ harness: createKimiHarness() }).request({
        interactive: true,
        text: "Inspect",
      }),
    /without an initial prompt/,
  );
  const decode = (value: unknown) =>
    composeAgent({ harness: createKimiHarness() }).events(
      JSON.stringify(value),
    );
  assert.deepEqual(
    decode({
      role: "assistant",
      tool_calls: [
        { function: { name: "Shell", arguments: "not json" } },
        { function: { name: "Read", arguments: { path: "a" } } },
        { function: {} },
      ],
    }),
    [
      { kind: "tool", name: "Shell", input: "not json" },
      { kind: "tool", name: "Read", input: { path: "a" } },
    ],
  );
  for (const value of [
    { role: "assistant", content: "" },
    { role: "meta" },
    { role: "meta", type: "session.resume_hint" },
    { role: "meta", type: "turn.step.retrying" },
    { role: "meta", type: "toString" },
  ])
    assert.deepEqual(decode(value), [{ kind: "raw", value }]);
});

test("help diagnostics inspect each new CLI through its registered executable", async () => {
  const help = {
    antigravity:
      "Usage of agy:\n  --dangerously-skip-permissions  Skip\n  --input-format  Input\n  --output-format  Output\n",
    copilot:
      "GitHub Copilot CLI\nUsage: copilot [OPTIONS] [COMMAND]\n  --output-format <format>\n  --allow-all\n  --no-ask-user\n",
    kimi: "Usage: kimi [options] [command]\n  -p, --prompt <prompt>  Prompt\n  --output-format <format>  Output\n",
  } as const;
  for (const agent of ["antigravity", "copilot", "kimi"] as const) {
    const commands: Command[] = [];
    const checks = await diagnoseAgentCli(agent, async (command) => {
      commands.push(command);
      return {
        status: 0,
        stdout:
          command.arguments?.[0] === "fork"
            ? "Usage: kimi fork [options]\n  --yes  Confirm"
            : help[agent] +
              "  --resume  Resume\n  --conversation  Resume\n  --session  Resume",
        stderr: "",
      };
    });
    assert.deepEqual(
      commands.map((command) => [command.executable, command.arguments]),
      [
        [doctorAgents[agent].executable, ["--help"]],
        [doctorAgents[agent].executable, ["--help"]],
        ...(agent === "kimi" ? [["kimi", ["fork", "--help"]]] : []),
      ],
    );
    assert.ok(
      checks.every((check) => check.status === "pass"),
      JSON.stringify(checks),
    );
    const missing = await diagnoseAgentCli(agent, async () => ({
      status: 0,
      stdout: help[agent].split("\n")[agent === "copilot" ? 1 : 0]!,
      stderr: "",
    }));
    assert.equal(missing[0]?.status, "fail");
  }
  assert.equal(doctorAgents.antigravity.executable, "agy");
  assert.equal(
    doctorAgents.antigravity.referenceVersion,
    agentVersions.antigravity,
  );
});

test("remote bootstrap installs npm CLIs, allows scripts only for Claude and verifies the pinned Antigravity archive", async () => {
  const scripts: string[] = [];
  const lease: SandboxLease = {
    root: "/workspace",
    home: "/home/agent",
    async invoke(command) {
      scripts.push(command.arguments?.[1] ?? "");
      const binary = /command -v (\w+)/.exec(command.arguments?.[1] ?? "")?.[1];
      return {
        status: 0,
        stdout: `/home/agent/.outpost-tools/bin/${binary}\n`,
        stderr: "",
      };
    },
    async upload() {},
    async download() {},
    async release() {},
  };
  const signal = new AbortController().signal;
  let npmAgents = 0;
  for (const descriptor of builtInAgents) {
    const { install } = descriptor;
    if (install.kind !== "npm") continue;
    npmAgents += 1;
    const agent = composeAgent({ harness: descriptor.harness() });
    const prepared = await prepareAdapter(agent, lease, signal);
    assert.equal(prepared.kind, "cli");
    if (prepared.kind !== "cli") throw new Error("Expected CLI harness");
    assert.equal(
      prepared.request({ text: "hello" }).executable,
      `/home/agent/.outpost-tools/bin/${descriptor.executable}`,
    );
    const script = scripts.at(-1)!;
    assert.ok(script.includes(`${install.package}@${descriptor.version}`));
    assert.equal(
      script.includes(`--allow-scripts=${install.package} `),
      "allowScripts" in install,
    );
  }
  assert.match(
    scripts.find((script) => script.includes("@github/copilot"))!,
    /npm install --global --prefix .* @github\/copilot@1\.0\.88/,
  );
  assert.equal(
    scripts.filter((script) => script.includes("--allow-scripts")).length,
    1,
  );
  const antigravity = composeAgent({ harness: createAntigravityHarness() });
  const prepared = await prepareAdapter(antigravity, lease, signal);
  if (prepared.kind !== "cli") throw new Error("Expected CLI harness");
  assert.equal(
    prepared.request({ text: "hello" }).executable,
    "/home/agent/.outpost-tools/bin/agy",
  );
  assert.equal(scripts.length, npmAgents + 1);
  assert.match(scripts.at(-1)!, /antigravity-cli\/1\.2\.12-/);
  assert.match(scripts.at(-1)!, /sha512sum/);
  assert.ok(!scripts.at(-1)!.includes("install.sh"));
  assert.equal(
    prepared.request({ text: "hello" }).variables?.AGY_CLI_DISABLE_AUTO_UPDATE,
    "true",
  );
  await assert.rejects(
    prepareAdapter(
      { ...antigravity, bootstrap: "unrecognized" },
      lease,
      signal,
    ),
    /Unknown agent bootstrap/,
  );
});

test("native Kimi fork uses the borrowed executor and rejects failed or ambiguous output", async () => {
  const adapter = createKimiHarness().bind();
  assert.ok(adapter.fork);
  const requests: Command[] = [];
  assert.equal(
    await adapter.fork("parent", async (command) => {
      requests.push(command);
      return {
        status: 0,
        stdout: 'Forked to session_child ("Fork: parent") in 1ms\n',
        stderr: "",
      };
    }),
    "session_child",
  );
  assert.deepEqual(requests, [
    { executable: "kimi", arguments: ["fork", "parent", "--yes"] },
  ]);
  for (const stdout of [
    "",
    "Forked to parent in 1ms",
    "Forked to ../bad in 1ms",
  ])
    await assert.rejects(
      adapter.fork("parent", async () => ({ status: 0, stdout, stderr: "" })),
      /distinct conversation identifier/,
    );
  await assert.rejects(
    adapter.fork("parent", async () => ({
      status: 7,
      stdout: "",
      stderr: "failure",
    })),
    /status 7/,
  );
  await assert.rejects(
    adapter.fork("../parent", async () => {
      assert.fail("unsafe ID invoked");
    }),
    /Invalid conversation/,
  );
});

test("Claude live input keeps stream-json stdin open and ignores replayed user messages", () => {
  const agent = composeAgent({ harness: createClaudeHarness() });
  assert.ok(agent.kind === "cli" && agent.liveInput);
  const live = agent.request({ text: "Refactor", liveInput: true });
  assert.deepEqual(live.arguments?.slice(0, 8), [
    "--print",
    "--verbose",
    "--output-format",
    "stream-json",
    "--input-format",
    "stream-json",
    "--replay-user-messages",
    "--dangerously-skip-permissions",
  ]);
  const message = {
    type: "user",
    message: { role: "user", content: [{ type: "text", text: "Refactor" }] },
    parent_tool_use_id: null,
  };
  assert.equal(live.stdin, `${JSON.stringify(message)}\n`);
  const session = agent.liveInput.open({ text: "Refactor", liveInput: true });
  assert.equal(session.encode("Refactor"), live.stdin);
  assert.equal(agent.request({ text: "Refactor" }).stdin, "Refactor");
  assert.ok(
    !agent.request({ text: "Refactor" }).arguments?.includes("--input-format"),
  );
  const replay = JSON.stringify({ ...message, isReplay: true });
  assert.deepEqual(session.read(replay), { consumed: 1, replies: [] });
  assert.deepEqual(session.read(JSON.stringify(message)), {
    consumed: 0,
    replies: [],
  });
  assert.equal(session.read("not json").consumed, 0);
  assert.deepEqual(agent.events(replay), [
    { kind: "raw", value: JSON.parse(replay) },
  ]);
  assert.deepEqual(agent.events(JSON.stringify(message)), [
    { kind: "text", text: "Refactor" },
  ]);
});
