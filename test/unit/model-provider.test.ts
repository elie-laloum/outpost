import assert from "node:assert/strict";
import { test } from "node:test";
import {
  openaiModelProvider,
  OutpostError,
  type ModelToolSpec,
} from "../../src/index.ts";
import { readChatCompletion } from "../../src/adapters/models/openai-chat.ts";
import { readModelResponse } from "../../src/adapters/models/openai-responses.ts";
import { modelJson } from "../../src/adapters/models/model-http.ts";

const options = {
  baseUrl: "http://localhost/v1",

  apiKey: false,
} as const;
const chat = (content: unknown = "hello") => ({
  choices: [{ finish_reason: "stop", message: { role: "assistant", content } }],
});
const message = (text = "hello") => ({
  type: "message",
  role: "assistant",
  status: "completed",
  content: [{ type: "output_text", text }],
});
const responses = (output: unknown = [message()]) => ({
  status: "completed",
  output,
});

test("model provider rejects invalid configuration before networking", () => {
  for (const baseUrl of [
    "relative",
    "ftp://host",
    "https://user:secret@host",
    "https://host?key=x",
    "https://host#x",
  ])
    assert.throws(() => openaiModelProvider({ ...options, baseUrl }), {
      code: "configuration",
    });

  for (const apiKey of ["", " ", "secret\nheader"])
    assert.throws(() => openaiModelProvider({ ...options, apiKey }), /apiKey/);
  for (const timeoutMs of [0, -1, Infinity, 1.5, 2 ** 31])
    assert.throws(
      () => openaiModelProvider({ ...options, timeoutMs }),
      /timeoutMs/,
    );
  assert.throws(
    () => openaiModelProvider({ ...options, maxResponseBytes: 0 }),
    /maxResponseBytes/,
  );
  assert.throws(
    // @ts-expect-error Unsupported protocols must also fail for JavaScript callers.
    () => openaiModelProvider({ ...options, api: "toString" }),
    /protocol/,
  );
});

test("text-only requests reject unsupported capabilities and invalid input", async () => {
  const provider = openaiModelProvider(options);
  for (const model of ["", "  "])
    await assert.rejects(
      provider.request({ model, prompt: "hi" }),
      /Model name/,
    );
  await assert.rejects(
    provider.request({ model: "model", prompt: " " }),
    /prompt/,
  );
  await assert.rejects(
    provider.request({ model: "model", prompt: "hi", maxOutputTokens: 0 }),
    /maxOutputTokens/,
  );
  await assert.rejects(
    // @ts-expect-error Runtime JavaScript callers cannot silently request streaming.
    provider.request({ model: "model", prompt: "hi", stream: true }),
    /Unsupported/,
  );
  for (const tools of [
    [{ name: "bad name", description: "", inputSchema: {} }],
    [{ name: "run", description: "", inputSchema: [] }],
    [
      { name: "run", description: "", inputSchema: {} },
      { name: "run", description: "", inputSchema: {} },
    ],
  ])
    await assert.rejects(
      provider.request({
        model: "model",
        prompt: "hi",
        tools: tools as unknown as ModelToolSpec[],
      }),
      /Model tools/,
    );
  await assert.rejects(
    // @ts-expect-error Runtime validation rejects non-boolean cache flags.
    provider.request({ model: "model", prompt: "hi", cache: "yes" }),
    /cache/,
  );
  await assert.rejects(
    // @ts-expect-error Runtime input validation must reject non-text instructions.
    provider.request({ model: "model", prompt: "hi", system: 2 }),
    /instructions/,
  );
  // @ts-expect-error Runtime input validation must reject null.
  await assert.rejects(provider.request(null), /object/);
});

const ended = (text: string) => ({
  text,
  content: [{ type: "text", text }],
  stopReason: "end",
});

test("Chat Completions preserves text and optional reported usage", () => {
  assert.deepEqual(readChatCompletion(chat(" héllo\n")), ended(" héllo\n"));
  assert.deepEqual(
    readChatCompletion({
      ...chat(),
      usage: {
        prompt_tokens: 10,
        completion_tokens: 4,
        prompt_tokens_details: { cached_tokens: 3 },
      },
    }),
    { ...ended("hello"), usage: { input: 10, output: 4, cached: 3 } },
  );
  assert.deepEqual(
    readChatCompletion({
      ...chat(),
      usage: { prompt_tokens: 0, completion_tokens: 0 },
    }).usage,
    { input: 0, output: 0, cached: 0 },
  );
});

test("Responses collects output text after reasoning with actual usage", () => {
  assert.deepEqual(
    readModelResponse(
      responses([{ type: "reasoning" }, message("one"), message("two")]),
      { identity: "openai:responses:test", model: "m" },
    ),
    {
      text: "onetwo",
      content: [
        {
          type: "reasoning",
          provider: "openai:responses:test",
          model: "m",
          data: { type: "reasoning" },
        },
        { type: "text", text: "one" },
        { type: "text", text: "two" },
      ],
      stopReason: "end",
    },
  );
  assert.deepEqual(
    readModelResponse({
      ...responses(),
      usage: {
        input_tokens: 5,
        output_tokens: 2,
        input_tokens_details: { cached_tokens: 1 },
      },
    }).usage,
    { input: 5, output: 2, cached: 1 },
  );
});

