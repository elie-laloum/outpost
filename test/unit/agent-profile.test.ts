import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createAgent,
  createAntigravityHarness,
  createClaudeHarness,
  createCodexHarness,
  createCopilotHarness,
  createHarness,
  createKimiHarness,
  defineAgentProfile,
  OutpostError,
} from "../../src/index.ts";
import { profilePermissions } from "../../src/domain/agent-profile-permissions.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";

const instructions =
  'Never modify generated files.\nKeep ${TEXT} and "quotes" verbatim.';
const profile = defineAgentProfile({
  instructions,
  mcpServers: {
    docs: {
      command: "node",
      arguments: ["docs.mjs"],
      variables: ["DOCS_TOKEN"],
    },
  },
});
const failure = (action: () => unknown, message: RegExp) =>
  assert.throws(
    action,
    (error) =>
      error instanceof OutpostError &&
      error.code === "configuration" &&
      message.test(error.message),
  );

test("profiles validate unknown fields and clone their declarations", () => {
  for (const value of [
    null,
    [],
    "profile",
    { extra: true },
    { instructions: "" },
    { instructions: "\0" },
    { instructions: 1 },
    { allowedTools: null },
    { allowedTools: ["web"] },
    { allowedTools: [1] },
    { allowedTools: ["read", "read"] },
    { allowedTools: ["shell:"] },
    { allowedTools: ["shell:echo\nx"] },
  ])
    failure(
      () => Reflect.apply(defineAgentProfile, undefined, [value]),
      /profile/i,
    );
  failure(
    () => defineAgentProfile({ mcpServers: { docs: { command: "${TOKEN}" } } }),
    /literal/,
  );
  const allowedTools: ("read" | "edit")[] = ["read"];
  const argumentsList = ["before"];
  const declared = defineAgentProfile({
    allowedTools,
    mcpServers: { docs: { command: "node", arguments: argumentsList } },
  });
  allowedTools.push("edit");
  argumentsList.push("after");
  assert.deepEqual(declared.allowedTools, ["read"]);
  assert.deepEqual(declared.mcpServers?.docs, {
    command: "node",
    arguments: ["before"],
  });
  assert.ok(Object.isFrozen(declared));
  assert.ok(Object.isFrozen(declared.allowedTools));
  assert.deepEqual(defineAgentProfile({}), { kind: "agent-profile" });
});

test("CLI presets project shared MCP servers and refuse duplicates or unsupported filters", () => {
  for (const harness of [
    createClaudeHarness,
    createCodexHarness,
    createCopilotHarness,
    createKimiHarness,
    createAntigravityHarness,
  ]) {
    const agent = createAgent({ harness: harness({ profile }) });
    const request = agent.request({ text: "task" });
    const projection = JSON.stringify([
      request,
      agent.configuration?.({ DOCS_TOKEN: "private-marker" }),
    ]);
    assert.match(projection, /docs/);
    assert.ok(!projection.includes("private-marker"));
    failure(
      () => harness({ profile, mcpServers: { docs: { command: "other" } } }),
      /not both/,
    );
  }
  failure(
    () =>
      createAgent({
        harness: createClaudeHarness({
          profile: defineAgentProfile({
            mcpServers: {
              docs: {
                command: "node",
                tools: { include: ["read"] },
              },
            },
          }),
        }),
      }),
    /listed tools/,
  );
  const configured = createAgent({
    harness: createCodexHarness({
      profile,
      mcpServers: { other: { command: "other" } },
    }),
  });
  assert.match(JSON.stringify(configured.request({})), /mcp_servers.other/);
});

