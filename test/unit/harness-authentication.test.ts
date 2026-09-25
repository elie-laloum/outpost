import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agent,
  codexHarness,
  claudeHarness,
  geminiHarness,
} from "../../src/index.ts";

test("harness authentication is explicit, validated and never exposes credentials in command arguments", () => {
  const seeded = agent({
    harness: codexHarness({
      authentication: { mode: "login", credentials: '{"tokens":{}}' },
    }),
  });
  const seed = seeded.authenticate?.({});
  assert.equal(seed?.stdin, '{"tokens":{}}');
  assert.ok(!seed?.arguments?.includes('{"tokens":{}}'));
  assert.throws(
    () =>
      agent({
        harness: codexHarness({
          authentication: { mode: "login", credentials: "invalid" },
        }),
      }),
    /credential JSON/,
  );
  assert.equal(
    agent({
      harness: codexHarness({ authentication: { mode: "login" } }),
    }).authenticate?.({}),
    undefined,
  );
  assert.throws(
    () =>
      agent({ harness: geminiHarness({ authentication: { mode: "login" } }) }),
    /Unsupported/,
  );
  assert.throws(
    () =>
      agent({
        harness: codexHarness({ authentication: { mode: "oauth-token" } }),
      }),
    /Unsupported/,
  );
  const api = agent({
    harness: codexHarness({
      authentication: { mode: "api-key", environment: "KEY" },
    }),
  });
  assert.throws(() => api.authenticate?.({}), /Missing KEY/);
  assert.equal(api.authenticate?.({ KEY: "fixture" })?.stdin, "fixture");
  assert.throws(
    () =>
      agent({
        harness: codexHarness({
          authentication: { mode: "api-key", environment: "INVALID-NAME" },
        }),
      }),
    /environment/,
  );
  const token = agent({
    harness: claudeHarness({ authentication: { mode: "oauth-token" } }),
  });
  assert.throws(
    () =>
      token.authenticate?.({
        CLAUDE_CODE_OAUTH_TOKEN: "x",
        ANTHROPIC_API_KEY: "y",
      }),
    /Conflicting/,
  );
  assert.equal(
    token.authenticate?.({ CLAUDE_CODE_OAUTH_TOKEN: "x" }),
    undefined,
  );
  const external = agent({
    model: "arbitrary",
    harness: codexHarness({
      modelProvider: {
        baseUrl: "http://localhost/v1",
        apiKeyEnvironment: "KEY",
      },
      authentication: { mode: "api-key", environment: "KEY" },
    }),
  });
  assert.equal(external.authenticate?.({ KEY: "x" }), undefined);
  const basic = agent({
    harness: geminiHarness({ authentication: { mode: "api-key" } }),
  });
  assert.equal(basic.authenticate?.({ GEMINI_API_KEY: "x" }), undefined);
});

test("CLI API keys cannot silently use unsupported environment names", () => {
  for (const preset of [claudeHarness, geminiHarness])
    assert.throws(
      () =>
        agent({
          harness: preset({
            authentication: { mode: "api-key", environment: "OTHER_KEY" },
          }),
        }),
      /standard authentication environment/,
    );
});
