import assert from "node:assert/strict";
import { test } from "node:test";
import { httpFailure } from "../../src/adapters/models/http-failure.ts";
import { MODEL_ERROR_BYTES } from "../../src/adapters/models/model.constants.ts";

test("HTTP error inspection cancels oversized bodies at its independent byte limit", async () => {
  for (const limit of [1024, MODEL_ERROR_BYTES * 2]) {
    let produced = 0,
      cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        produced += 4096;
        controller.enqueue(new Uint8Array(4096));
      },
      cancel() {
        cancelled = true;
      },
    });
    const fault = await httpFailure(
      new Response(body, { status: 503 }),
      limit,
      "Model",
    );
    assert.equal(cancelled, true);
    assert.ok(produced <= Math.min(limit, MODEL_ERROR_BYTES) + 8192);
    assert.deepEqual(fault.details, { status: 503, unavailable: "HTTP 503" });
  }
});

test("HTTP error diagnostics ignore unknown fields and retain recognized nested quota codes", async () => {
  const fault = await httpFailure(
    Response.json(
      {
        error: {
          type: "rate_limit_error",
          details: {
            error_code: "enforced_spend_limit_reached",
            private: "secret",
          },
          message: "secret",
        },
      },
      { status: 429 },
    ),
    MODEL_ERROR_BYTES,
    "Model",
  );
  assert.equal(fault.code, "quota");
  assert.equal(fault.details.code, "enforced_spend_limit_reached");
  assert.doesNotMatch(JSON.stringify(fault) + fault.message, /secret/);
});