test("unsupported allowlists are rejected when composing the agent, including empty lists", () => {
  for (const harness of [
    createCodexHarness,
    createCopilotHarness,
    createKimiHarness,
    createAntigravityHarness,
  ])
    for (const allowedTools of [[], ["read"]] as const)
      failure(
        () =>
          createAgent({
            harness: harness({ profile: defineAgentProfile({ allowedTools }) }),
          }),
        /does not support.*allowedTools/,
      );
  failure(
    () =>
      createAgent({
        harness: createClaudeHarness({
          profile: defineAgentProfile({ allowedTools: [] }),
          permissions: "bypassPermissions",
        }),
      }),
    /dontAsk/,
  );
  failure(
    () =>
      Reflect.apply(createCodexHarness, undefined, [
        { profile: { instructions } },
      ]),
    /defineAgentProfile/,
  );
});

test("instructions use native Claude and Codex configuration on new and continued requests", () => {
  const claude = createAgent({ harness: createClaudeHarness({ profile }) });
  const codex = createAgent({ harness: createCodexHarness({ profile }) });
  for (const input of [
    { text: "task" },
    { text: "repair", continuation: { id: "session-id" } },
    { text: "task", interactive: true },
    { text: "task", liveInput: true },
  ]) {
    const args = claude.request(input).arguments ?? [];
    assert.equal(
      args[args.indexOf("--append-system-prompt") + 1],
      instructions,
    );
    assert.ok(args.includes("--system-prompt-snapshot"));
    assert.ok(
      codex
        .request(input)
        .arguments?.includes(
          `developer_instructions=${JSON.stringify(instructions)}`,
        ),
    );
  }
  for (const continuation of [
    undefined,
    { id: "session-id" },
    { id: "session-id", fork: true },
  ]) {
    const session = codex.liveInput?.open({
      text: "task",
      ...(continuation ? { continuation } : {}),
    });
    const initialize = JSON.parse(
      codex.request({ liveInput: true }).stdin ?? "{}",
    );
    const thread = session
      ?.read(JSON.stringify({ id: initialize.id, result: {} }))
      .replies.at(-1);
    assert.ok(thread);
    assert.equal(JSON.parse(thread).params.developerInstructions, instructions);
  }
});

test("other CLIs prepend literal instructions to each prompt and Kimi refuses an interactive profile prompt", () => {
  for (const harness of [
    createCopilotHarness,
    createKimiHarness,
    createAntigravityHarness,
  ]) {
    const agent = createAgent({ harness: harness({ profile }) });
    for (const continuation of [undefined, { id: "session-id" }]) {
      const request = agent.request({
        text: "Final response instructions",
        ...(continuation ? { continuation } : {}),
      });
      const text =
        request.stdin ??
        request.arguments?.[request.arguments.indexOf("--prompt") + 1];
      assert.ok(text?.includes(instructions.split("\n")[0]!));
      assert.ok(text?.includes("Final response instructions"));
    }
  }
  failure(
    () =>
      createAgent({ harness: createKimiHarness({ profile }) }).request({
        interactive: true,
      }),
    /interactive/,
  );
  const copilot = createAgent({ harness: createCopilotHarness({ profile }) });
  assert.ok(
    copilot
      .request({ interactive: true })
      .arguments?.includes(`${instructions}\n\n`),
  );
});

test("built-in profile permissions deny unknown tools and compare shell commands exactly", () => {
  assert.deepEqual(profilePermissions(undefined), []);
  assert.deepEqual(profilePermissions(profile), []);
  const [policy] = profilePermissions(
    defineAgentProfile({
      allowedTools: ["read", "edit", "shell:echo ok"],
      mcpServers: profile.mcpServers!,
    }),
  );
  assert.ok(policy);
  for (const name of [
    "read_file",
    "list_files",
    "search",
    "write_file",
    "edit_file",
    "mcp__docs__lookup",
  ])
    assert.equal(policy.evaluate(name, {}).allowed, true);
  for (const command of [
    undefined,
    "echo ok; touch forbidden",
    "echo ok ",
    "echo other",
  ])
    assert.equal(
      policy.evaluate("shell", command === undefined ? {} : { command })
        .allowed,
      false,
    );
  assert.equal(policy.evaluate("shell", { command: "echo ok" }).allowed, true);
  assert.equal(policy.evaluate("custom", {}).allowed, false);
  const [allShell] = profilePermissions(
    defineAgentProfile({ allowedTools: ["shell"] }),
  );
  assert.equal(
    allShell?.evaluate("shell", { command: "anything" }).allowed,
    true,
  );
  const [empty] = profilePermissions(defineAgentProfile({ allowedTools: [] }));
  assert.equal(empty?.evaluate("read_file", {}).allowed, false);
});