test("decoders normalize tool calls, limits and refusals", () => {
  const called = readChatCompletion({
    choices: [
      {
        finish_reason: "tool_calls",
        message: {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call-1",
              type: "function",
              function: { name: "read", arguments: '{"path":"a"}' },
            },
            {
              id: "call-2",
              type: "function",
              function: { name: "read", arguments: "{broken" },
            },
          ],
        },
      },
    ],
  });
  assert.equal(called.stopReason, "tool-calls");
  assert.deepEqual(called.content, [
    { type: "tool-call", id: "call-1", name: "read", input: { path: "a" } },
    { type: "tool-call", id: "call-2", name: "read", input: "{broken" },
  ]);
  assert.equal(
    readChatCompletion({
      choices: [
        {
          finish_reason: "stop",
          message: {
            role: "assistant",
            content: "",
            tool_calls: [
              {
                id: "c",
                type: "function",
                function: { name: "t", arguments: "{}" },
              },
            ],
          },
        },
      ],
    }).stopReason,
    "tool-calls",
  );
  assert.equal(
    readChatCompletion({
      choices: [{ ...chat().choices[0], finish_reason: "length" }],
    }).stopReason,
    "max-tokens",
  );
  assert.equal(
    readChatCompletion({
      choices: [{ ...chat().choices[0], finish_reason: "content_filter" }],
    }).stopReason,
    "refusal",
  );
  assert.equal(
    readChatCompletion({
      choices: [
        {
          finish_reason: "stop",
          message: { role: "assistant", content: null, refusal: "no" },
        },
      ],
    }).stopReason,
    "refusal",
  );
  const responseCall = readModelResponse(
    responses([
      { type: "reasoning", id: "rs", encrypted_content: "x" },
      { type: "function_call", call_id: "c1", name: "run", arguments: "{}" },
    ]),
  );
  assert.equal(responseCall.stopReason, "tool-calls");
  assert.deepEqual(responseCall.content?.[1], {
    type: "tool-call",
    id: "c1",
    name: "run",
    input: {},
  });
  assert.equal(
    readModelResponse({
      status: "incomplete",
      incomplete_details: { reason: "max_output_tokens" },
      output: [{ ...message("partial"), status: "incomplete" }],
    }).stopReason,
    "max-tokens",
  );
  assert.equal(
    readModelResponse(
      responses([
        { ...message(), content: [{ type: "refusal", refusal: "no" }] },
      ]),
    ).stopReason,
    "refusal",
  );
});

test("decoders reject incomplete, refused, malformed and tool responses", () => {
  for (const value of [
    null,
    [],
    {},
    chat(null),
    { choices: [] },
    { choices: [chat().choices[0], chat().choices[0]] },
  ])
    assert.throws(() => readChatCompletion(value), { code: "response" });
  for (const finish_reason of ["tool_calls", "function_call", null])
    assert.throws(
      () =>
        readChatCompletion({
          choices: [{ ...chat().choices[0], finish_reason }],
        }),
      OutpostError,
    );
  for (const extra of [
    { refusal: 1 },
    { tool_calls: [{}] },
    { function_call: {} },
    { role: "user" },
  ])
    assert.throws(
      () =>
        readChatCompletion({
          choices: [
            {
              finish_reason: "stop",
              message: { role: "assistant", content: "hello", ...extra },
            },
          ],
        }),
      OutpostError,
    );
  for (const value of [
    { ...responses(), status: "incomplete" },
    { ...responses(), error: {} },
    responses([]),
    responses([{ type: "function_call" }]),
    responses([{ ...message(), status: "incomplete" }]),
    responses([{ ...message(), content: [{ type: "refusal" }] }]),
    responses({}),
  ])
    assert.throws(() => readModelResponse(value), { code: "response" });
  for (const usage of [
    {},
    { prompt_tokens: -1, completion_tokens: 1 },
    { prompt_tokens: 2, completion_tokens: "1" },
    {
      prompt_tokens: 1,
      completion_tokens: 2,
      prompt_tokens_details: { cached_tokens: 2 },
    },
  ])
    assert.throws(() => readChatCompletion({ ...chat(), usage }), {
      code: "response",
    });
});

test("JSON response reader rejects empty, oversized and invalid bodies", async () => {
  await assert.rejects(modelJson(new Response(null), 100), /no body/);
  await assert.rejects(modelJson(new Response("not JSON"), 100), /valid JSON/);
  await assert.rejects(
    modelJson(new Response('"hello"'), 2),
    /maxResponseBytes/,
  );
});
