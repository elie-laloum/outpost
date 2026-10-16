import {
  encodeObject,
  decodeObject,
} from "../../src/infrastructure/transport-envelope.ts";
import { httpTransportFailure } from "../../src/infrastructure/http-transport.ts";
import { transferDestination } from "../../src/infrastructure/transfer-copy.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { responsesBody } from "../../src/adapters/models/openai-responses.ts";
import { createOpenAIModelProvider } from "../../src/adapters/models/openai-model-provider.ts";
import { defineAgentProfile } from "../../src/domain/agent-profile.ts";
import { validateEgress } from "../../src/domain/egress.ts";
import { OutpostError } from "../../src/domain/errors.ts";
import { retryDelay, validateRetry } from "../../src/domain/workflow/retry.ts";
import { transportKey } from "../../src/domain/transport.ts";
import { kimiRequest } from "../../src/adapters/agents/kimi/kimi-request.ts";
import { codexProvider } from "../../src/adapters/agents/codex/codex-provider.ts";
import { serverSentEvents } from "../../src/infrastructure/sse.ts";
import { validateCloudCaches } from "../../src/providers/cloud-cache.ts";
import { createLocalTransport } from "../../src/infrastructure/local-transport.ts";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("stateless Responses request portable reasoning and omit bare server references", () => {
  const body = responsesBody(
    {
      model: "fixture",
      messages: [
        { role: "user", content: [{ type: "text", text: "start" }] },
        {
          role: "assistant",
          content: [
            {
              type: "reasoning",
              provider: "fixture",
              model: "fixture",
              data: { type: "reasoning", id: "unavailable" },
            },
            {
              type: "reasoning",
              provider: "fixture",
              model: "fixture",
              data: { type: "reasoning", encrypted_content: "opaque" },
            },
            { type: "text", text: "answer" },
          ],
        },
        { role: "user", content: [{ type: "text", text: "continue" }] },
      ],
    },
    { identity: "fixture", model: "fixture" },
  );
  assert.equal(body.store, false);
  assert.deepEqual(body.include, ["reasoning.encrypted_content"]);
  assert.deepEqual(body.input, [
    { role: "user", content: "start" },
    { type: "reasoning", encrypted_content: "opaque" },
    { role: "assistant", content: "answer" },
    { role: "user", content: "continue" },
  ]);
});

test("invalid configuration fails before invocation without echoing credentials", () => {
  for (const key of ["private🔑", "private\u0000key", "private\tkey"]) {
    assert.throws(
      () =>
        createOpenAIModelProvider({
          apiKey: key,
          baseUrl: "https://example.test/v1",
        }),
      (error: unknown) =>
        error instanceof OutpostError &&
        error.code === "configuration" &&
        !error.message.includes(key),
    );
  }
  assert.throws(
    () =>
      codexProvider({
        model: { name: "fixture" },
        modelProvider: { baseUrl: "invalid" },
      }),
    { code: "configuration" },
  );
  assert.throws(
    () => kimiRequest({}, { text: "é".repeat(32769) }),
    /65536 UTF-8/,
  );
  assert.equal(kimiRequest({}, { text: "é".repeat(32768) }).executable, "kimi");
  for (const tool of ["shell: npm test", "shell:npm test "] as const)
    assert.throws(() => defineAgentProfile({ allowedTools: [tool] }), {
      code: "configuration",
    });
  assert.deepEqual(
    defineAgentProfile({ allowedTools: ["shell:npm test"] }).allowedTools,
    ["shell:npm test"],
  );
});

test("egress domain identity ignores case without changing CIDRs", () => {
  assert.deepEqual(
    validateEgress({
      mode: "allowlist",
      domains: ["Example.COM", "example.com"],
      denyCidrs: ["10.0.0.0/8"],
    }),
    {
      mode: "allowlist",
      domains: ["example.com"],
      allowCidrs: [],
      denyCidrs: ["10.0.0.0/8"],
    },
  );
});

test("server retry deadlines can refuse waiting without retrying early", () => {
  const fault = new OutpostError("quota", "retry later", {
    retryAfterMs: 1000,
  });
  assert.equal(
    retryDelay(
      { attempts: 2, maxDelayMs: 10, maxRetryAfterMs: 1000 },
      1,
      fault,
    ),
    1000,
  );
  assert.throws(
    () => retryDelay({ attempts: 2, maxRetryAfterMs: 999 }, 1, fault),
    (error) => error === fault,
  );
  const huge = new OutpostError("quota", "later", {
    retryAfterMs: Number.MAX_SAFE_INTEGER,
  });
  assert.throws(
    () => retryDelay(undefined, 1, huge),
    (error) => error === huge,
  );
  assert.throws(() => validateRetry({ attempts: 2, maxRetryAfterMs: -1 }));
});

test("portable transport keys reject Windows device names and trailing dots", () => {
  for (const key of ["CON", "prefix/nul.json", "LPT9.txt", "COM1", "trailing."])
    assert.throws(() => transportKey(key), /Invalid/);
  assert.equal(transportKey("console/COM10.json"), "console/COM10.json");
});

test("SSE comments and incomplete frames are not progress", async () => {
  let progress = 0;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of [": ping\n\n", ": ping\n\n", "data: par", "tial\n\n"])
        controller.enqueue(Buffer.from(chunk));
      controller.close();
    },
  });
  const events = [];
  for await (const event of serverSentEvents(body, 1024, () => progress++))
    events.push(event);
  assert.equal(progress, 1);
  assert.deepEqual(events, [{ data: "partial" }]);
});

test("cloud cache deadlines validate before allocation", () => {
  const cache = {
    name: "npm",
    path: "/home/agent/.npm",
    key: "v1",
    transport: createLocalTransport({
      directory: join(tmpdir(), "unused-audit-cache"),
    }),
  };
  for (const timeoutMs of [0, -1, 2 ** 31, NaN])
    assert.throws(
      () => validateCloudCaches([{ ...cache, timeoutMs }]),
      /timeoutMs/,
    );
  assert.doesNotThrow(() =>
    validateCloudCaches([{ ...cache, timeoutMs: 120000 }]),
  );
});

test(
  "macOS system directory aliases remain valid transfer ancestors",
  { skip: process.platform !== "darwin" },
  async () => {
    await assert.doesNotReject(
      transferDestination("/var/tmp/outpost-transfer-check/new-file"),
    );
    await assert.rejects(transferDestination("/var"), /symlink/);
  },
);

test("transport diagnostics preserve known failure codes without exposing raw causes", () => {
  const cause = Object.assign(new Error("https://private:key@example.test"), {
    code: "ECONNREFUSED",
  });
  assert.deepEqual(httpTransportFailure(new Error("fetch failed", { cause })), {
    unavailable: "HTTP transport failure",
    transportCode: "ECONNREFUSED",
  });
  assert.deepEqual(
    httpTransportFailure(
      Object.assign(new Error("secret"), { code: "PRIVATE_SECRET" }),
    ),
    { unavailable: "HTTP transport failure" },
  );
});

test("case-colliding transport identities have an explicit diagnostic", () => {
  const object = encodeObject("Upper/Key", Buffer.from("value"));
  assert.throws(
    () => decodeObject(object.data, "upper/key", 100),
    /key casing/,
  );
  assert.equal(
    Buffer.from(decodeObject(object.data, "Upper/Key", 100).bytes).toString(),
    "value",
  );
});