test(
  "Claude emits a restrictive tool set and an executable hook for exact shell commands",
  { skip: process.platform === "win32" },
  async () => {
    const restrictive = defineAgentProfile({
      allowedTools: ["read", "edit", "shell:echo 'ok'"],
      mcpServers: {
        docs: { command: "node", tools: { exclude: ["delete_note"] } },
      },
    });
    const claude = createAgent({
      harness: createClaudeHarness({ profile: restrictive }),
    });
    for (const input of [
      { text: "task" },
      { interactive: true },
      { text: "repair", continuation: { id: "session-id" } },
      { liveInput: true },
    ]) {
      const args = claude.request(input).arguments ?? [];
      assert.ok(
        args.includes("--tools=Read,Glob,Grep,Edit,Write,NotebookEdit,Bash"),
      );
      assert.ok(!args.includes("--dangerously-skip-permissions"));
      assert.ok(args.includes("--strict-mcp-config"));
    }
    const args = claude.request({}).arguments ?? [];
    const settings = JSON.parse(args[args.indexOf("--settings") + 1]!);
    const command = settings.hooks.PreToolUse[0].hooks[0].command;
    for (const [name, input, status] of [
      ["Read", {}, 0],
      ["Write", {}, 0],
      ["Bash", { command: "echo 'ok'" }, 0],
      ["Bash", { command: "echo 'ok'; touch forbidden" }, 2],
      ["Bash", { command: "pwd" }, 2],
      ["Agent", {}, 2],
      ["mcp__docs__delete_note", {}, 2],
      ["mcp__docs__lookup", {}, 0],
      ["mcp__other__lookup", {}, 2],
    ] as const) {
      const result = await executeProcess({
        executable: "sh",
        arguments: ["-c", command],
        stdin: JSON.stringify({ tool_name: name, tool_input: input }),
      });
      assert.equal(
        result.status,
        status,
        `${name} ${JSON.stringify(input)}: ${result.stderr}`,
      );
      if (status === 0)
        assert.equal(
          JSON.parse(result.stdout).hookSpecificOutput.permissionDecision,
          "allow",
        );
    }
    const malformed = await executeProcess({
      executable: "sh",
      arguments: ["-c", command],
      stdin: "{",
    });
    assert.equal(malformed.status, 2);
    const unavailable = await executeProcess({
      executable: "/bin/sh",
      arguments: ["-c", command],
      variables: { PATH: "/nonexistent" },
      stdin: JSON.stringify({ tool_name: "Read", tool_input: {} }),
    });
    assert.equal(unavailable.status, 2);
    assert.ok(
      createAgent({
        harness: createClaudeHarness({
          profile: defineAgentProfile({ allowedTools: [] }),
        }),
      })
        .request({})
        .arguments?.includes("--tools="),
    );
    const broad = createAgent({
      harness: createClaudeHarness({
        profile: defineAgentProfile({ allowedTools: ["shell"] }),
        permissions: "dontAsk",
      }),
    });
    assert.ok(broad.request({}).arguments?.includes("--tools=Bash"));
  },
);

test("built-in harness combines instructions and rejects duplicate MCP server declarations", async () => {
  const harness = createHarness({
    profile,
    instructions: "Extra instruction",
    modelProvider: {
      name: "offline",
      async request() {
        return { text: "done" };
      },
    },
  });
  assert.equal(harness.profile?.instructions, instructions);
  assert.equal(harness.instructions.length, 2);
  failure(
    () =>
      createHarness({
        profile,
        mcpServers: { docs: { command: "other" } },
        modelProvider: harness.modelProvider,
      }),
    /not both/,
  );
});
