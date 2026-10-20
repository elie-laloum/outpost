import assert from "node:assert/strict";
import { mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { test } from "node:test";
import {
  attach,
  createAgent,
  createLocalTransport,
  createSandbox,
  createSteering,
  createWorkspace,
  defineJsonResponse,
  dispatch,
} from "../../src/index.ts";
import type { AgentEvent } from "../../src/domain/agent.types.ts";
import type { SandboxProvider } from "../../src/domain/sandbox.types.ts";
import { builtInAgents } from "../../src/adapters/agents/catalog.ts";
import { createClaudeConversations } from "../../src/adapters/agents/claude/claude-conversations.ts";
import { validateFileAgent } from "../../src/application/file-sandbox.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { createMemorySandboxProvider } from "../../src/testing.ts";

const response = defineJsonResponse({
  tag: "answer",
  repairs: 1,
  jsonSchema: { type: "number" },
  schema: (value) => {
    assert.equal(typeof value, "number");
    return value;
  },
});

for (const descriptor of builtInAgents) {
  test(`${descriptor.name} accepts demonstrated file capabilities and refuses the rest`, async (t) => {
    const agent = createAgent({ harness: descriptor.harness() });
    if (agent.fileWorkspaces) {
      assert.equal(agent.fileWorkspaces.dispatch, true);
      assert.ok(
        Object.values(agent.fileWorkspaces).every((value) => value === true),
      );
    }
    if (agent.fileWorkspaces?.dispatch) await validateFileAgent(agent);
    else
      await assert.rejects(validateFileAgent(agent), {
        code: "configuration",
        message: `${descriptor.name} has not declared validated support for file workspaces`,
      });
    const candidate = {
      ...agent,
      fileWorkspaces: { ...agent.fileWorkspaces, dispatch: true },
    };
    await validateFileAgent(candidate, { brief: { text: "Process files" } });
    if (!agent.liveInput) {
      const steering = createSteering();
      try {
        await validateFileAgent(candidate, {
          brief: { text: "Process files" },
          steering,
        });
      } finally {
        steering.close();
      }
    }
    const continuation = {
      brief: { text: "Continue" },
      continuation: { id: "session" },
    };
    if (agent.fileWorkspaces?.continuation)
      await validateFileAgent(agent, continuation);
    else
      await assert.rejects(validateFileAgent(candidate, continuation), {
        message: "Agent continuation is not validated for file workspaces",
      });
    const repair = { brief: { text: "Reply" }, response };
    if (agent.fileWorkspaces?.repairs) await validateFileAgent(agent, repair);
    else
      await assert.rejects(validateFileAgent(candidate, repair), {
        message: "Agent repairs are not validated for file workspaces",
      });
    if (agent.liveInput) {
      const steering = createSteering();
      try {
        const live = { brief: { text: "Process files" }, steering };
        if (agent.fileWorkspaces?.liveInput)
          await validateFileAgent(agent, live);
        else
          await assert.rejects(validateFileAgent(candidate, live), {
            message: "Agent live input is not validated for file workspaces",
          });
        await assert.rejects(
          validateFileAgent(
            {
              ...candidate,
              fileWorkspaces: { ...candidate.fileWorkspaces, liveInput: false },
            },
            live,
          ),
          {
            message: "Agent live input is not validated for file workspaces",
          },
        );
      } finally {
        steering.close();
      }
    }
    if (agent.fileWorkspaces?.interactive) {
      const root = await mkdtemp(join(tmpdir(), "outpost-file-attach-gate-"));
      t.after(() => rm(root, { recursive: true, force: true }));
      await using workspace = await createWorkspace({
        source: { kind: "ephemeral" },
        runtime: { directory: join(root, "runtime"), namespace: "gate" },
      });
      const memory = createMemorySandboxProvider();
      let invoked = 0;
      const sandboxProvider: SandboxProvider = {
        ...memory,
        workspaces: {
          bindings: ["ephemeral"],
          async acquire(context) {
            const lease = await memory.workspaces!.acquire(context);
            return {
              ...lease,
              async invoke(command) {
                assert.equal(command.executable, descriptor.executable);
                assert.equal(command.interactive, true);
                invoked++;
                return { status: 0, stdout: "", stderr: "" };
              },
            };
          },
        },
      };
      assert.equal(
        (await attach({ workspace, sandboxProvider, agent })).status,
        0,
      );
      assert.equal(invoked, 1);
      return;
    }
    await assert.rejects(
      attach({
        workspaceSource: { kind: "ephemeral" },
        sandboxProvider: createMemorySandboxProvider(),
        agent: candidate,
      }),
      {
        message:
          "Interactive CLI support for file workspaces has not been validated",
      },
    );
  });
}

test("native file declarations retain passing evidence for each pinned CLI version", async () => {
  for (const descriptor of builtInAgents) {
    const agent = createAgent({ harness: descriptor.harness() });
    const forks = agent.forkable !== false;
    const expected = {
      dispatch: {
        turns: 1,
        allocations: 1,
        checks: ["typed-json", "fileOutputs"],
      },
      repairs: {
        turns: 2,
        allocations: 1,
        checks: [
          "typed-json",
          "fileOutputs",
          "forced-response-repair",
          "same-conversation",
        ],
      },
      continuation: {
        turns: forks ? 5 : 3,
        allocations: forks ? 3 : 2,
        checks: [
          "warm-continuation",
          ...(forks ? ["warm-fork"] : []),
          "native-capture",
          "portable-archive",
          "fresh-container-restore",
          ...(forks ? ["fresh-container-fork"] : []),
        ],
      },
      liveInput: {
        turns: 1,
        allocations: 1,
        checks: [
          "native-live-injection",
          "single-cli-turn",
          "no-interrupt-or-resume",
          "steered-file",
          "typed-json",
        ],
      },
      interactive: {
        turns: 2,
        allocations: 1,
        checks: [
          "host-pty",
          "container-tty",
          "terminal-followup-input",
          "two-file-effects",
          "clean-cli-exit",
          "idle-cli-cancellation",
          "warm-sandbox-reuse",
        ],
      },
    };
    for (const capability of Object.keys(
      expected,
    ) as (keyof typeof expected)[]) {
      if (!agent.fileWorkspaces?.[capability]) continue;
      const proof = expected[capability];
      const evidence = JSON.parse(
        await readFile(
          new URL(
            `../../docs/audit/cli-file-workspaces/${descriptor.name}-${descriptor.version}-${capability}.json`,
            import.meta.url,
          ),
          "utf8",
        ),
      );
      assert.equal(evidence.pinnedVersion, descriptor.version);
      assert.equal(evidence.agent, descriptor.name);
      assert.equal(evidence.mode, "live");
      assert.equal(evidence.suite, capability);
      assert.equal(evidence.status, "passed");
      assert.equal(evidence.cleanup, true);
      if (evidence.campaigns) {
        assert.equal(evidence.aggregation, "independent-bindings");
        const cases = [];
        for (const campaign of evidence.campaigns) {
          assert.match(campaign, /^[a-z0-9.-]+\.json$/);
          const source = JSON.parse(
            await readFile(
              new URL(
                `../../docs/audit/cli-file-workspaces/${campaign}`,
                import.meta.url,
              ),
              "utf8",
            ),
          );
          for (const field of [
            "agent",
            "pinnedVersion",
            "suite",
            "model",
            "authentication",
            "variant",
            "mode",
            "status",
            "cleanup",
          ])
            assert.deepEqual(source[field], evidence[field], field);
          cases.push(...source.cases);
        }
        assert.deepEqual(evidence.cases, cases);
      }
      const bindings: string[] = [];
      for (const entry of evidence.cases) {
        bindings.push(entry.binding);
        assert.equal(entry.status, "passed");
        assert.equal(entry.scenario, capability);
        assert.deepEqual(
          entry.versions,
          Array.from({ length: proof.allocations }, () => descriptor.version),
        );
        assert.equal(entry.turns, proof.turns);
        for (const check of proof.checks)
          assert.ok(entry.checks.includes(check), check);
      }
      assert.deepEqual(bindings, [
        "ephemeral",
        "copy",
        "mount-readonly",
        "mount-write",
      ]);
    }
  }
});

test("file capture keeps native Claude transcripts in runtime storage and restores into a fresh home", async (t) => {
  const root = await realpath(
    await mkdtemp(join(tmpdir(), "outpost-cli-files-")),
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  const native = createClaudeConversations();
  const hostHome = join(root, "host-home");
  const host = createLocalSandboxProvider();
  let acquisitions = 0;
  const sandboxProvider: SandboxProvider = {
    ...host,
    workspaces: {
      bindings: ["ephemeral"],
      async acquire(context) {
        acquisitions++;
        const home = await mkdtemp(join(root, "sandbox-home-"));
        const lease = await host.workspaces!.acquire(context);
        return {
          ...lease,
          home,
          invoke(command) {
            assert.notEqual(command.executable, "git");
            return lease.invoke({
              ...command,
              variables: { ...command.variables, HOME: home },
            });
          },
          async release() {
            await lease.release();
            await rm(home, { recursive: true, force: true });
          },
        };
      },
    },
  };
  const agent = createAgent({
    harness: {
      kind: "cli",
      bind: () => ({
        name: "native-transcript-fixture",
        resumable: true,
        fileWorkspaces: { dispatch: true, continuation: true },
        storage: {
          ...native,
          capture: (id, context) =>
            native.capture(id, { ...context, home: context.home ?? hostHome }),
          locate: (id, repository, home) =>
            native.locate(id, repository, home ?? hostHome),
        },
        request(input) {
          return {
            executable: process.execPath,
            arguments: [
              "-e",
              `const fs = require('node:fs'); const path = require('node:path');
const id = 'file-session';
const file = path.join(process.env.HOME, '.claude', 'projects', process.cwd().replace(/[^a-zA-Z0-9]/g, '-'), id + '.jsonl');
const count = ${Boolean(input.continuation)} ? JSON.parse(fs.readFileSync(file, 'utf8')).count + 1 : 1;
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify({ cwd: process.cwd(), count }));
console.log(JSON.stringify({ kind: 'conversation', id }));
console.log(JSON.stringify({ kind: 'text', text: 'count=' + count + ' DONE' }));`,
            ],
          };
        },
        events: (line): AgentEvent[] => [JSON.parse(line)],
      }),
    },
  });
  const runtime = join(root, "runtime");
  await using workspace = await createWorkspace({
    source: { kind: "ephemeral" },
    runtime: { directory: runtime, namespace: "native-files" },
    retention: {
      policy: "portable",
      transporter: createLocalTransport({ directory: join(root, "archive") }),
    },
  });
  const first = await dispatch({
    workspace,
    sandboxProvider,
    agent,
    brief: { text: "Start" },
    until: "DONE",
    logging: false,
  });
  assert.match(first.text, /count=1/);
  assert.ok(first.transcript);
  assert.ok(!relative(runtime, first.transcript).startsWith(".."));
  assert.equal(
    JSON.parse(await readFile(first.transcript, "utf8")).cwd,
    runtime,
  );
  assert.equal(first.workspaceInfo.conversations?.length, 1);
  const second = await first.resume({
    brief: { text: "Continue" },
    until: "DONE",
    logging: false,
  });
  assert.match(second.text, /count=2/);
  assert.equal(acquisitions, 2);
  await using sandbox = await createSandbox({ workspace, sandboxProvider });
  await assert.rejects(sandbox.attach({ agent }), {
    message:
      "Interactive CLI support for file workspaces has not been validated",
  });
});
