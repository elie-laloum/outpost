import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agent,
  harness,
  codexHarness,
  claudeHarness,
  geminiHarness,
  dispatch,
  createSandbox,
  attach,
  response,
  type ModelProvider,
  type AgentObservation,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

const modelProvider: ModelProvider = {
  name: "fixture",
  async request(request) {
    request.signal?.throwIfAborted();
    return {
      text: `${request.model}: ${request.prompt}`,
      usage: { input: 4, cached: 1, output: 2 },
    };
  },
};

test("agents compose without effects and require a model only for custom harnesses", () => {
  for (const preset of [codexHarness, claudeHarness, geminiHarness]) {
    assert.equal(typeof preset, "function");
    const selected = agent({
      harness: preset(),
      model: "arbitrary-future-model",
    });
    assert.ok(
      selected
        .request({ text: "hello" })
        .arguments?.includes("arbitrary-future-model"),
    );
    assert.equal(agent({ harness: preset() }).model, undefined);
    assert.throws(() => agent({ harness: preset(), model: " " }), /Model name/);
  }
  const configuredHarness = harness({
    modelProvider,
    run: async () => ({ text: "ok" }),
  });
  assert.throws(
    // @ts-expect-error A custom harness requires an explicit model.
    () => agent({ harness: configuredHarness }),
    /requires a model/,
  );
  // @ts-expect-error A provider is not an executable harness.
  assert.throws(() => agent({ harness: modelProvider, model: "m" }), /harness/);
  // @ts-expect-error Presets are functions without a namespace method.
  assert.throws(() => codexHarness.harness(), TypeError);
});

test("custom dispatch uses its sandbox and counts each provider request once", async (t) => {
  const root = await repository(t);
  const events: AgentObservation[] = [];
  const developer = agent({
    model: "unknown-until-called",
    harness: harness({
      modelProvider,
      async run(input, context) {
        assert.equal(context.model, "unknown-until-called");
        const result = await context.sandbox.invoke({
          executable: process.execPath,
          arguments: ["-e", "process.stdout.write(process.cwd())"],
        });
        assert.equal(result.stdout, context.sandbox.root);
        context.observe({ kind: "text", text: "working" });
        await context.modelProvider.request({
          model: context.model,
          prompt: input.prompt,
        });
        return context.modelProvider.request({
          model: context.model,
          prompt: "<outpost>done</outpost>",
        });
      },
    }),
  });
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: developer,
    brief: { text: "inspect" },
    logging: false,
    observe: (event) => {
      events.push(event);
      if (event.kind === "text") throw new Error("observer");
    },
  });
  assert.equal(result.completed, true);
  assert.deepEqual(result.usage, { input: 8, cached: 2, output: 4 });
  assert.equal(events.filter((event) => event.kind === "usage").length, 2);
  assert.equal(result.conversation, undefined);
});

test("custom harness rejects absent capabilities before sandbox allocation", async () => {
  const developer = agent({
    model: "m",
    harness: harness({
      modelProvider,
      run: async () => ({ text: "ok" }),
    }),
  });
  const sandboxProvider = {
    ...localSandboxProvider(),
    async acquire() {
      throw new Error("must not allocate");
    },
  };
  await assert.rejects(
    dispatch({
      agent: developer,
      sandboxProvider,
      brief: { text: "hi" },
      continuation: { id: "missing" },
    }),
    /does not support/,
  );
  await assert.rejects(
    attach({ agent: developer, sandboxProvider }),
    /interactive/,
  );
  await assert.rejects(
    dispatch({
      agent: developer,
      sandboxProvider,
      brief: { text: "<x>" },
      response: response.text({ tag: "x", repairs: 1 }),
    }),
    /repair/,
  );
});

test("custom harness cancellation reaches commands and keeps a warm sandbox reusable", async (t) => {
  const root = await repository(t);
  const controller = new AbortController();
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  const developer = agent({
    model: "m",
    harness: harness({
      modelProvider,
      async run(_input, context) {
        started();
        await context.sandbox.invoke({
          executable: process.execPath,
          arguments: ["-e", "setTimeout(()=>{},10000)"],
        });
        return { text: "late" };
      },
    }),
  });
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    logging: false,
  });
  const pending = sandbox.dispatch({
    agent: developer,
    brief: { text: "wait" },
    signal: controller.signal,
  });
  const rejected = assert.rejects(pending);
  await ready;
  controller.abort();
  await rejected;
  assert.equal(
    (
      await sandbox.command({
        executable: process.execPath,
        arguments: ["-e", "process.exit(0)"],
      })
    ).status,
    0,
  );
  const simple = agent({
    model: "m",
    harness: harness({
      modelProvider,
      run: async () => ({ text: "<outpost>done</outpost>" }),
    }),
  });
  assert.equal(
    (await sandbox.dispatch({ agent: simple, brief: { text: "reuse" } }))
      .completed,
    true,
  );
});

