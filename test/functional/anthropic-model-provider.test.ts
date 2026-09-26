import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import { once } from "node:events";
import { anthropicModelProvider } from "../../src/index.ts";
import { readAnthropicResponse } from "../../src/adapters/models/anthropic-response.ts";

const message = {
  type: "message",
  role: "assistant",
  stop_reason: "end_turn",
  content: [{ type: "text", text: "answer" }],
  usage: {
    input_tokens: 3,
    output_tokens: 2,
    cache_creation_input_tokens: 7,
    cache_read_input_tokens: 11,
  },
};

test("Anthropic sends model per request with explicit system cache and normalized usage", async (t) => {
  const requests: {
    url: string | undefined;
    key: string | undefined;
    version: string | undefined;
    body: unknown;
  }[] = [];
  let status = 200;
  const server = createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    requests.push({
      url: request.url,
      key: request.headers["x-api-key"] as string | undefined,
      version: request.headers["anthropic-version"] as string | undefined,
      body: JSON.parse(body),
    });
    response.writeHead(status);
    response.end(JSON.stringify(message));
  });
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const options = {
    baseUrl: `http://127.0.0.1:${address.port}/v1`,
    apiKey: "secret",
  };
  const provider = anthropicModelProvider({ ...options, cacheSystem: true });
  assert.equal(requests.length, 0);
  const result = await provider.request({
    model: "arbitrary-model",
    prompt: "hello",
    system: "stable",
    maxOutputTokens: 12,
  });
  assert.deepEqual(result, {
    text: "answer",
    content: [{ type: "text", text: "answer" }],
    stopReason: "end",
    usage: { input: 21, cached: 11, cacheCreated: 7, output: 2 },
  });
  assert.equal(
    provider.identity,
    `anthropic:messages:http://127.0.0.1:${address.port}/v1`,
  );
  assert.deepEqual(requests[0], {
    url: "/v1/messages",
    key: "secret",
    version: "2023-06-01",
    body: {
      model: "arbitrary-model",
      max_tokens: 12,
      stream: false,
      messages: [{ role: "user", content: "hello" }],
      system: [
        { type: "text", text: "stable", cache_control: { type: "ephemeral" } },
      ],
    },
  });
  await assert.rejects(
    provider.request({ model: "m", prompt: "hi" }),
    /System cache/,
  );
  const uncached = anthropicModelProvider(options);
  await uncached.request({
    model: "other",
    prompt: "hello",
    system: "plain",
    maxOutputTokens: 64,
    reasoning: "xhigh",
  });
  assert.deepEqual(requests.at(-1)?.body, {
    model: "other",
    max_tokens: 64,
    thinking: { type: "adaptive" },
    output_config: { effort: "xhigh" },
    stream: false,
    messages: [{ role: "user", content: "hello" }],
    system: "plain",
  });
  await uncached.request({
    model: "other",
    prompt: "hello",
    maxOutputTokens: 8,
    reasoning: "none",
  });
  assert.deepEqual(requests.at(-1)?.body, {
    model: "other",
    max_tokens: 8,
    thinking: { type: "disabled" },
    stream: false,
    messages: [{ role: "user", content: "hello" }],
  });
  const sent = requests.length;
  await assert.rejects(
    uncached.request({ model: "other", prompt: "hello" }),
    /maxOutputTokens/,
  );
  await assert.rejects(
    uncached.request({
      model: "other",
      prompt: "hello",
      maxOutputTokens: 8,
      reasoning: "minimal",
    }),
    /reasoning "minimal"/,
  );
  assert.equal(requests.length, sent);
  for (const code of [401, 404, 429]) {
    status = code;
    await assert.rejects(
      uncached.request({
        model: "missing",
        prompt: "private",
        maxOutputTokens: 1,
      }),
      (error) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, new RegExp(`HTTP ${code}`));
        assert.doesNotMatch(JSON.stringify(error), /secret|private/);
        return true;
      },
    );
  }
  status = 200;
  const count = requests.length;
  await assert.rejects(
    uncached.request({
      model: "m",
      prompt: "hi",
      maxOutputTokens: 1,
      signal: AbortSignal.abort(),
    }),
    { code: "aborted" },
  );
  assert.equal(requests.length, count);
  assert.equal(
    (
      await uncached.request({
        model: "reused",
        prompt: "hi",
        maxOutputTokens: 1,
      })
    ).text,
    "answer",
  );
});

