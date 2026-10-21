import assert from "node:assert/strict";
import { test } from "node:test";
import { createAgentSessions } from "../../src/application/agent-sessions.ts";
import type { AgentAuthenticationPolicy } from "../../src/application/agent-sessions.types.ts";
import type { CliAgent } from "../../src/domain/agent.types.ts";
import type { Command } from "../../src/domain/command.types.ts";
import type { ConversationContext } from "../../src/domain/conversation.types.ts";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";
import { scripted } from "../helpers.ts";

function fixture(authentication: AgentAuthenticationPolicy) {
  const commands: Command[] = [];
  const restored: ConversationContext[] = [];
  const counts = { authentications: 0, configurations: 0 };
  const lease: SandboxLease = {
    root: "/workspace",
    home: "/home/agent",
    async invoke(command) {
      commands.push(command);
      return { status: 0, stdout: "", stderr: "" };
    },
    async upload() {},
    async download() {},
    async release() {},
  };
  const agent: CliAgent = {
    ...scripted("process.exit(0)"),
    variables: { OUTPOST_SESSION_VALUE: "agent" },
    credentials() {
      counts.authentications++;
      return {
        variables: { OUTPOST_SESSION_TOKEN: "credential" },
        host: [],
        files: [],
        commands: [],
      };
    },
    configuration() {
      counts.configurations++;
      return { files: [{ path: "settings.json", entries: { ok: true } }] };
    },
    storage: {
      name: "fixture",
      locate: async (id) => ({ id, file: `/stored/${id}`, format: "fixture" }),
      async capture() {
        assert.fail("Sessions must not capture conversations");
      },
      async restore(_record, context) {
        restored.push(context);
      },
    },
  };
  const sessions = createAgentSessions({
    lease,
    placement: "remote",
    authentication,
    conversation: { repository: "/runtime", staging: "/staging" },
    variables: (selected) => ({ ...selected.variables }),
  });
  return { sessions, agent, commands, restored, counts };
}

test("warm sessions authenticate and configure each CLI adapter once per lease", async () => {
  const { sessions, agent, commands, counts } = fixture("warm");
  const signal = new AbortController().signal;
  await sessions.prepare(agent, signal);
  const { executionLease } = await sessions.prepare(agent, signal);
  assert.deepEqual(counts, { authentications: 1, configurations: 1 });
  await executionLease.invoke({ executable: "true" });
  assert.deepEqual(commands.at(-1)?.variables, {
    OUTPOST_SESSION_VALUE: "agent",
    OUTPOST_SESSION_TOKEN: "credential",
  });
  assert.equal(
    commands[0]?.variables?.OUTPOST_SESSION_TOKEN,
    "credential",
    "configuration runs through the authenticated lease",
  );
});

test("per-dispatch sessions repeat authentication and configuration", async () => {
  const { sessions, agent, counts } = fixture("per-dispatch");
  const signal = new AbortController().signal;
  await sessions.prepare(agent, signal);
  await sessions.prepare(agent, signal);
  assert.deepEqual(counts, { authentications: 2, configurations: 2 });
});

test("sessions restore a continuation once with the injected conversation paths", async () => {
  const { sessions, agent, restored } = fixture("warm");
  const { executionLease } = await sessions.prepare(
    agent,
    new AbortController().signal,
  );
  await sessions.restore("first", agent, executionLease);
  await sessions.restore("first", agent, executionLease);
  sessions.remember(agent, "captured");
  await sessions.restore("captured", agent, executionLease);
  assert.equal(restored.length, 1);
  assert.equal(restored[0]?.repository, "/runtime");
  assert.equal(restored[0]?.staging, "/staging");
  assert.equal(restored[0]?.sandbox, executionLease);
  const { storage: _storage, ...stateless } = agent;
  await assert.rejects(
    sessions.restore("other", stateless, executionLease),
    /does not support native conversations/,
  );
});
