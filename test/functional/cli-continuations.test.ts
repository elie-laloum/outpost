import assert from "node:assert/strict";
import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  createAgent,
  createAntigravityHarness,
  createClaudeHarness,
  createCodexHarness,
  createCopilotHarness,
  createKimiHarness,
  createSandbox,
  dispatch,
  createFallbackAgent,
  createLocalTransport,
  defineJsonResponse,
  recoveryDetails,
  createTransportConversations,
} from "../../src/index.ts";
import type { CliAgent, ConversationStore } from "../../src/index.ts";
import type { SandboxProvider } from "../../src/domain/sandbox.types.ts";
import type { Command } from "../../src/domain/command.types.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { conversationStore, repository, scripted } from "../helpers.ts";

const stored = {
  claude: createClaudeHarness,
  codex: createCodexHarness,
  copilot: createCopilotHarness,
  kimi: createKimiHarness,
};
const scripts = {
  antigravity: "continuation-cli.ts",
  claude: "transcript-cli.ts",
  codex: "transcript-cli.ts",
  copilot: "continuation-cli.ts",
  kimi: "continuation-cli.ts",
};
function fixture(
  name: keyof typeof scripts,
  conversations?: ConversationStore,
) {
  const adapter = createAgent({
    harness:
      name === "antigravity"
        ? createAntigravityHarness()
        : stored[name](conversations ? { conversations } : {}),
  });
  const command = (input: Command): Command => ({
    ...input,
    executable: process.execPath,
    arguments: [
      fileURLToPath(new URL(`../fixtures/${scripts[name]}`, import.meta.url)),
      name,
      ...(input.arguments ?? []),
    ],
  });
  return {
    ...adapter,
    request: (input: Parameters<typeof adapter.request>[0]) =>
      command(adapter.request(input)),
    ...(adapter.fork
      ? {
          fork: (
            id: string,
            invoke: Parameters<NonNullable<typeof adapter.fork>>[1],
          ) => adapter.fork!(id, (request) => invoke(command(request))),
        }
      : {}),
  };
}
function provider(root: string): SandboxProvider {
  let allocations = 0;
  return {
    name: "fixture-private-home",
    placement: "host",
    async acquire(context) {
      const home = join(root, `private-${++allocations}`);
      await mkdir(home, { recursive: true });
      const copy = async (from: string, to: string) => {
        await mkdir(dirname(to), { recursive: true });
        await cp(from, to, { recursive: true });
      };
      return {
        root: context.directory,
        home,
        upload: copy,
        download: copy,
        async release() {},
        invoke: (command) =>
          executeProcess({
            ...command,
            directory: context.directory,
            variables: {
              ...command.variables,
              OUTPOST_FIXTURE_HOME: home,
              KIMI_CODE_HOME: join(home, ".kimi-code"),
              COPILOT_HOME: join(home, ".copilot"),
            },
          }),
      };
    },
  };
}
for (const name of ["antigravity", "copilot", "kimi"] as const) {
  test(`${name} warm resume and JSON repair preserve the conversation identifier`, async (t) => {
    const root = await repository(t);
    await using sandbox = await createSandbox({
      repository: root,
      sandboxProvider: provider(root),
      agent: fixture(name),
      branch: { mode: "named", name: "conversation" },
      logging: false,
    });
    const first = await sandbox.dispatch({ brief: { text: "start" } });
    const second = await first.resume({ brief: { text: "continue" } });
    assert.equal(second.conversation, first.conversation);
    const repaired = await second.resume({
      brief: { text: "Return invalid JSON inside <answer>" },
      response: defineJsonResponse({
        jsonSchema: {
          type: "object",
          properties: { ok: { type: "boolean" } },
          required: ["ok"],
        },
        tag: "answer",
        repairs: 1,
        schema: (value: unknown) => {
          assert.deepEqual(value, { ok: true });
          return value;
        },
      }),
    });
    assert.equal(repaired.turns.length, 2);
    assert.deepEqual(repaired.value, { ok: true });
    assert.ok(
      repaired.turns.every((turn) => turn.conversation === first.conversation),
    );
    if (name !== "kimi")
      await assert.rejects(
        first.fork({ brief: { text: "fork" } }),
        /automated fork/,
      );
    if (name === "kimi") {
      const parent = await readFile(repaired.transcript!);
      const child = await repaired.fork({ brief: { text: "child only" } });
      assert.notEqual(child.conversation, repaired.conversation);
      assert.notEqual(child.transcript, repaired.transcript);
      assert.deepEqual(await readFile(repaired.transcript!), parent);
      assert.match(child.text, /remember me/);
      const resumedParent = await repaired.resume({
        brief: { text: "parent again" },
      });
      assert.doesNotMatch(resumedParent.text, /child only/);
      await assert.rejects(
        repaired.fork({ brief: { text: "fail-before-event" } }),
        (error) => {
          assert.match(String(error), /status 9/);
          const recovery = recoveryDetails(error);
          assert.ok(recovery?.transcript);
          assert.notEqual(recovery.transcript, repaired.transcript);
          return true;
        },
      );
    }
  });
}
for (const name of ["copilot", "kimi"] as const) {
  test(`${name} cold resume restores context into a fresh sandbox`, async (t) => {
    const root = await repository(t),
      sandboxProvider = provider(root);
    const first = await dispatch({
      repository: root,
      sandboxProvider,
      agent: fixture(name),
      branch: { mode: "named", name: "first" },
      brief: { text: "first prompt" },
      logging: false,
    });
    const second = await first.resume({
      branch: { mode: "named", name: "second" },
      brief: { text: "next prompt" },
    });
    assert.equal(second.conversation, first.conversation);
    assert.match(second.text, /first prompt/);
    if (name === "kimi") {
      const child = await second.fork({
        branch: { mode: "named", name: "child" },
        brief: { text: "fork prompt" },
      });
      assert.notEqual(child.conversation, second.conversation);
      assert.match(child.text, /next prompt/);
    }
  });
}
for (const name of ["claude", "codex", "copilot", "kimi"] as const) {
  test(`${name} transport conversations resume without local captures`, async (t) => {
    const root = await repository(t),
      sandboxProvider = provider(root);
    const transporter = createLocalTransport({
      directory: join(await repository(t), "objects"),
    });
    const conversations = createTransportConversations(
      conversationStore(name),
      {
        transporter,
        namespace: "team",
      },
    );
    const forget = async (transcript: string | undefined) => {
      await rm(transcript!, { force: true });
      await rm(join(root, ".outpost", "conversations"), {
        recursive: true,
        force: true,
      });
    };
    const first = await dispatch({
      repository: root,
      sandboxProvider,
      agent: fixture(name, conversations),
      branch: { mode: "named", name: "first" },
      brief: { text: "first prompt" },
      logging: false,
    });
    assert.ok(first.transcriptReference);
    await forget(first.transcript);
    const second = await first.resume({
      branch: { mode: "named", name: "second" },
      brief: { text: "next prompt" },
    });
    assert.equal(second.conversation, first.conversation);
    assert.match(second.text, /first prompt/);
    assert.ok(second.transcriptReference);
    if (name !== "kimi") return;
    const parent = second.transcriptReference;
    await forget(second.transcript);
    const child = await second.fork({
      branch: { mode: "named", name: "child" },
      brief: { text: "fork prompt" },
    });
    assert.notEqual(child.conversation, second.conversation);
    assert.match(child.text, /next prompt/);
    assert.ok(child.transcriptReference);
    assert.notEqual(child.transcriptReference.key, parent.key);
    assert.equal(
      (await transporter.read(parent.key))?.revision,
      parent.revision,
    );
  });
}
test("fallback candidates capture into their own conversation store", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({
    directory: join(await repository(t), "objects"),
  });
  const limited: CliAgent = {
    ...scripted(
      `console.log(JSON.stringify({ kind: "failure", message: "usage limit reached" }));process.exit(1);`,
    ),
    name: "limited",
    quota: (text) => /usage limit/.test(text),
  };
  const result = await dispatch({
    repository: root,
    sandboxProvider: provider(root),
    agent: createFallbackAgent(
      [
        limited,
        fixture(
          "kimi",
          createTransportConversations(conversationStore("kimi"), {
            transporter,
            namespace: "team",
          }),
        ),
      ],
      { on: ["quota"] },
    ),
    brief: { text: "handover" },
    logging: false,
  });
  assert.deepEqual(result.fallback?.selected, { index: 1, name: "kimi" });
  assert.ok(result.transcriptReference);
  assert.ok(await transporter.read(result.transcriptReference.key));
});
test("unsupported continuation fails before allocation", async (t) => {
  const root = await repository(t);
  const sandboxProvider: SandboxProvider = {
    name: "never",
    placement: "host",
    async acquire() {
      assert.fail("must reject before allocation");
    },
  };
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider,
      agent: createAgent({ harness: createAntigravityHarness() }),
      brief: { text: "resume" },
      continuation: { id: "session" },
    }),
    /native conversations/,
  );
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider,
      agent: createAgent({ harness: createCopilotHarness() }),
      brief: { text: "fork" },
      continuation: { id: "session", fork: true },
    }),
    /automated fork/,
  );
});
