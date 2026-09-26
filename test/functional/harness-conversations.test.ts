import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { readFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import {
  agent,
  defineHarnessTool,
  dispatch,
  harness,
  localTransport,
  response,
  summarizeHistory,
  transportConversations,
  truncateToolResults,
  type AgentObservation,
  type CustomHarnessOptions,
  type ModelProvider,
  type ModelRequest,
  type ModelResult,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { openTranscript } from "../../src/infrastructure/conversations/harness-transcript.ts";
import { harnessConversations } from "../../src/infrastructure/conversations/harness-store.ts";
import { git } from "../../src/infrastructure/git.ts";
import { repository } from "../helpers.ts";

const done = "<outpost>done</outpost>";
type Reply = (request: ModelRequest) => ModelResult;

const provider = (
  replies: Reply[],
  requests: ModelRequest[],
): ModelProvider => ({
  name: "scripted",
  async request(request) {
    requests.push(request);
    const reply = replies.shift();
    assert.ok(reply, "unexpected model request");
    return reply(request);
  },
});
const answer =
  (text = done): Reply =>
  () => ({ text, content: [{ type: "text", text }], stopReason: "end" });
const call =
  (name: string, input: unknown): Reply =>
  (request) => ({
    text: "",
    content: [
      {
        type: "tool-call",
        id: `call-${request.messages?.length ?? 0}`,
        name,
        input,
      },
    ],
    stopReason: "tool-calls",
  });
const texts = (request: ModelRequest | undefined) =>
  (request?.messages ?? []).map((message) =>
    message.content
      .map((block) =>
        block.type === "text"
          ? block.text
          : block.type === "tool-result"
            ? `result:${block.content}`
            : block.type,
      )
      .join("|"),
  );

const echo = defineHarnessTool({
  name: "echo",
  description: "Echo text.",
  readOnly: true,
  input: { type: "object", properties: { text: { type: "string" } } },
  execute: (input: { text?: string }) => input.text ?? "",
});
const touch = defineHarnessTool({
  name: "touch",
  description: "Mutating tool.",
  input: { type: "object" },
  execute: () => {
    throw new Error("disk failure");
  },
});

function worker(
  replies: Reply[],
  requests: ModelRequest[],
  extra: Omit<CustomHarnessOptions, "modelProvider"> = {},
) {
  return agent({
    model: "m",
    harness: harness({
      modelProvider: provider(replies, requests),
      tools: [echo, touch],
      ...extra,
    }),
  });
}

async function run(
  t: TestContext,
  root: string | undefined,
  selected: ReturnType<typeof worker>,
  extra: Partial<Parameters<typeof dispatch>[0]> = {},
) {
  return dispatch({
    repository: root ?? (await repository(t)),
    sandboxProvider: localSandboxProvider(),
    agent: selected,
    brief: { text: "first task" },
    logging: false,
    ...extra,
  });
}

test("custom harness conversations persist, resume and fork on the host", async (t) => {
  const root = await repository(t);
  const requests: ModelRequest[] = [];
  const events: AgentObservation[] = [];
  const first = await run(
    t,
    root,
    worker([call("echo", { text: "hi" }), answer()], requests),
    { observe: (event) => events.push(event) },
  );
  const id = first.conversation!;
  assert.ok(events.some((event) => event.kind === "conversation"));
  const file = join(
    root,
    ".outpost",
    "conversations",
    "harness",
    `${id}.jsonl`,
  );
  assert.equal(first.transcript, file);
  const records = (await readFile(file, "utf8"))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.equal(records[0].type, "session");
  assert.equal(records.length, 5);
  if (process.platform !== "win32")
    assert.equal((await stat(file)).mode & 0o777, 0o600);
  assert.equal(
    (await git(root, ["status", "--porcelain"])).includes(".outpost"),
    false,
  );
  const resumed = await run(t, root, worker([answer()], requests), {
    continuation: { id },
    brief: { text: "second task" },
  });
  assert.equal(resumed.conversation, id);
  assert.deepEqual(texts(requests.at(-1)), [
    "first task",
    "tool-call",
    "result:hi",
    done,
    "second task",
  ]);
  const forked = await run(t, root, worker([answer()], requests), {
    continuation: { id, fork: true },
    brief: { text: "branch task" },
  });
  assert.notEqual(forked.conversation, id);
  const forkRecords = (
    await readFile(
      join(
        root,
        ".outpost",
        "conversations",
        "harness",
        `${forked.conversation}.jsonl`,
      ),
      "utf8",
    )
  )
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.equal(forkRecords[0].parent, id);
  assert.equal(forkRecords[1].type, "compaction");
  assert.deepEqual(texts(requests.at(-1)).slice(-2), [done, "branch task"]);
  const original = await readFile(file, "utf8");
  assert.equal(original.includes("branch task"), false);
  await assert.rejects(
    run(t, root, worker([], requests), { continuation: { id: "missing" } }),
    /does not exist/,
  );
});

test("interrupted transcripts resume with explicit tool errors and locks prevent concurrent writers", async (t) => {
  const root = await repository(t);
  const requests: ModelRequest[] = [];
  const failed = run(
    t,
    root,
    worker([call("touch", {})], requests, {
      toolExecution: { onError: "fail" },
    }),
  );
  await assert.rejects(failed, /disk failure/);
  const [id] = (
    await import("node:fs/promises").then(({ readdir }) =>
      readdir(join(root, ".outpost", "conversations", "harness")),
    )
  ).map((name) => name.replace(/\.jsonl$/, ""));
  assert.ok(id);
  await run(t, root, worker([answer()], requests), {
    continuation: { id },
    brief: { text: "try again" },
  });
  assert.deepEqual(texts(requests.at(-1)), [
    "first task",
    "tool-call",
    "result:The tool call was interrupted before it produced a result.",
    "try again",
  ]);
  const handle = await openTranscript({
    repository: root,
    store: harnessConversations(),
    model: "m",
    continuation: { id },
  });
  try {
    await assert.rejects(
      run(t, root, worker([answer()], requests), { continuation: { id } }),
      { code: "conflict" },
    );
  } finally {
    await handle.close();
  }
});

test("response repairs continue the conversation with read-only tools only", async (t) => {
  const requests: ModelRequest[] = [];
  const result = await run(
    t,
    undefined,
    worker(
      [answer("<data>not json</data>"), answer('<data>{"ok":true}</data>')],
      requests,
    ),
    {
      brief: { text: "Return <data>JSON</data>" },
      response: response.json({
        tag: "data",
        repairs: 1,
        schema: (value) => value as { ok: boolean },
      }),
    },
  );
  assert.deepEqual(result.value, { ok: true });
  assert.deepEqual(
    requests.map((request) => request.tools?.map((tool) => tool.name)),
    [["echo", "touch"], ["echo"]],
  );
  assert.equal(requests[1]?.messages?.length, 3);
});

test("context strategies compact history and record it in the transcript", async (t) => {
  const root = await repository(t);
  const requests: ModelRequest[] = [];
  const events: AgentObservation[] = [];
  const long = "x".repeat(50);
  const truncated = await run(
    t,
    root,
    worker(
      [call("echo", { text: long }), call("echo", { text: long }), answer()],
      requests,
      { context: truncateToolResults({ keepRecent: 1, maxCharacters: 10 }) },
    ),
    { observe: (event) => events.push(event) },
  );
  assert.deepEqual(texts(requests.at(-1)), [
    "first task",
    "tool-call",
    `result:${"x".repeat(10)}\n[earlier output truncated from 50 characters]`,
    "tool-call",
    `result:${long}`,
  ]);
  assert.ok(events.some((event) => event.kind === "compaction"));
  const transcript = await readFile(truncated.transcript!, "utf8");
  assert.match(transcript, /"type":"compaction"/);
  const summaries: ModelRequest[] = [];
  await run(
    t,
    root,
    worker(
      [
        call("echo", { text: long }),
        call("echo", { text: long }),
        (request) => {
          summaries.push(request);
          return {
            text: "Earlier: echoed text.",
            content: [{ type: "text", text: "Earlier: echoed text." }],
            stopReason: "end",
          };
        },
        answer(),
      ],
      requests,
      {
        context: summarizeHistory({
          triggerCharacters: 100,
          keepRecentMessages: 1,
        }),
      },
    ),
    { brief: { text: "task with history" } },
  );
  assert.match(summaries[0]?.system ?? "", /Summarize this earlier part/);
  assert.match(summaries[0]?.prompt ?? "", /\[tool call echo/);
  assert.deepEqual(texts(requests.at(-1)), [
    "task with history",
    "Summary of the earlier conversation:\nEarlier: echoed text.",
    "tool-call",
    `result:${long}`,
  ]);
});

test("transport-backed stores persist harness transcripts beyond the host file", async (t) => {
  const root = await repository(t);
  const storage = await repository(t);
  const requests: ModelRequest[] = [];
  const conversations = transportConversations("harness", {
    transporter: localTransport({ directory: join(storage, "objects") }),
    namespace: "team",
  });
  const first = await run(
    t,
    root,
    worker([answer()], requests, { conversations }),
  );
  assert.ok(first.transcriptReference);
  await rm(first.transcript!, { force: true });
  await run(t, root, worker([answer()], requests, { conversations }), {
    continuation: { id: first.conversation! },
    brief: { text: "later" },
  });
  assert.deepEqual(texts(requests.at(-1)), ["first task", done, "later"]);
});