test("Anthropic rejects invalid configuration and unsupported or incomplete responses", () => {
  const provider = anthropicModelProvider({ apiKey: "key" });
  assert.throws(
    () => provider.validate?.({ name: "model" }),
    /maxOutputTokens on the agent model/,
  );
  assert.throws(
    () =>
      provider.validate?.({
        name: "model",
        maxOutputTokens: 1,
        reasoning: "minimal",
      }),
    /reasoning "minimal"/,
  );
  provider.validate?.({ name: "model", maxOutputTokens: 1, reasoning: "max" });
  assert.throws(
    () =>
      anthropicModelProvider({
        apiKey: "key",
        // @ts-expect-error Output limits belong to the agent model.
        maxOutputTokens: 1,
      }),
    /Unsupported/,
  );
  assert.throws(() => anthropicModelProvider({ apiKey: "" }), /apiKey/);
  assert.throws(
    () =>
      anthropicModelProvider({
        // @ts-expect-error No implicit unauthenticated Anthropic calls.
        apiKey: false,
      }),
    /API key/,
  );
  assert.throws(
    () =>
      anthropicModelProvider({
        apiKey: "key",
        // @ts-expect-error Cache configuration is validated for JavaScript callers.
        cacheSystem: "yes",
      }),
    /cacheSystem/,
  );
  assert.throws(
    () =>
      anthropicModelProvider({
        apiKey: "key",
        // @ts-expect-error Unsupported options must not be silently ignored.
        tools: [],
      }),
    /Unsupported/,
  );
  for (const value of [
    null,
    {},
    { ...message, stop_reason: "pause_turn" },
    { ...message, stop_reason: "toString" },
    { ...message, stop_reason: "tool_use" },
    { ...message, content: [{ type: "tool_use" }] },
    { ...message, content: [{ type: "server_tool_use" }] },
    { ...message, content: [] },
    { ...message, usage: { input_tokens: -1, output_tokens: 1 } },
  ])
    assert.throws(() => readAnthropicResponse(value), { code: "response" });
  assert.deepEqual(readAnthropicResponse({ ...message, usage: undefined }), {
    text: "answer",
    content: [{ type: "text", text: "answer" }],
    stopReason: "end",
  });
  assert.equal(
    readAnthropicResponse({ ...message, stop_reason: "max_tokens" }).stopReason,
    "max-tokens",
  );
  assert.equal(
    readAnthropicResponse({ ...message, stop_reason: "refusal" }).stopReason,
    "refusal",
  );
  const called = readAnthropicResponse(
    {
      ...message,
      stop_reason: "tool_use",
      content: [
        { type: "thinking", thinking: "", signature: "sig" },
        { type: "tool_use", id: "t1", name: "read", input: { path: "a" } },
      ],
    },
    { identity: "anthropic:test", model: "claude" },
  );
  assert.deepEqual(called.content, [
    {
      type: "reasoning",
      provider: "anthropic:test",
      model: "claude",
      data: { type: "thinking", thinking: "", signature: "sig" },
    },
    { type: "tool-call", id: "t1", name: "read", input: { path: "a" } },
  ]);
  assert.deepEqual(
    readAnthropicResponse({
      ...message,
      usage: { input_tokens: 3, output_tokens: 2 },
    }).usage,
    { input: 3, output: 2, cached: 0, cacheCreated: 0 },
  );
});
