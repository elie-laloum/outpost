import assert from "node:assert/strict";
import { test } from "node:test";
import { serverSentEvents } from "../../src/infrastructure/sse.ts";
import { anthropicStream } from "../../src/adapters/models/anthropic-stream.ts";
import { chatStream } from "../../src/adapters/models/openai-chat-stream.ts";
import { responsesStream } from "../../src/adapters/models/openai-responses-stream.ts";
import { readAnthropicResponse } from "../../src/adapters/models/anthropic-response.ts";
import { readChatCompletion } from "../../src/adapters/models/openai-chat.ts";
import type { StreamDecoder } from "../../src/adapters/models/model-protocol.types.ts";

const body = (...chunks: string[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks)
        controller.enqueue(new TextEncoder().encode(chunk));
      controller.close();
    },
  });

async function collect(stream: AsyncIterable<unknown>) {
  const values: unknown[] = [];
  for await (const value of stream) values.push(value);
  return values;
}

function feed(decoder: StreamDecoder, events: unknown[]) {
  return events
    .map((data) =>
      decoder.push({
        data: typeof data === "string" ? data : JSON.stringify(data),
      }),
    )
    .filter(Boolean)
    .join("");
}

test("server-sent events handle split frames, comments and line endings", async () => {
  let chunks = 0;
  assert.deepEqual(
    await collect(
      serverSentEvents(
        body(
          ": keep-alive\n\nevent: first\ndata: a\r",
          "\ndata: b\r\n\r\ndata",
          ": c\n\ndata:d\rdata: e",
        ),
        1_000,
        () => chunks++,
      ),
    ),
    [{ event: "first", data: "a\nb" }, { data: "c" }, { data: "d\ne" }],
  );
  assert.equal(chunks, 3);
  await assert.rejects(
    collect(serverSentEvents(body("data: 0123456789\n\n"), 5)),
    /maxResponseBytes/,
  );
});

test("Anthropic streams rebuild text, thinking and partial tool input", () => {
  const decoder = anthropicStream();
  const text = feed(decoder, [
    {
      type: "message_start",
      message: {
        type: "message",
        role: "assistant",
        content: [],
        usage: { input_tokens: 5, cache_read_input_tokens: 2 },
      },
    },
    { type: "ping" },
    {
      type: "content_block_start",
      index: 0,
      content_block: { type: "thinking", thinking: "" },
    },
    {
      type: "content_block_delta",
      index: 0,
      delta: { type: "thinking_delta", thinking: "hmm" },
    },
    {
      type: "content_block_delta",
      index: 0,
      delta: { type: "signature_delta", signature: "sig" },
    },
    { type: "content_block_stop", index: 0 },
    {
      type: "content_block_start",
      index: 1,
      content_block: { type: "text", text: "" },
    },
    {
      type: "content_block_delta",
      index: 1,
      delta: { type: "text_delta", text: "Hel" },
    },
    {
      type: "content_block_delta",
      index: 1,
      delta: { type: "text_delta", text: "lo" },
    },
    {
      type: "content_block_delta",
      index: 1,
      delta: { type: "citations_delta" },
    },
    { type: "content_block_stop", index: 1 },
    {
      type: "content_block_start",
      index: 2,
      content_block: { type: "tool_use", id: "t", name: "read", input: {} },
    },
    {
      type: "content_block_delta",
      index: 2,
      delta: { type: "input_json_delta", partial_json: '{"path":' },
    },
    {
      type: "content_block_delta",
      index: 2,
      delta: { type: "input_json_delta", partial_json: '"a"}' },
    },
    { type: "content_block_stop", index: 2 },
    {
      type: "message_delta",
      delta: { stop_reason: "tool_use" },
      usage: { output_tokens: 7 },
    },
    { type: "message_stop" },
  ]);
  assert.equal(text, "Hello");
  const result = readAnthropicResponse(decoder.final(), {
    identity: "anthropic:test",
    model: "m",
  });
  assert.equal(result.stopReason, "tool-calls");
  assert.deepEqual(result.content, [
    {
      type: "reasoning",
      provider: "anthropic:test",
      model: "m",
      data: { type: "thinking", thinking: "hmm", signature: "sig" },
    },
    { type: "text", text: "Hello" },
    { type: "tool-call", id: "t", name: "read", input: { path: "a" } },
  ]);
  assert.deepEqual(result.usage, {
    input: 7,
    cached: 2,
    cacheCreated: 0,
    output: 7,
  });
  const truncated = anthropicStream();
  feed(truncated, [
    {
      type: "message_start",
      message: { type: "message", role: "assistant", content: [] },
    },
    {
      type: "content_block_start",
      index: 0,
      content_block: { type: "tool_use", id: "t", name: "read" },
    },
    {
      type: "content_block_delta",
      index: 0,
      delta: { type: "input_json_delta", partial_json: '{"pa' },
    },
    { type: "content_block_stop", index: 0 },
    { type: "message_delta", delta: { stop_reason: "max_tokens" } },
  ]);
  assert.equal(
    readAnthropicResponse(truncated.final()).stopReason,
    "max-tokens",
  );
  assert.throws(
    () =>
      anthropicStream().push({
        data: JSON.stringify({
          type: "error",
          error: { type: "overloaded_error" },
        }),
      }),
    { code: "provider", details: { type: "overloaded_error" } },
  );
  assert.throws(() => anthropicStream().final(), { code: "response" });
  assert.throws(() => anthropicStream().push({ data: "{" }), /valid JSON/);
});

