import assert from "node:assert/strict";
import { test } from "node:test";
import {
  anthropicModelProvider,
  openaiModelProvider,
  OutpostError,
} from "../../src/index.ts";
import { retryAfterMs } from "../../src/adapters/models/retry-after.ts";

test("Retry-After supports seconds and HTTP dates and ignores malformed values", () => {
  const now = Date.parse("Wed, 21 Oct 2015 07:28:00 GMT");
  assert.equal(retryAfterMs("120", now), 120000);
  assert.equal(retryAfterMs("Wednesday, 21-Oct-15 07:28:02 GMT", now), 2000);
  assert.equal(retryAfterMs("Wed Oct 21 07:28:02 2015", now), 2000);
  assert.equal(retryAfterMs(" 0 ", now), 0);
  assert.equal(retryAfterMs("Wed, 21 Oct 2015 07:28:02 GMT", now), 2000);
  assert.equal(retryAfterMs("Wed, 21 Oct 2015 07:27:00 GMT", now), 0);
  for (const value of [
    null,
    "",
    "-1",
    "1.5",
    "1e3",
    "Infinity",
    "tomorrow",
    "Wed, 21 Oct 2015",
    "Wed, 21 Oct 2015 07:28:02 GMT trailing",
    "Wed, 99 Oct 2015 07:28:02 GMT",
    "Wed, nonsense",
    "99999999999999999999999",
  ])
    assert.equal(retryAfterMs(value, now), undefined);
});

test("HTTP failures preserve normalized Retry-After for both providers and streaming", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response("private error payload", {
        status: 429,
        headers: { "Retry-After": "2" },
      }),
  );
  const providers = [
    openaiModelProvider({ apiKey: false, baseUrl: "http://localhost" }),
    anthropicModelProvider({ apiKey: "test", baseUrl: "http://localhost" }),
  ];
  const check = (error: unknown) => {
    assert.ok(error instanceof OutpostError);
    assert.equal(error.code, "quota");
    const { resetAt, ...details } = error.details;
    assert.deepEqual(details, { status: 429, retryAfterMs: 2000 });
    assert.ok(Number.isFinite(Date.parse(String(resetAt))));
    assert.doesNotMatch(error.message, /private/);
    return true;
  };
  for (const provider of providers) {
    await assert.rejects(
      provider.request({
        model: "test",
        prompt: "hello",
        maxOutputTokens: 100,
      }),
      check,
    );
    await assert.rejects(async () => {
      for await (const event of provider.stream!({
        model: "test",
        prompt: "hello",
        maxOutputTokens: 100,
      }))
        void event;
    }, check);
  }
});

test("missing or invalid Retry-After retains the existing HTTP error shape", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(null, {
        status: 503,
        headers: { "Retry-After": "invalid" },
      }),
  );
  await assert.rejects(
    openaiModelProvider({ apiKey: false, baseUrl: "http://localhost" }).request(
      { model: "test", prompt: "hello", maxOutputTokens: 100 },
    ),
    (error: unknown) => {
      assert.ok(error instanceof OutpostError);
      assert.deepEqual(error.details, { status: 503, unavailable: "HTTP 503" });
      return true;
    },
  );
});
