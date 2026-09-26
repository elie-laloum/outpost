import assert from "node:assert/strict";
import { test } from "node:test";
import {
  defineHarnessContextStrategy,
  harness,
  summarizeHistory,
  truncateToolResults,
  type ModelMessage,
  type ModelProvider,
} from "../../src/index.ts";
import {
  parseTranscript,
  transcriptMessages,
} from "../../src/domain/transcript.ts";

const session = JSON.stringify({
  type: "session",
  version: 1,
  id: "a",
  model: "m",
  createdAt: "now",
});
const user: ModelMessage = {
  role: "user",
  content: [{ type: "text", text: "go" }],
};

test("transcripts fold messages and compactions and reject unknown content", () => {
  const records = parseTranscript(
    [
      session,
      JSON.stringify({ type: "message", message: user }),
      JSON.stringify({ type: "compaction", messages: [user, user] }),
      JSON.stringify({
        type: "message",
        message: { role: "assistant", content: [{ type: "text", text: "ok" }] },
      }),
      "",
    ].join("\n"),
  );
  assert.equal(transcriptMessages(records).length, 3);
  assert.deepEqual(transcriptMessages(parseTranscript(session)), []);
  for (const [text, pattern] of [
    ["not json", /valid JSONL/],
    [
      JSON.stringify({ type: "message", message: user }),
      /Unsupported harness transcript/,
    ],
    [
      JSON.stringify({ type: "session", version: 2 }),
      /Unsupported harness transcript/,
    ],
    [`${session}\n${JSON.stringify({ type: "other" })}`, /transcript record/],
  ] as const)
    assert.throws(() => parseTranscript(text), pattern);
});

test("context strategies validate their options and keep short histories", async () => {
  const input = {
    messages: [user],
    step: 1,
    model: { name: "m" },
    signal: new AbortController().signal,
    summarize: async () => "summary",
  };
  assert.equal(await truncateToolResults().compact(input), undefined);
  assert.equal(await summarizeHistory().compact(input), undefined);
  assert.equal(
    await summarizeHistory({ triggerCharacters: 1 }).compact(input),
    undefined,
  );
  const custom = defineHarnessContextStrategy({
    name: "custom",
    compact: ({ messages }) => messages.slice(-1),
  });
  assert.deepEqual(await custom.compact(input), [user]);
  for (const [build, pattern] of [
    [() => truncateToolResults({ keepRecent: 0 }), /keepRecent/],
    [() => truncateToolResults({ maxCharacters: -1 }), /maxCharacters/],
    [() => summarizeHistory({ triggerCharacters: 0 }), /triggerCharacters/],
    [() => summarizeHistory({ keepRecentMessages: 1.5 }), /keepRecentMessages/],
    [
      () =>
        defineHarnessContextStrategy({ name: "", compact: () => undefined }),
      /name/,
    ],
  ] as const)
    assert.throws(build, pattern);
  const modelProvider: ModelProvider = {
    name: "p",
    request: async () => ({ text: "" }),
  };
  assert.throws(
    // @ts-expect-error Context strategies must be defined explicitly.
    () => harness({ modelProvider, context: { compact: () => undefined } }),
    /defineHarnessContextStrategy/,
  );
  assert.throws(
    () =>
      harness({
        modelProvider,
        conversations: { locate: () => undefined } as never,
      }),
    /conversation store or false/,
  );
  assert.equal(
    harness({ modelProvider, conversations: false }).conversations,
    false,
  );
});