test("Chat Completions streams merge content, tool call fragments and usage", () => {
  const decoder = chatStream();
  const text = feed(decoder, [
    { choices: [{ delta: { role: "assistant", content: "" } }] },
    { choices: [{ delta: { content: "Hi " } }] },
    {
      choices: [
        {
          delta: {
            tool_calls: [
              {
                index: 0,
                id: "c1",
                type: "function",
                function: { name: "read", arguments: '{"pa' },
              },
            ],
          },
        },
      ],
    },
    {
      choices: [
        {
          delta: {
            tool_calls: [{ index: 0, function: { arguments: 'th":"a"}' } }],
          },
        },
      ],
    },
    { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
    { choices: [], usage: { prompt_tokens: 3, completion_tokens: 4 } },
    "[DONE]",
  ]);
  assert.equal(text, "Hi ");
  const result = readChatCompletion(decoder.final());
  assert.equal(result.stopReason, "tool-calls");
  assert.deepEqual(result.content, [
    { type: "text", text: "Hi " },
    { type: "tool-call", id: "c1", name: "read", input: { path: "a" } },
  ]);
  assert.deepEqual(result.usage, { input: 3, output: 4, cached: 0 });
  const refused = chatStream();
  feed(refused, [
    { choices: [{ delta: { refusal: "No." }, finish_reason: "stop" }] },
  ]);
  assert.equal(readChatCompletion(refused.final()).stopReason, "refusal");
  assert.throws(() => chatStream().final(), { code: "response" });
});

test("Responses streams return the completed response with deltas", () => {
  const decoder = responsesStream();
  const response = {
    status: "completed",
    output: [
      {
        type: "message",
        role: "assistant",
        status: "completed",
        content: [{ type: "output_text", text: "done" }],
      },
    ],
  };
  assert.equal(
    feed(decoder, [
      { type: "response.created" },
      { type: "response.output_text.delta", delta: "do" },
      { type: "response.output_text.delta", delta: "ne" },
      { type: "response.completed", response },
    ]),
    "done",
  );
  assert.deepEqual(decoder.final(), response);
  const incomplete = responsesStream();
  feed(incomplete, [
    { type: "response.incomplete", response: { status: "incomplete" } },
  ]);
  assert.deepEqual(incomplete.final(), { status: "incomplete" });
  assert.throws(
    () =>
      responsesStream().push({
        data: JSON.stringify({
          type: "response.failed",
          error: { type: "server_error" },
        }),
      }),
    { code: "provider" },
  );
  assert.throws(
    () =>
      responsesStream().push({
        data: JSON.stringify({ type: "error", type_: 1 }),
      }),
    { code: "provider" },
  );
  assert.throws(() => responsesStream().final(), { code: "response" });
});
