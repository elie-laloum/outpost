import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createAgentConversations,
  restoreConversation,
} from "../../src/application/agent-conversations.ts";
import { createObservation } from "../../src/infrastructure/observation-client.ts";
import type {
  ConversationContext,
  ConversationStore,
} from "../../src/domain/conversation.types.ts";
import type { Turn } from "../../src/application/execution.types.ts";
import { scripted } from "../helpers.ts";

function context(): ConversationContext {
  return {
    repository: "/project",
    staging: "/staging",
    sandbox: {
      root: "/workspace",
      home: "/home/agent",
      invoke: async () =>
        assert.fail("Conversation storage must own its commands"),
      async upload() {},
      async download() {},
      async release() {},
    },
  };
}

test("conversation capture retains execution data and previous recovery records when a later capture fails", async () => {
  const events: string[] = [];
  await using observation = createObservation({
    sinks: [
      {
        observe(value) {
          if (value.event.kind === "operation") events.push(value.event.status);
        },
      },
    ],
  });
  const location = { ...context(), observation };
  const record = {
    id: "continued",
    file: "/captured/session",
    format: "fixture",
    reference: { key: "sessions/continued", revision: "one" },
  };
  let captures = 0;
  const store: ConversationStore = {
    name: "fixture",
    locate: async () => record,
    async capture(id, received) {
      assert.equal(id, record.id);
      assert.equal(received, location);
      if (++captures > 1) throw new Error("storage unavailable");
      return record;
    },
    async restore() {},
  };
  const saved: string[] = [];
  const session = createAgentConversations({
    agent: { ...scripted(""), storage: store },
    context: location,
    continuation: { id: record.id },
    onCapture(value) {
      saved.push(value.file);
    },
  });
  const turn: Turn = {
    text: "result",
    status: 7,
    conversation: record.id,
    interrupted: "steering",
    durationMs: 42,
    usage: { input: 2, cached: 1, output: 3 },
  };
  const captured = await session.captureTurn(turn);
  assert.deepEqual(captured, {
    ...turn,
    transcript: record.file,
    transcriptReference: record.reference,
  });
  await assert.rejects(session.captureTurn(turn), /storage unavailable/);
  assert.equal(session.captured.get(record.id), record);
  assert.deepEqual([...session.conversations], [record.id]);
  assert.deepEqual(saved, [record.file]);
  await observation.flush();
  assert.deepEqual(events, ["started", "finished", "started", "failed"]);
  const fork = createAgentConversations({
    agent: { ...scripted(""), storage: store, capture: false },
    context: location,
    continuation: { id: record.id, fork: true },
  });
  assert.deepEqual([...fork.conversations], []);
  assert.equal(await fork.captureTurn(turn), turn);
  assert.equal(captures, 2);
});

test("conversation restoration separates capture lookup paths from sandbox restoration context", async () => {
  const location = context();
  const record = {
    id: "session",
    file: "/captured/session",
    format: "fixture",
  };
  const lookups: unknown[][] = [];
  const restores: ConversationContext[] = [];
  const storage: ConversationStore = {
    name: "fixture",
    async locate(...args) {
      lookups.push(args);
      return record;
    },
    capture: async () =>
      assert.fail("Reading a conversation must not capture it"),
    async restore(saved, received) {
      assert.equal(saved, record);
      restores.push(received);
    },
  };
  await restoreConversation(storage, record.id, location, "/custom-captures");
  const files = {
    ...location,
    repository: "/runtime",
    runtimeDirectory: "/runtime",
    home: "/runtime/conversations",
  };
  await restoreConversation(storage, record.id, files);
  assert.deepEqual(lookups, [
    [record.id, "/project", "/custom-captures", undefined],
    [record.id, "/runtime", "/runtime/conversations", "/runtime"],
  ]);
  assert.equal(restores[0], location);
  assert.equal(restores[0]!.home, undefined);
  assert.equal(restores[1], files);
});
