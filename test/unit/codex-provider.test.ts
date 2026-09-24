import assert from "node:assert/strict";
import { test } from "node:test";
import { codex } from "../../src/index.ts";

test("custom Responses models preserve Codex execution, continuation and secret boundaries", () => {
  const adapter = codex({
    model: "vendor/model",
    modelProvider: {
      baseUrl: "https://models.example/v1",
      apiKeyEnvironment: "MODEL_API_KEY",
    },
    variables: { MODEL_API_KEY: "private-test-value" },
  });
  for (const input of [
    { text: "hello" },
    { text: "hello", interactive: true },
    { continuation: { id: "session", fork: true } },
  ]) {
    const request = adapter.request(input);
    const args = request.arguments ?? [];
    assert.ok(args.includes('model_provider="outpost_compatible"'));
    assert.ok(
      args.includes(
        'model_providers.outpost_compatible.env_key="MODEL_API_KEY"',
      ),
    );
    assert.ok(
      args.includes('model_providers.outpost_compatible.wire_api="responses"'),
    );
    assert.ok(
      args.includes(
        "model_providers.outpost_compatible.requires_openai_auth=false",
      ),
    );
    assert.ok(args.includes("vendor/model"));
    assert.ok(!JSON.stringify(request).includes("private-test-value"));
    if ("interactive" in input) assert.equal(request.interactive, true);
    if ("continuation" in input) assert.ok(args.includes("fork"));
  }
  assert.equal(adapter.variables?.MODEL_API_KEY, "private-test-value");
  const noKey = codex({
    model: "local",
    modelProvider: {
      baseUrl: "http://localhost:8000/v1",
      apiKeyEnvironment: false,
    },
  }).request({});
  assert.ok(!noKey.arguments?.some((arg) => arg.includes("env_key")));
  assert.ok(
    codex({
      model: "remote",
      modelProvider: { baseUrl: "https://models.example/v1" },
    })
      .request({})
      .arguments?.includes(
        'model_providers.outpost_compatible.env_key="OPENAI_API_KEY"',
      ),
  );
});

test("custom model configuration rejects missing models and unsafe URLs without exposing input", () => {
  assert.throws(
    () => codex({ modelProvider: { baseUrl: "https://models.example" } }),
    /model name/,
  );
  for (const baseUrl of [
    "invalid",
    "file:///etc/passwd",
    "https://user:secret@models.example",
    "https://models.example?key=secret",
    "https://models.example/#secret",
  ]) {
    assert.throws(
      () => codex({ model: "test", modelProvider: { baseUrl } }),
      (error: unknown) =>
        error instanceof Error && !error.message.includes("secret"),
    );
  }
  assert.throws(
    () =>
      codex({
        model: "test",
        modelProvider: {
          baseUrl: "https://models.example",
          apiKeyEnvironment: "KEY=secret",
        },
      }),
    /environment variable/,
  );
});
