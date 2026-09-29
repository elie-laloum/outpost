import assert from "node:assert/strict";
import { test } from "node:test";
import { turn } from "../../src/application/agent-turn.ts";
import { streamFailure } from "../../src/adapters/models/stream-events.ts";
import {
  createAgent,
  createAntigravityHarness,
  createAnthropicModelProvider,
  createClaudeHarness,
  createCodexHarness,
  createCopilotHarness,
  createKimiHarness,
  createOpenAIModelProvider,
  OutpostError,
  quotaFault,
  unavailableFault,
} from "../../src/index.ts";
import type { CliAgent } from "../../src/domain/agent.types.ts";
import type { CommandResult } from "../../src/domain/command.types.ts";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";
import { scripted } from "../helpers.ts";

test("CLI adapters recognize terminal outages and ignore retry notices", () => {
  const cases: readonly [CliAgent, readonly string[], readonly string[]][] = [
    [
      createAgent({ harness: createClaudeHarness() }),
      [
        'API Error: 529 {"type":"error","error":{"type":"overloaded_error"}}',
        "API Error: 500 Internal server error",
        "API Error (Connection error.)",
      ],
      [
        "API Error: 400 invalid_request_error",
        "Request rejected (429)",
        "API Error: 529 overloaded_error · Retrying in 2 seconds",
      ],
    ],
    [
      createAgent({ harness: createCodexHarness() }),
      [
        "exceeded retry limit, last status: 503 Service Unavailable",
        "stream disconnected before completion: error sending request",
      ],
      [
        "exceeded retry limit, last status: 429 Too Many Requests",
        "stream error: stream disconnected before completion; retrying 1/5 in 190ms",
        "Reconnecting... 2/5",
      ],
    ],
    [
      createAgent({ harness: createCopilotHarness() }),
      ["Server error: 503 Service Unavailable", "connect ECONNREFUSED"],
      ["GitHub Copilot CLI ended with exit code 1"],
    ],
    [
      createAgent({ harness: createKimiHarness() }),
      ["Error code: 503", "APIConnectionError: Connection error."],
      ["Error code: 400", "exceeded_current_quota_error"],
    ],
    [
      createAgent({ harness: createAntigravityHarness() }),
      ["UNAVAILABLE: model endpoint", "The model is overloaded."],
      ["RESOURCE_EXHAUSTED", "Antigravity ended the turn with status ERROR"],
    ],
  ];
  for (const [adapter, outage, other] of cases) {
    for (const text of outage)
      assert.equal(
        adapter.unavailable?.(text),
        true,
        `${adapter.name}: ${text}`,
      );
    for (const text of other)
      assert.equal(
        adapter.unavailable?.(text),
        false,
        `${adapter.name}: ${text}`,
      );
  }
});

function lease(
  stdout: readonly object[],
  outcome: CommandResult | OutpostError,
  stderr = "",
): SandboxLease {
  return {
    root: "/fixture",
    home: "/fixture",
    async invoke(command) {
      for (const line of stdout)
        command.observe?.("stdout", JSON.stringify(line) + "\n");
      if (stderr) command.observe?.("stderr", stderr);
      if (outcome instanceof OutpostError) throw outcome;
      return outcome;
    },
    async upload() {},
    async download() {},
    async release() {},
  };
}

const outageAgent: CliAgent = {
  ...scripted(""),
  quota: (text) => /usage limit/.test(text),
  unavailable: (text) => /overloaded/.test(text) && !/retrying/.test(text),
};

const run = (sandbox: SandboxLease, adapter: CliAgent = outageAgent) =>
  turn(
    sandbox,
    adapter,
    "test",
    { brief: { text: "test" } },
    undefined,
    [],
    1,
    {
      repository: "/fixture",
      repair: false,
    },
  );

const failed = { status: 1, stdout: "", stderr: "" };

test("a failed turn with an outage signal keeps its code and records the outage", async () => {
  await assert.rejects(
    run(lease([{ kind: "failure", message: "API overloaded" }], failed)),
    (error) => {
      assert.ok(error instanceof OutpostError);
      assert.equal(error.code, "process");
      assert.equal(error.details.unavailable, "API overloaded");
      assert.equal(error.details.agent, "fixture");
      assert.ok(error.cause instanceof OutpostError);
      assert.deepEqual(unavailableFault(error), { message: "API overloaded" });
      assert.equal(quotaFault(error), undefined);
      return true;
    },
  );
  await assert.rejects(
    run(lease([], failed, "retrying: overloaded\nfatal: overloaded\n")),
    (error) =>
      unavailableFault(error)?.message === "fatal: overloaded" &&
      error instanceof OutpostError &&
      error.code === "process",
  );
});

