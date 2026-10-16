import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import { once } from "node:events";
import {
  createOpenAIModelProvider,
  createAnthropicModelProvider,
  createSystemOneDecisionProvider,
  OutpostError,
  quotaFault,
  unavailableFault,
} from "../../src/index.ts";

test("HTTP error body reads still honor cancellation and request deadlines", async (t) => {
  const server = createServer((_request, response) => {
    response.writeHead(400);
    response.write('{"error":');
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
    baseUrl: `http://127.0.0.1:${address.port}`,
    apiKey: false as const,
  };
  await assert.rejects(
    createOpenAIModelProvider({ ...options, timeoutMs: 50 }).request({
      model: "model",
      prompt: "test",
    }),
    { code: "timeout" },
  );
  await assert.rejects(
    createOpenAIModelProvider(options).request({
      model: "model",
      prompt: "test",
      signal: AbortSignal.timeout(50),
    }),
    { code: "aborted" },
  );
});

test("HTTP model and decision errors retain bounded safe diagnostics and classify structured failures", async (t) => {
  let status = 400;
  let body = "";
  const server = createServer((_request, response) => {
    response.writeHead(status, { "Retry-After": "2" });
    response.end(body);
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
    apiKey: "secret-key",
    maxResponseBytes: 1024,
  };
  const models = [
    createOpenAIModelProvider(options),
    createOpenAIModelProvider({ ...options, api: "responses" }),
    createAnthropicModelProvider(options),
  ];
  const request = {
    model: "model",
    prompt: "private prompt",
    maxOutputTokens: 32,
  };
  const calls: (() => Promise<unknown>)[] = models.flatMap((model) => [
    () => model.request(request),
    async () => {
      for await (const _event of model.stream!(request)) {
      }
    },
  ]);
  calls.push(() =>
    createSystemOneDecisionProvider(options).request({
      model: "model",
      state: "private prompt",
      questions: { choice: { type: "noul", instructions: "Choose" } },
    }),
  );
  for (const call of calls) {
    for (const [nextStatus, error, expectedCode, unavailable] of [
      [
        400,
        { type: "invalid_request_error", code: "insufficient_quota" },
        "quota",
        false,
      ],
      [400, { type: "overloaded_error" }, "provider", true],
      [
        422,
        { type: "invalid_request_error", code: "invalid_api_key" },
        "provider",
        false,
      ],
    ] as const) {
      status = nextStatus;
      body = JSON.stringify({
        error: {
          ...error,
          message: "secret-key private prompt",
          param: "secret-key",
        },
      });
      await assert.rejects(call(), (fault: unknown) => {
        assert.ok(fault instanceof OutpostError);
        assert.equal(fault.code, expectedCode);
        assert.equal(fault.details.status, status);
        assert.equal(fault.details.type, error.type);
        if ("code" in error) assert.equal(fault.details.code, error.code);
        assert.equal(Boolean(unavailableFault(fault)), unavailable);
        assert.equal(fault.details.retryAfterMs, 2000);
        assert.doesNotMatch(
          fault.message + JSON.stringify(fault),
          /secret-key|private prompt/,
        );
        return true;
      });
    }
    for (const payload of [
      "not JSON secret-key",
      "x".repeat(2048),
      JSON.stringify({
        error: {
          type: "secret-key",
          code: "private_prompt",
          message: "secret-key",
        },
      }),
    ]) {
      status = 429;
      body = payload;
      await assert.rejects(call(), (fault: unknown) => {
        assert.ok(quotaFault(fault));
        assert.ok(fault instanceof OutpostError);
        assert.equal(fault.details.status, 429);
        assert.doesNotMatch(
          fault.message + JSON.stringify(fault),
          /secret-key|private_prompt|not JSON/,
        );
        return true;
      });
    }
  }
});

test("Anthropic spending limits are quota faults without reclassifying ordinary invalid requests", async (t) => {
  let message = "";
  const server = createServer((_request, response) => {
    response.writeHead(400);
    response.end(
      JSON.stringify({ error: { type: "invalid_request_error", message } }),
    );
  });
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const provider = createAnthropicModelProvider({
    baseUrl: `http://127.0.0.1:${address.port}`,
    apiKey: "secret",
  });
  for (const [text, quota] of [
    [
      "You have reached your specified API usage limits. Please try again later.",
      true,
    ],
    ["You have reached your specified workspace API usage limits.", true],
    [
      "Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing.",
      true,
    ],
    [
      "messages: invalid value 'Your credit balance is too low to access the Anthropic API.'",
      false,
    ],
    ["max_tokens: invalid value", false],
  ] as const) {
    message = text;
    await assert.rejects(
      provider.request({ model: "model", prompt: "test", maxOutputTokens: 32 }),
      (fault: unknown) => {
        assert.equal(Boolean(quotaFault(fault)), quota);
        return true;
      },
    );
  }
});
