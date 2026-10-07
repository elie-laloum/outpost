import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  createAgent,
  createHarness,
  createObservationHub,
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineTask,
  defineWorkflow,
  defineIsolatedTask,
  dispatch,
  readJournal,
} from "../../src/index.ts";
import type { ModelPriceTable, Observation } from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository, scripted, emit } from "../helpers.ts";
import {
  redactBundle,
  redactTranscript,
} from "../../src/infrastructure/conversations/redaction.ts";

const secret = "sk-" + "A".repeat(24);
const redact = [/sk-[A-Za-z0-9]{20,}/g];
const prices: ModelPriceTable = {
  currency: "EUR",
  models: { demo: { input: 2, output: 8 } },
};
const tokens = { input: 100, cached: 0, output: 50 };

const agent = () =>
  createAgent({
    model: "demo",
    harness: createHarness({
      modelProvider: {
        name: "fixture",
        request: async (request) => {
          assert.ok(JSON.stringify(request).includes(secret));
          return { text: `${secret} <outpost>done</outpost>`, usage: tokens };
        },
      },
    }),
  });

test("redaction precedes all sinks and inherited child policies compose without changing inputs", async () => {
  const events: Observation[] = [];
  const hub = createObservationHub({
    redact,
    sinks: [
      {
        observe: (value) => {
          events.push(value);
        },
      },
    ],
  });
  const child = hub.child(
    { taskKey: secret },
    [
      {
        observe: (value) => {
          events.push(value);
        },
      },
    ],
    [/password/g],
  );
  const event = {
    kind: "tool" as const,
    name: "example",
    input: { key: secret, nested: ["password", secret] },
  };
  child.emit("agent", event);
  await child.close();
  await hub.close();
  assert.equal(events.length, 2);
  assert.ok(!JSON.stringify(events).includes(secret));
  assert.ok(!JSON.stringify(events).includes("password"));
  assert.equal(event.input.key, secret);
  assert.equal(redact[0]!.lastIndex, 0);
  const error = child.redact(new Error(secret, { cause: secret }));
  assert.equal(error.message, "[REDACTED]");
  assert.equal(error.cause, "[REDACTED]");
  assert.equal(
    child
      .redact(new Map([[secret, new Set([secret])]]))
      .get("[REDACTED]")
      ?.has("[REDACTED]"),
    true,
  );
  const cycle: { text: string; self?: unknown } = { text: secret };
  cycle.self = cycle;
  const cleaned = child.redact(cycle);
  assert.equal(cleaned.self, cleaned);
});

test("saved harness transcripts, journals and legacy observers never receive matching secrets", async (t) => {
  const repo = await repository(t);
  const seen: unknown[] = [];
  const observation = createObservationHub({
    sinks: [
      {
        observe: (value) => {
          seen.push(value);
        },
      },
    ],
    verbose: true,
  });
  const result = await dispatch({
    repository: repo,
    sandboxProvider: createLocalSandboxProvider(),
    agent: agent(),
    brief: { text: secret },
    prices,
    redact,
    observation,
    observe: (value) => {
      seen.push(value);
    },
  });
  assert.ok(result.text.includes(secret));
  assert.ok(result.transcript);
  const transcript = await readFile(result.transcript, "utf8");
  assert.ok(!transcript.includes(secret));
  assert.ok(transcript.includes("[REDACTED]"));
  assert.ok(!JSON.stringify(seen).includes(secret));
  assert.ok(result.logReference);
  const journal = await readJournal({
    transporter: createLocalTransport({
      directory: `${repo}/.outpost/storage`,
    }),
    reference: result.logReference,
  });
  assert.ok(!JSON.stringify(journal).includes(secret));
  assert.deepEqual(result.usage.models?.demo, tokens);
  await observation.close();
});

test("priced CLI workflow tasks cancel synchronously and block dependent work", async (t) => {
  const repo = await repository(t);
  const fixture = {
    ...scripted(
      `console.log(JSON.stringify({kind:"usage",tokens:${JSON.stringify(tokens)}})); ${emit(secret)} setTimeout(()=>{},60000);`,
    ),
    model: { name: "demo" },
  };
  const task = defineIsolatedTask({
    key: "cli",
    request: () => ({
      repository: repo,
      sandboxProvider: createLocalSandboxProvider(),
      agent: fixture,
      brief: { text: "go" },
    }),
  });
  const next = defineTask({
    key: "next",
    after: [task],
    perform: () => assert.fail(),
  });
  const result = await defineWorkflow("priced-cli", [task, next]).start({
    redact,
    budget: { prices, cost: { currency: "EUR", limit: 0.0001 } },
  });
  assert.equal(result.status, "failed");
  assert.equal(result.usage.attempts, 1);
  assert.equal(result.usage.cost?.amount, 0.0006);
  assert.ok(result.tasks.every((task) => task.status === "cancelled"));
});

