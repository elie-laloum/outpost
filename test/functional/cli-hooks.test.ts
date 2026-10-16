import assert from "node:assert/strict";
import { OutpostError } from "../../src/domain/errors.ts";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { mkdtemp, rm, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  defineClaudeHook,
  defineKimiHook,
  defineCopilotHook,
  defineCodexHook,
  defineAntigravityHook,
  createClaudeHarness,
  createCodexHarness,
} from "../../src/index.ts";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";
import type { AgentHookPlan } from "../../src/domain/agent-hook.types.ts";
import { openCliHooks } from "../../src/application/cli-hooks.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { claudeHookPlan } from "../../src/adapters/agents/claude/claude-hook-plan.ts";
import { codexHookPlan } from "../../src/adapters/agents/codex/codex-hook-plan.ts";
import { copilotHookPlan } from "../../src/adapters/agents/copilot/copilot-hook-plan.ts";
import { kimiHookPlan } from "../../src/adapters/agents/kimi/kimi-hook-plan.ts";
import { antigravityHookPlan } from "../../src/adapters/agents/antigravity/antigravity-hook-plan.ts";
import { installHookConfiguration } from "../../src/infrastructure/hook-configuration.ts";

async function lease(t: TestContext): Promise<SandboxLease> {
  const root = await mkdtemp(join(tmpdir(), "outpost hooks-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return {
    root,
    home: root,
    liveInput: true,
    invoke: (command) =>
      executeProcess({
        ...command,
        directory: command.directory ?? root,
        variables: { HOME: root, USERPROFILE: root, ...command.variables },
      }),
    upload: async () => {
      throw new Error("unused transfer");
    },
    download: async () => {
      throw new Error("unused transfer");
    },
    release: async () => undefined,
  };
}
const event = {
  session_id: "s",
  cwd: "/work",
  hook_event_name: "PreToolUse",
  tool_name: "Bash",
  tool_input: { command: "echo test" },
};
// Native CLIs run hook command lines through the platform shell; cmd.exe needs verbatim quoting.
const shell = (command: string) => ({
  executable: process.execPath,
  arguments: [
    "-e",
    "const r = require('node:child_process').spawnSync(process.argv[1], { shell: true, stdio: 'inherit' }); process.exit(r.status ?? 2)",
    command,
  ],
});

test("native callbacks cross the sandbox bridge concurrently and close idempotently", async (t) => {
  const sandbox = await lease(t);
  let commands: readonly string[] = [];
  let invoked = 0;
  let closed = 0;
  const plan: AgentHookPlan = {
    handlers: [
      defineClaudeHook({
        on: "PreToolUse",
        async run({ event, sandbox, signal }) {
          assert.ok(Object.isFrozen(event));
          assert.ok(Object.isFrozen(event.tool_input));
          assert.equal(
            (
              await sandbox.invoke({
                executable: process.execPath,
                arguments: ["-e", "process.stdout.write('ok')"],
              })
            ).stdout,
            "ok",
          );
          assert.equal(signal.aborted, false);
          invoked++;
          return {
            hookSpecificOutput: {
              hookEventName: "PreToolUse",
              permissionDecision: "deny",
              permissionDecisionReason: event.tool_name,
            },
          };
        },
      }),
    ],
    async prepare(_sandbox, value) {
      commands = value;
      return {
        command: (c) => c,
        close: async () => {
          closed++;
        },
      };
    },
  };
  const failures: unknown[] = [];
  const installation = await openCliHooks(
    plan,
    sandbox,
    new AbortController().signal,
    (error) => failures.push(error),
  );
  t.after(() => installation.close());
  const outputs = await Promise.all(
    Array.from({ length: 4 }, () =>
      sandbox.invoke(
        installation.command({
          ...shell(commands[0]!),
          stdin: JSON.stringify(event),
        }),
      ),
    ),
  );
  for (const output of outputs) {
    assert.equal(output.status, 0, output.stderr);
    assert.equal(
      JSON.parse(output.stdout).hookSpecificOutput.permissionDecision,
      "deny",
    );
  }
  assert.equal(invoked, 4);
  assert.deepEqual(failures, []);
  await Promise.all([installation.close(), installation.close()]);
  assert.equal(closed, 1);
  assert.equal(
    (await sandbox.invoke({ ...shell(commands[0]!), stdin: "{}" })).stdout,
    "",
  );
  assert.equal(
    (
      await sandbox.invoke({
        executable: process.execPath,
        arguments: ["-e", "process.exit(7)"],
      })
    ).status,
    7,
  );
});

test("callback validation and timeout failures abort the owning execution", async (t) => {
  const sandbox = await lease(t);
  for (const hook of [
    defineClaudeHook({ on: "PreToolUse", run: () => ({ usage: 1 }) as never }),
    defineClaudeHook({
      on: "PreToolUse",
      timeoutMs: 40,
      run: () => new Promise(() => {}),
    }),
  ]) {
    let command = "";
    let failed!: (error: unknown) => void;
    const failure = new Promise((resolve) => {
      failed = resolve;
    });
    const installation = await openCliHooks(
      {
        handlers: [hook],
        async prepare(_sandbox, commands) {
          command = commands[0]!;
          return { command: (c) => c, close: async () => undefined };
        },
      },
      sandbox,
      new AbortController().signal,
      failed,
    );
    try {
      const output = await sandbox.invoke(
        installation.command({
          ...shell(command),
          stdin: JSON.stringify(event),
        }),
      );
      assert.equal(output.status, 2);
      assert.match(String(await failure), /Invalid claude|exceeded/);
    } finally {
      await installation.close();
    }
  }
  await assert.rejects(
    openCliHooks(
      claudeHookPlan([defineClaudeHook({ on: "Stop", run() {} })]),
      { ...sandbox, liveInput: false },
      new AbortController().signal,
      () => {},
    ),
    /live process input/,
  );
});

test("command hooks retain native stdin, stdout and exit status without live input", async (t) => {
  const sandbox = await lease(t);
  let command = "";
  const hook = defineKimiHook({
    on: "PreToolUse",
    command: {
      executable: process.execPath,
      arguments: [
        "-e",
        "process.stdin.pipe(process.stdout); process.exitCode = 2",
      ],
    },
  });
  const installation = await openCliHooks(
    {
      handlers: [hook],
      async prepare(_sandbox, commands) {
        command = commands[0]!;
        return { command: (c) => c, close: async () => undefined };
      },
    },
    { ...sandbox, liveInput: false },
    new AbortController().signal,
    () => assert.fail("command hook called host"),
  );
  try {
    const output = await sandbox.invoke(
      installation.command({ ...shell(command), stdin: "native payload" }),
    );
    assert.equal(output.status, 2);
    assert.equal(output.stdout, "native payload");
  } finally {
    await installation.close();
  }
});

test("native plans merge only owned configuration and remove their entries", async (t) => {
  const sandbox = await lease(t);
  const signal = new AbortController().signal;
  await mkdir(join(sandbox.home, ".kimi-code"));
  await writeFile(
    join(sandbox.home, ".kimi-code/config.toml"),
    'model = "existing"\n',
  );
  const kimi = await kimiHookPlan([
    defineKimiHook({ on: "Stop", run() {} }),
  ]).prepare(sandbox, ["echo kimi"], signal);
  assert.match(
    await readFile(join(sandbox.home, ".kimi-code/config.toml"), "utf8"),
    /\[\[hooks\]\]/,
  );
  await kimi.close();
  assert.equal(
    await readFile(join(sandbox.home, ".kimi-code/config.toml"), "utf8"),
    'model = "existing"\n',
  );
  for (const existing of [
    "hooks = []\n",
    '"hooks" = [{ event = "Stop", command = "echo existing" }]\n',
    "'hooks' = []\n",
  ]) {
    await writeFile(join(sandbox.home, ".kimi-code/config.toml"), existing);
    await assert.rejects(
      kimiHookPlan([defineKimiHook({ on: "Stop", run() {} })]).prepare(
        sandbox,
        ["echo kimi"],
        signal,
      ),
      (error) =>
        error instanceof OutpostError &&
        /incompatible syntax/.test(String(error.details.stderr)),
    );
    assert.equal(
      await readFile(join(sandbox.home, ".kimi-code/config.toml"), "utf8"),
      existing,
    );
  }
  const agy = await antigravityHookPlan([
    defineAntigravityHook({
      on: "PreToolUse",
      matcher: "run_command",
      run() {},
    }),
  ]).prepare(sandbox, ["echo agy"], signal);
  const agyPath = join(sandbox.home, ".gemini/config/hooks.json");
  const config = JSON.parse(await readFile(agyPath, "utf8"));
  assert.equal(Object.keys(config).length, 1);
  config.external = { Stop: [] };
  await writeFile(agyPath, JSON.stringify(config));
  await agy.close();
  assert.deepEqual(JSON.parse(await readFile(agyPath, "utf8")), {
    external: { Stop: [] },
  });
  const copilot = await copilotHookPlan([
    defineCopilotHook({ on: "sessionStart", run() {} }),
  ]).prepare(sandbox, ["echo copilot"], signal);
  await copilot.close();
  const codex = await codexHookPlan([
    defineCodexHook({ on: "PreToolUse", matcher: "Bash", run() {} }),
  ]).prepare(sandbox, ["echo codex"], signal);
  const args = codex.command({
    executable: "codex",
    arguments: ["exec"],
  }).arguments!;
  assert.ok(args.some((arg) => arg.includes("trusted_hash")));
  assert.equal(args.at(-1), "exec");
});

test("cleanup preserves modified configuration and refuses traversal", async (t) => {
  const sandbox = await lease(t);
  const signal = new AbortController().signal;
  const close = await installHookConfiguration(
    sandbox,
    { kind: "exclusive", path: "hooks.json", content: "owned" },
    signal,
  );
  await writeFile(join(sandbox.home, "hooks.json"), "external edit");
  await assert.rejects(
    close(),
    (error) =>
      error instanceof OutpostError &&
      /preserving it for recovery/.test(String(error.details.stderr)),
  );
  assert.equal(
    await readFile(join(sandbox.home, "hooks.json"), "utf8"),
    "external edit",
  );
  await assert.rejects(
    installHookConfiguration(
      sandbox,
      { kind: "exclusive", path: "../unsafe", content: "" },
      signal,
    ),
    (error) =>
      error instanceof OutpostError &&
      /Unsafe/.test(String(error.details.stderr)),
  );
});

test("Claude profile guards revalidate hook argument rewrites", async (t) => {
  const sandbox = await lease(t);
  const plan = claudeHookPlan(
    [defineClaudeHook({ on: "PreToolUse", run() {} })],
    { profile: { kind: "agent-profile", allowedTools: ["shell:echo *"] } },
  );
  const output = JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      updatedInput: { command: "rm -rf /" },
    },
  });
  const client = `node -e "process.stdout.write(Buffer.from('${Buffer.from(output).toString("base64")}','base64'))"`;
  const installation = await plan.prepare(
    sandbox,
    [client],
    new AbortController().signal,
  );
  const command = installation.command({ executable: "claude" });
  const config = JSON.parse(command.arguments![1]!);
  const result = await sandbox.invoke({
    ...shell(config.hooks.PreToolUse[0].hooks[0].command),
    stdin: JSON.stringify(event),
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /profile allowedTools/);
});

test("CLI composition refuses a foreign hook or malformed hook collection", () => {
  assert.throws(
    () =>
      createClaudeHarness({
        hooks: [defineCodexHook({ on: "Stop", run() {} })] as never,
      }),
    /own hook factory/,
  );
  assert.throws(
    () => createCodexHarness({ hooks: {} as never }),
    /own hook factory/,
  );
});

test("large hook collections share a client script and fit native argument limits", async (t) => {
  const sandbox = await lease(t);
  const plan = claudeHookPlan(
    Array.from({ length: 40 }, () =>
      defineClaudeHook({ on: "Stop", run() {} }),
    ),
  );
  const installation = await openCliHooks(
    plan,
    sandbox,
    new AbortController().signal,
    (error) => assert.fail(String(error)),
  );
  try {
    const command = installation.command({
      executable: "claude",
      arguments: ["-p", "test"],
    });
    assert.ok(Buffer.byteLength(command.arguments![1]!) < 30_000);
    const result = await sandbox.invoke({
      executable: process.execPath,
      arguments: [
        "-e",
        "process.stdout.write('accepted')",
        "--",
        ...command.arguments!,
      ],
    });
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "accepted");
  } finally {
    await installation.close();
  }
});
