import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { createServer, type ServerResponse } from "node:http";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import {
  agent,
  anthropicModelProvider,
  defineHarnessTool,
  dispatch,
  harness,
  openaiModelProvider,
  type AgentObservation,
  type ModelProvider,
  type ModelStreamEvent,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

type Handler = (
  response: ServerResponse,
  body: Record<string, unknown>,
) => Promise<void>;

async function serve(t: TestContext, handlers: Handler[]) {
  const bodies: Record<string, unknown>[] = [];
  const server = createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    const parsed = JSON.parse(body);
    bodies.push(parsed);
    await handlers.shift()!(response, parsed);
  });
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  return { baseUrl: `http://127.0.0.1:${address.port}/v1`, bodies };
}

const sse =
  (events: unknown[], pauseMs = 0): Handler =>
  async (response) => {
    response.writeHead(200, { "content-type": "text/event-stream" });
    for (const event of events) {
      response.write(
        `data: ${typeof event === "string" ? event : JSON.stringify(event)}\n\n`,
      );
      if (pauseMs) await delay(pauseMs);
    }
    response.end();
  };

async function collect(stream: AsyncIterable<ModelStreamEvent>) {
  let text = "";
  let result: ModelStreamEvent | undefined;
  for await (const event of stream) {
    if (event.type === "text-delta") text += event.text;
    if (event.type === "result") result = event;
  }
  assert.ok(result?.type === "result");
  return { text, result: result.result };
}

const anthropicEvents = (text: string, stop = "end_turn") => [
  {
    type: "message_start",
    message: {
      type: "message",
      role: "assistant",
      content: [],
      usage: { input_tokens: 3, output_tokens: 0 },
    },
  },
  {
    type: "content_block_start",
    index: 0,
    content_block: { type: "text", text: "" },
  },
  ...[...text].map((character) => ({
    type: "content_block_delta",
    index: 0,
    delta: { type: "text_delta", text: character },
  })),
  { type: "content_block_stop", index: 0 },
  {
    type: "message_delta",
    delta: { stop_reason: stop },
    usage: { output_tokens: 2 },
  },
  { type: "message_stop" },
];

test("providers stream deltas and final results for the three protocols", async (t) => {
  const { baseUrl, bodies } = await serve(t, [
    sse([
      { choices: [{ delta: { role: "assistant", content: "Hi" } }] },
      { choices: [{ delta: { content: "!" }, finish_reason: "stop" }] },
      { choices: [], usage: { prompt_tokens: 2, completion_tokens: 1 } },
      "[DONE]",
    ]),
    sse([
      { type: "response.output_text.delta", delta: "Yo" },
      {
        type: "response.completed",
        response: {
          status: "completed",
          output: [
            {
              type: "message",
              role: "assistant",
              status: "completed",
              content: [{ type: "output_text", text: "Yo" }],
            },
          ],
        },
      },
    ]),
    sse(anthropicEvents("Hey")),
    async (response) => {
      response.writeHead(503);
      response.end("busy");
    },
  ]);
  const chat = await collect(
    openaiModelProvider({ baseUrl, apiKey: false }).stream!({
      model: "m",
      prompt: "hello",
    }),
  );
  assert.equal(chat.text, "Hi!");
  assert.equal(chat.result.text, "Hi!");
  assert.deepEqual(chat.result.usage, { input: 2, output: 1, cached: 0 });
  assert.equal(bodies[0]?.stream, true);
  assert.deepEqual(bodies[0]?.stream_options, { include_usage: true });
  const responses = await collect(
    openaiModelProvider({ baseUrl, apiKey: false, api: "responses" }).stream!({
      model: "m",
      prompt: "hello",
    }),
  );
  assert.equal(responses.text, "Yo");
  assert.equal(responses.result.stopReason, "end");
  assert.equal(bodies[1]?.stream, true);
  const anthropic = await collect(
    anthropicModelProvider({ baseUrl, apiKey: "key" }).stream!({
      model: "m",
      prompt: "hello",
      maxOutputTokens: 10,
    }),
  );
  assert.equal(anthropic.text, "Hey");
  assert.deepEqual(anthropic.result.usage, {
    input: 3,
    cached: 0,
    cacheCreated: 0,
    output: 2,
  });
  await assert.rejects(
    collect(
      openaiModelProvider({ baseUrl, apiKey: false }).stream!({
        model: "m",
        prompt: "hello",
      }),
    ),
    { code: "provider", details: { status: 503 } },
  );
});