test("durable workflows retain model receipts and cumulative cost without replaying completed tasks", async (t) => {
  const repo = await repository(t);
  const checkpoint = {
    runId: "cost",
    version: "1",
    store: createWorkflowCheckpointStore({
      transporter: createLocalTransport({ directory: `${repo}/storage` }),
    }),
  };
  let calls = 0;
  const task = defineTask({
    key: "record",
    perform(context) {
      calls++;
      context.reportUsage({ ...tokens, models: { demo: tokens } });
      return "done";
    },
  });
  const graph = defineWorkflow("durable-cost", [task]);
  const first = await graph.start({ checkpoint, budget: { prices } });
  first.unwrap();
  const second = await graph.start({ checkpoint, budget: { prices } });
  second.unwrap();
  assert.equal(calls, 1);
  assert.deepEqual(second.usage, first.usage);
});

test("native JSONL and base64 bundles mask decoded strings and reject binary redaction", () => {
  const hub = createObservationHub({ redact });
  const raw = JSON.stringify({ secret });
  assert.ok(!redactTranscript(raw, hub).includes(secret));
  const bundle = JSON.stringify({
    files: [
      { path: "events.jsonl", data: Buffer.from(raw).toString("base64") },
    ],
  });
  const masked = JSON.parse(redactBundle(bundle, hub));
  assert.equal(
    JSON.parse(Buffer.from(masked.files[0].data, "base64").toString()).secret,
    "[REDACTED]",
  );
  const binary = JSON.stringify({
    files: [{ path: "data", data: Buffer.from([255]).toString("base64") }],
  });
  assert.throws(() => redactBundle(binary, hub), /UTF-8/);
  const nul = JSON.stringify({
    files: [{ path: "binary", data: Buffer.from("data\0").toString("base64") }],
  });
  assert.throws(() => redactBundle(nul, hub), /UTF-8/);
  assert.equal(redactBundle(binary, createObservationHub()), binary);
});

test("native transcript capture masks sidecars before transport archival", async (t) => {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { createTranscriptConversations, createTransportConversations } =
    await import("../../src/index.ts");
  const repo = await repository(t);
  const home = join(repo, "native");
  const id = "session";
  await mkdir(join(home, "session", "subagents"), { recursive: true });
  await writeFile(
    join(home, "session.jsonl"),
    JSON.stringify({ text: secret }) + "\n",
  );
  await writeFile(
    join(home, "session", "subagents", "child.jsonl"),
    JSON.stringify({ text: secret }) + "\n",
  );
  const lease = await createLocalSandboxProvider().acquire({
    repository: repo,
    directory: repo,
    variables: {},
    gitDirectories: [],
  });
  t.after(() => lease.release());
  const base = createTranscriptConversations({
    format: "test-native",
    sidecars: true,
    directory: (_, home) => join(home, "captured"),
    searchRoot: (home) => home,
    remoteSearchRoot: (home) => home,
    pattern: (id) => `${id}.jsonl`,
    matches: (file, id) => file.endsWith(`${id}.jsonl`),
    capturePath: (id, _, home) => join(home, "captured", `${id}.jsonl`),
    remotePath: (id) => join(home, `${id}.jsonl`),
  });
  const transporter = createLocalTransport({
    directory: join(repo, "archive"),
  });
  const store = createTransportConversations(base, {
    namespace: "redacted",
    transporter,
  });
  const captured = await store.capture(id, {
    repository: repo,
    sandbox: { ...lease, home },
    staging: join(repo, "staging"),
    local: true,
    observation: createObservationHub({ redact }),
  });
  assert.ok(captured.reference);
  const restored = await store.locate(id, repo);
  assert.equal(
    JSON.parse((await readFile(restored.file, "utf8")).trim()).text,
    "[REDACTED]",
  );
  const child = join(restored.file, "..", id, "subagents", "child.jsonl");
  assert.equal(
    JSON.parse((await readFile(child, "utf8")).trim()).text,
    "[REDACTED]",
  );
});