test("quota signals win over outages and unrelated failures stay unclassified", async () => {
  await assert.rejects(
    run(
      lease(
        [{ kind: "failure", message: "overloaded" }],
        failed,
        "usage limit\n",
      ),
    ),
    (error) =>
      error instanceof OutpostError &&
      error.code === "quota" &&
      unavailableFault(error) === undefined,
  );
  await assert.rejects(
    run(lease([], failed, "retrying: overloaded\n")),
    (error) =>
      error instanceof OutpostError &&
      error.code === "process" &&
      unavailableFault(error) === undefined,
  );
  await assert.rejects(
    run(lease([{ kind: "failure", message: "overloaded" }], failed), {
      ...scripted(""),
    }),
    (error) => unavailableFault(error) === undefined,
  );
  const result = await run(
    lease(
      [{ kind: "result", text: "done" }],
      { status: 0, stdout: "", stderr: "" },
      "overloaded\n",
    ),
  );
  assert.equal(result.text, "done");
});

test("a timeout after a reported connection failure is an outage without leaking the text", async () => {
  await assert.rejects(
    run(
      lease(
        [
          {
            kind: "failure",
            message: "connect ECONNREFUSED http://example.test?token=secret",
          },
        ],
        new OutpostError("timeout", "Command exceeded 10 ms"),
      ),
    ),
    (error) => {
      assert.ok(error instanceof OutpostError);
      assert.equal(error.code, "timeout");
      assert.deepEqual(unavailableFault(error), {
        message: "connection failure",
      });
      assert.doesNotMatch(JSON.stringify(error.details), /secret|example/);
      return true;
    },
  );
});

test("model providers mark 5xx, 529, 408 and transport failures as outages", async (t) => {
  const providers = () => [
    createOpenAIModelProvider({ apiKey: false, baseUrl: "http://localhost" }),
    createAnthropicModelProvider({
      apiKey: "test",
      baseUrl: "http://localhost",
    }),
  ];
  const request = { model: "test", prompt: "hi", maxOutputTokens: 1 };
  for (const status of [408, 500, 502, 503, 504, 529]) {
    t.mock.method(
      globalThis,
      "fetch",
      async () => new Response(null, { status }),
    );
    for (const provider of providers())
      await assert.rejects(
        provider.request(request),
        (error) =>
          error instanceof OutpostError &&
          error.code === "provider" &&
          unavailableFault(error)?.message === `HTTP ${status}`,
      );
  }
  for (const status of [400, 401, 429]) {
    t.mock.method(
      globalThis,
      "fetch",
      async () => new Response(null, { status }),
    );
    await assert.rejects(
      providers()[0]!.request(request),
      (error) => unavailableFault(error) === undefined,
    );
  }
  t.mock.method(globalThis, "fetch", async () => {
    throw new TypeError("fetch failed");
  });
  await assert.rejects(
    providers()[1]!.request(request),
    (error) =>
      error instanceof OutpostError &&
      error.code === "provider" &&
      unavailableFault(error)?.message === "HTTP transport failure",
  );
});

test("stream errors mark overloaded and server errors as outages", () => {
  for (const [data, expected] of [
    [{ error: { type: "overloaded_error" } }, "overloaded_error"],
    [{ response: { error: { code: "server_error" } } }, "server_error"],
    [{ error: { type: "invalid_request_error" } }, undefined],
    [{ error: { type: "rate_limit_error" } }, undefined],
  ] as const)
    assert.throws(
      () => streamFailure(data),
      (error) => unavailableFault(error)?.message === expected,
    );
});

test("unavailableFault follows wrapped causes and ignores other failures", () => {
  const outage = new OutpostError("provider", "down", {
    unavailable: "HTTP 503",
  });
  assert.deepEqual(unavailableFault(new Error("wrapped", { cause: outage })), {
    message: "HTTP 503",
  });
  assert.equal(
    unavailableFault(new OutpostError("process", "failed")),
    undefined,
  );
  assert.equal(unavailableFault("down"), undefined);
});