test("stream timeouts measure inactivity between chunks", async (t) => {
  const { baseUrl } = await serve(t, [
    sse(anthropicEvents("slowly"), 40),
    async (response) => {
      response.writeHead(200, { "content-type": "text/event-stream" });
      response.write(`data: ${JSON.stringify(anthropicEvents("x")[0])}\n\n`);
      await delay(500);
      response.end();
    },
  ]);
  const provider = anthropicModelProvider({
    baseUrl,
    apiKey: "key",
    timeoutMs: 150,
  });
  const started = Date.now();
  const { text } = await collect(
    provider.stream!({ model: "m", prompt: "hi", maxOutputTokens: 5 }),
  );
  assert.equal(text, "slowly");
  assert.ok(Date.now() - started > 150);
  await assert.rejects(
    collect(provider.stream!({ model: "m", prompt: "hi", maxOutputTokens: 5 })),
    { code: "timeout" },
  );
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    collect(
      provider.stream!({
        model: "m",
        prompt: "hi",
        maxOutputTokens: 5,
        signal: controller.signal,
      }),
    ),
    { code: "aborted" },
  );
});

test("the harness streams text deltas to observers but not to non-verbose journals", async (t) => {
  const root = await repository(t);
  const { baseUrl } = await serve(t, [
    sse([
      {
        type: "message_start",
        message: {
          type: "message",
          role: "assistant",
          content: [],
          usage: { input_tokens: 1, output_tokens: 0 },
        },
      },
      {
        type: "content_block_start",
        index: 0,
        content_block: { type: "tool_use", id: "t1", name: "echo", input: {} },
      },
      {
        type: "content_block_delta",
        index: 0,
        delta: { type: "input_json_delta", partial_json: '{"text":"ok"}' },
      },
      { type: "content_block_stop", index: 0 },
      {
        type: "message_delta",
        delta: { stop_reason: "tool_use" },
        usage: { output_tokens: 1 },
      },
    ]),
    sse(anthropicEvents("<outpost>done</outpost>")),
  ]);
  const echo = defineHarnessTool({
    name: "echo",
    description: "Echo.",
    readOnly: true,
    input: { type: "object", properties: { text: { type: "string" } } },
    execute: (input: { text?: string }) => input.text ?? "",
  });
  const events: AgentObservation[] = [];
  const log = join(root, "journal.jsonl");
  const provider: ModelProvider = anthropicModelProvider({
    baseUrl,
    apiKey: "key",
  });
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: agent({
      model: { name: "m", maxOutputTokens: 50 },
      harness: harness({ modelProvider: provider, tools: [echo] }),
    }),
    brief: { text: "stream" },
    logging: { file: log },
    observe: (event) => events.push(event),
  });
  assert.equal(result.completed, true);
  assert.equal(
    events
      .filter((event) => event.kind === "text-delta")
      .map((event) => (event.kind === "text-delta" ? event.text : ""))
      .join(""),
    "<outpost>done</outpost>",
  );
  assert.deepEqual(result.usage, {
    input: 4,
    cached: 0,
    cacheCreated: 0,
    output: 3,
  });
  const journal = await readFile(log, "utf8");
  assert.doesNotMatch(journal, /"kind":"text-delta"/);
  assert.match(journal, /"kind":"tool-result"/);
});
