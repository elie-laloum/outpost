import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createAgent,
  createHarness,
  defineHarnessTool,
  defineHarnessHook,
  dispatch,
  createObservationHub,
  readJournal,
  createLocalTransport,
} from "../../src/index.ts";
import type { Observation, ModelProvider } from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

for (const verbose of [false, true])
  test(`harness observes tools, hooks, reasoning and retries with verbose=${verbose}`, async (t) => {
    const root = await repository(t);
    const events: Observation[] = [];
    const observation = createObservationHub({
      verbose,
      sinks: [
        {
          observe(value) {
            events.push(value);
          },
        },
      ],
    });
    let step = 0;
    const modelProvider: ModelProvider = {
      name: "fixture",
      async request() {
        throw new Error("stream expected");
      },
      async *stream() {
        yield { type: "retry", attempt: 2, message: "fixture retry" };
        yield { type: "reasoning", text: "exposed reasoning" };
        if (step++ === 0) {
          yield {
            type: "result",
            result: {
              text: "",
              stopReason: "tool-calls",
              content: [
                { type: "tool-call", id: "call", name: "command", input: {} },
              ],
            },
          };
          return;
        }
        yield {
          type: "result",
          result: { text: "<outpost>done</outpost>", stopReason: "end" },
        };
      },
    };
    const command = defineHarnessTool({
      name: "command",
      description: "Run fixture output",
      readOnly: true,
      input: { type: "object" },
      async execute(_input, context) {
        const result = await context.sandbox.invoke({
          executable: process.execPath,
          arguments: [
            "-e",
            "process.stdout.write('stdout');process.stderr.write('stderr')",
          ],
        });
        return result.stdout;
      },
    });
    const selected = createAgent({
      model: "fixture",
      harness: createHarness({
        modelProvider,
        instructions: ["fixture instructions"],
        tools: [command],
        hooks: [
          defineHarnessHook({
            on: "after-tool",
            run() {
              return { result: "modified" };
            },
          }),
        ],
      }),
    });
    const result = await dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      agent: selected,
      observation,
      brief: { text: "test" },
    });
    assert.equal(result.completed, true);
    for (const kind of [
      "instructions-loaded",
      "model-retry",
      "reasoning",
      "tool-output",
      "hook",
      "tool-result",
    ])
      assert.ok(
        events.some((value) => value.event.kind === kind),
        kind,
      );
    assert.equal(
      events.some((value) => value.event.kind === "model-request"),
      verbose,
    );
    assert.equal(
      events.some((value) => value.event.kind === "model-response"),
      verbose,
    );
    assert.ok(
      events.some(
        (value) => value.event.kind === "hook" && value.event.changed,
      ),
    );
    assert.ok(
      events.some(
        (value) =>
          value.event.kind === "tool-result" &&
          value.event.preview === "modified",
      ),
    );
    const chunks = events.flatMap((value) =>
      value.event.kind === "tool-output" ? [value.event] : [],
    );
    assert.ok(chunks.every((value) => value.callId === "call"));
    assert.deepEqual(
      new Set(chunks.map((value) => value.channel)),
      new Set(["stdout", "stderr"]),
    );
    const journal = JSON.stringify(
      await readJournal({
        transporter: createLocalTransport({
          directory: `${root}/.outpost/storage`,
        }),
        reference: result.logReference!,
      }),
    );
    assert.doesNotMatch(
      journal,
      /exposed reasoning|model-request|model-response|tool-output/,
    );
  });

test("provider failures are observed without replacing the original error", async (t) => {
  const root = await repository(t);
  const events: Observation[] = [];
  const selected = createAgent({
    model: "fixture",
    harness: createHarness({
      modelProvider: {
        name: "fixture",
        async request() {
          throw new Error("provider failed");
        },
      },
      tools: [],
    }),
  });
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      agent: selected,
      brief: { text: "test" },
      logging: false,
      observation: createObservationHub({
        sinks: [
          {
            observe(value) {
              events.push(value);
            },
          },
        ],
      }),
    }),
    /provider failed/,
  );
  assert.ok(
    events.some(
      (value) =>
        value.event.kind === "model-error" &&
        value.event.message === "provider failed",
    ),
  );
});