test("custom harness deadlines abort provider calls and return no late result", async (t) => {
  const root = await repository(t);
  const hanging: ModelProvider = {
    name: "hanging",
    async request({ signal }) {
      assert.ok(signal);
      await new Promise<void>((_resolve, reject) => {
        signal.addEventListener(
          "abort",
          () => reject(new Error("Model request was cancelled")),
          {
            once: true,
          },
        );
      });
      return { text: "late" };
    },
  };
  const developer = agent({
    model: "m",
    harness: harness({
      modelProvider: hanging,
      run: (input, context) =>
        context.modelProvider.request({
          model: context.model,
          prompt: input.prompt,
        }),
    }),
  });
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: localSandboxProvider(),
      agent: developer,
      brief: { text: "wait" },
      deadlineMs: 30,
      logging: false,
    }),
    { code: "timeout" },
  );
});

test("borrowed custom sandbox transfers preserve binary data and cannot release their owner", async (t) => {
  const { writeFile, readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const root = await repository(t);
  const bytes = Buffer.from([0, 255, 1, 10, 128]);
  const source = join(root, "input.bin");
  await writeFile(source, bytes);
  const developer = agent({
    model: "m",
    harness: harness({
      modelProvider,
      async run(_input, context) {
        await context.sandbox.upload(
          source,
          join(context.sandbox.root, "payload.bin"),
        );
        const check = await context.sandbox.invoke({
          executable: process.execPath,
          arguments: [
            "-e",
            "process.stdout.write(require('node:fs').readFileSync('payload.bin').toString('hex'))",
          ],
          observe() {
            throw new Error("observer failure");
          },
        });
        assert.equal(check.status, 0, check.stderr);
        assert.equal(check.stdout, bytes.toString("hex"));
        const target = join(root, "output.bin");
        await context.sandbox.download(
          join(context.sandbox.root, "payload.bin"),
          target,
        );
        assert.deepEqual(await readFile(target), bytes);
        await assert.rejects(context.sandbox.release(), /does not own/);
        assert.throws(
          () => context.observe({ kind: "conversation", id: "fake" }),
          /not supported/,
        );
        await assert.rejects(
          context.modelProvider.request({ model: "other", prompt: "hi" }),
          /must match/,
        );
        return {
          text: "<outpost>done</outpost>",
          usage: { input: 3, cached: 1, output: 1 },
        };
      },
    }),
  });
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    logging: false,
  });
  const result = await sandbox.dispatch({
    agent: developer,
    brief: { text: "transfer" },
  });
  assert.deepEqual(result.usage, { input: 3, cached: 1, output: 1 });
  assert.equal(
    (
      await sandbox.command({
        executable: process.execPath,
        arguments: ["-e", "process.exit(0)"],
      })
    ).status,
    0,
  );
});

test("legacy sandbox selector is rejected instead of silently choosing Docker", async () => {
  await assert.rejects(
    // @ts-expect-error The old selector is intentionally unsupported.
    createSandbox({ provider: localSandboxProvider() }),
    /Use sandboxProvider/,
  );
});

test("switching CLI configurations reactivates authentication without repeating unchanged access", async (t) => {
  const { scripted, emit } = await import("../helpers.ts");
  const root = await repository(t);
  const selected: string[] = [];
  const first = {
    ...scripted(emit("<outpost>done</outpost>")),
    authenticate() {
      selected.push("first");
      return undefined;
    },
  };
  const second = {
    ...scripted(emit("<outpost>done</outpost>")),
    authenticate() {
      selected.push("second");
      return undefined;
    },
  };
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    logging: false,
  });
  for (const chosen of [first, first, second, first])
    await sandbox.dispatch({ agent: chosen, brief: { text: "run" } });
  assert.deepEqual(selected, ["first", "second", "first"]);
});
