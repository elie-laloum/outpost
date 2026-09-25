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
    maxOutputTokens: 64,
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
    usage: { input: 21, cached: 11, cacheCreated: 7, output: 2 },
  });
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
  await uncached.request({ model: "other", prompt: "hello", system: "plain" });
  assert.deepEqual(requests.at(-1)?.body, {
    model: "other",
    max_tokens: 64,
    stream: false,
    messages: [{ role: "user", content: "hello" }],
    system: "plain",
  });
  await uncached.request({ model: "other", prompt: "hello" });
  for (const code of [401, 404, 429]) {
    status = code;
    await assert.rejects(
      uncached.request({ model: "missing", prompt: "private" }),
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
    uncached.request({ model: "m", prompt: "hi", signal: AbortSignal.abort() }),
    { code: "aborted" },
  );
  assert.equal(requests.length, count);
  assert.equal(
    (await uncached.request({ model: "reused", prompt: "hi" })).text,
    "answer",
  );
});

test("Anthropic rejects invalid configuration and unsupported or incomplete responses", () => {
  for (const value of [0, -1, 1.5, Infinity])
    assert.throws(
      () => anthropicModelProvider({ apiKey: "key", maxOutputTokens: value }),
      /maxOutputTokens/,
    );
  assert.throws(
    () => anthropicModelProvider({ apiKey: "", maxOutputTokens: 1 }),
    /apiKey/,
  );
  assert.throws(
    () =>
      anthropicModelProvider({
        // @ts-expect-error No implicit unauthenticated Anthropic calls.
        apiKey: false,
        maxOutputTokens: 1,
      }),
    /API key/,
  );
  assert.throws(
    () =>
      anthropicModelProvider({
        apiKey: "key",
        maxOutputTokens: 1,
        // @ts-expect-error Cache configuration is validated for JavaScript callers.
        cacheSystem: "yes",
      }),
    /cacheSystem/,
  );
  assert.throws(
    () =>
      anthropicModelProvider({
        apiKey: "key",
        maxOutputTokens: 1,
        // @ts-expect-error Unsupported options must not be silently ignored.
        tools: [],
      }),
    /Unsupported/,
  );
  for (const value of [
    null,
    {},
    { ...message, stop_reason: "max_tokens" },
    { ...message, stop_reason: "refusal" },
    { ...message, content: [{ type: "tool_use" }] },
    { ...message, content: [] },
    { ...message, usage: { input_tokens: -1, output_tokens: 1 } },
  ])
    assert.throws(() => readAnthropicResponse(value), { code: "response" });
  assert.deepEqual(readAnthropicResponse({ ...message, usage: undefined }), {
    text: "answer",
  });
  assert.deepEqual(
    readAnthropicResponse({
      ...message,
      usage: { input_tokens: 3, output_tokens: 2 },
    }).usage,
    { input: 3, output: 2, cached: 0, cacheCreated: 0 },
  );
});
