import assert from "node:assert/strict";
import { test } from "node:test";
import { openaiCompatible, OutpostError } from "../../src/index.ts";
import {
  readChatCompletion,
  readModelResponse,
} from "../../src/adapters/models/openai-response.ts";
import { modelJson } from "../../src/adapters/models/openai-http.ts";

const options = {
  baseUrl: "http://localhost/v1",
  model: "model",
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
    assert.throws(() => openaiCompatible({ ...options, baseUrl }), {
      code: "configuration",
    });
  for (const model of ["", "  "])
    assert.throws(() => openaiCompatible({ ...options, model }), /Model name/);
  for (const apiKey of ["", " ", "secret\nheader"])
    assert.throws(() => openaiCompatible({ ...options, apiKey }), /apiKey/);
  for (const timeoutMs of [0, -1, Infinity, 1.5, 2 ** 31])
    assert.throws(
      () => openaiCompatible({ ...options, timeoutMs }),
      /timeoutMs/,
    );
  assert.throws(
    () => openaiCompatible({ ...options, maxResponseBytes: 0 }),
    /maxResponseBytes/,
  );
  assert.throws(
    // @ts-expect-error Unsupported protocols must also fail for JavaScript callers.
    () => openaiCompatible({ ...options, api: "toString" }),
    /protocol/,
  );
});

test("text-only requests reject unsupported capabilities and invalid input", async () => {
  const provider = openaiCompatible(options);
  await assert.rejects(provider.generate({ prompt: " " }), /prompt/);
  await assert.rejects(
    provider.generate({ prompt: "hi", maxOutputTokens: 0 }),
    /maxOutputTokens/,
  );
  await assert.rejects(
    // @ts-expect-error Runtime JavaScript callers cannot silently request tools.
    provider.generate({ prompt: "hi", tools: [] }),
    /Unsupported/,
  );
  await assert.rejects(
    // @ts-expect-error Runtime input validation must reject non-text instructions.
    provider.generate({ prompt: "hi", system: 2 }),
    /instructions/,
  );
  // @ts-expect-error Runtime input validation must reject null.
  await assert.rejects(provider.generate(null), /object/);
});

test("Chat Completions preserves text and optional reported usage", () => {
  assert.deepEqual(readChatCompletion(chat(" héllo\n")), { text: " héllo\n" });
  assert.deepEqual(
    readChatCompletion({
      ...chat(),
      usage: {
        prompt_tokens: 10,
        completion_tokens: 4,
        prompt_tokens_details: { cached_tokens: 3 },
      },
    }),
    { text: "hello", usage: { input: 10, output: 4, cached: 3 } },
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
    ),
    { text: "onetwo" },
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
  for (const finish_reason of ["length", "tool_calls", "content_filter", null])
    assert.throws(
      () =>
        readChatCompletion({
          choices: [{ ...chat().choices[0], finish_reason }],
        }),
      OutpostError,
    );
  for (const extra of [
    { refusal: "no" },
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