test("native Kimi bundle capture masks decoded bytes before saving and archiving", async (t) => {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { createKimiConversations, createTransportConversations } =
    await import("../../src/index.ts");
  const repo = await repository(t);
  const home = join(repo, "native");
  const source = join(home, ".kimi-code", "sessions", "bucket", "session");
  await mkdir(join(source, "agents", "main"), { recursive: true });
  await writeFile(
    join(source, "state.json"),
    JSON.stringify({
      version: 2,
      id: "session",
      cwd: repo,
      agents: {},
      secret,
    }),
  );
  await writeFile(
    join(source, "agents", "main", "wire.jsonl"),
    JSON.stringify({ text: secret }) + "\n",
  );
  const lease = await createLocalSandboxProvider().acquire({
    repository: repo,
    directory: repo,
    variables: {},
    gitDirectories: [],
  });
  t.after(() => lease.release());
  const store = createTransportConversations(createKimiConversations(), {
    namespace: "kimi",
    transporter: createLocalTransport({ directory: join(repo, "archive") }),
  });
  await store.capture("session", {
    repository: repo,
    sandbox: { ...lease, home },
    staging: join(repo, "staging"),
    observation: createObservationHub({ redact }),
  });
  const captured = await store.locate("session", repo);
  const bundle = JSON.parse(await readFile(captured.file, "utf8"));
  for (const entry of bundle.files)
    assert.ok(!Buffer.from(entry.data, "base64").toString().includes(secret));
});

test("priced subagents preserve independent model counters and masked transcripts", async (t) => {
  const { defineHarnessSubagent } = await import("../../src/index.ts");
  const repo = await repository(t);
  let parentCalls = 0;
  const child = createAgent({
    model: "child",
    harness: createHarness({
      modelProvider: {
        name: "child-fixture",
        request: async () => ({ text: secret, usage: tokens }),
      },
    }),
  });
  const parent = createAgent({
    model: "demo",
    harness: createHarness({
      tools: [
        defineHarnessSubagent({
          name: "review",
          description: "Review",
          agent: child,
        }),
      ],
      modelProvider: {
        name: "parent-fixture",
        request: async () => {
          if (parentCalls++ === 0)
            return {
              text: "",
              usage: tokens,
              content: [
                {
                  type: "tool-call",
                  id: "review-1",
                  name: "review",
                  input: { prompt: secret },
                },
              ],
              stopReason: "tool-calls",
            };
          return { text: "<outpost>done</outpost>", usage: tokens };
        },
      },
    }),
  });
  const table: ModelPriceTable = {
    currency: "EUR",
    models: { ...prices.models, child: { input: 4, output: 16 } },
  };
  const task = defineIsolatedTask({
    key: "nested",
    request: () => ({
      repository: repo,
      sandboxProvider: createLocalSandboxProvider(),
      agent: parent,
      brief: { text: secret },
    }),
  });
  const result = await defineWorkflow("nested", [task]).start({
    redact,
    budget: { prices: table },
  });
  result.unwrap();
  assert.equal(result.usage.tokens.models?.child?.input, 100);
  assert.equal(result.usage.tokens.models?.demo?.input, 200);
  assert.equal(result.usage.cost?.amount, 0.0024);
  assert.ok(
    !(await readFile(result.value(task).transcript!, "utf8")).includes(secret),
  );
});

test("masking model names never changes synchronous monetary accounting", async (t) => {
  const repo = await repository(t);
  const task = defineIsolatedTask({
    key: "masked-model",
    request: () => ({
      repository: repo,
      sandboxProvider: createLocalSandboxProvider(),
      agent: agent(),
      brief: { text: secret },
    }),
  });
  const result = await defineWorkflow("masked-model", [task]).start({
    redact: [/demo/g, ...redact],
    budget: { prices, cost: { currency: "EUR", limit: 20 } },
  });
  result.unwrap();
  assert.equal(result.usage.cost?.complete, true);
  assert.equal(result.usage.tokens.models?.demo?.input, 100);
});

test("command task observers are masked while command results stay usable", async (t) => {
  const { createSandbox, defineCommandTask } =
    await import("../../src/index.ts");
  const repo = await repository(t);
  await using sandbox = await createSandbox({
    repository: repo,
    sandboxProvider: createLocalSandboxProvider(),
  });
  const seen: string[] = [];
  const task = defineCommandTask({
    key: "command",
    sandbox,
    command: {
      executable: process.execPath,
      arguments: ["-e", `process.stdout.write(${JSON.stringify(secret)})`],
      observe: (_, text) => seen.push(text),
    },
  });
  const result = await defineWorkflow("command-redaction", [task]).start({
    redact,
  });
  result.unwrap();
  assert.equal(result.value(task).stdout, secret);
  assert.equal(seen.join(""), "[REDACTED]");
});
