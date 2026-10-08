import assert from "node:assert/strict";
import { test } from "node:test";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import {
  createRecipeRuntime,
  validateRecipeProject,
} from "../../src/recipes.ts";
import {
  speculate,
  createLocalTransport,
  defineRecipe,
  createSandbox,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { recipeSpeculationTransport } from "../../src/application/recipes/speculation-usage.ts";
import { mapRecipeSchema } from "../../src/domain/recipes/schema-walk.ts";
import { repository } from "../helpers.ts";
import {
  candidate,
  validate,
  events,
  output,
} from "../fixtures/recipe-advanced.ts";
import type { Usage, TaskContext } from "../../src/index.ts";

const module = resolve("test/fixtures/recipe-advanced.ts");
const extension = (kind: string, name: string, contract?: string) => ({
  module,
  export: name,
  kind,
  version: "1",
  ...(contract ? { contract } : {}),
});
const factory = (kind: string, name: string) => ({
  ...extension(kind, name),
  factory: true,
  schema: { type: "object", additionalProperties: false },
});

async function files(repo: string, recipe: unknown, configuration: unknown) {
  const directory = join(repo, ".outpost", "recipes");
  await mkdir(directory, { recursive: true });
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  await writeFile(file, JSON.stringify(recipe));
  await writeFile(config, JSON.stringify(configuration));
  return { file, config };
}

test("experimental recipe speculation matches native results, usage and explicit observation", async (t) => {
  const repo = await repository(t);
  const configuration = {
    version: 2,
    experimental: true,
    repository: repo,
    sandbox: { provider: "local" },
    extensions: {
      candidate: factory("agent", "candidate"),
      validate: extension(
        "callback",
        "validate",
        "speculation.options.validate",
      ),
      write: extension("callback", "write", "sink.reporter.write"),
      summary: extension("callback", "summary", "sink.custom.handlers.summary"),
      tracer: extension("object", "tracer"),
      meter: extension("object", "meter"),
      acquire: extension(
        "callback",
        "acquire",
        "sandboxProvider.mounted.acquire",
      ),
    },
    observation: {
      sinks: [
        { type: "reporter", write: { $ref: "extensions.write" } },
        {
          type: "custom",
          handlers: { summary: { $ref: "extensions.summary" } },
        },
        {
          type: "opentelemetry",
          tracer: { $ref: "extensions.tracer" },
          meter: { $ref: "extensions.meter" },
        },
      ],
    },
  };
  const recipe = {
    version: 3,
    name: "speculate",
    tasks: [
      {
        key: "choose",
        speculation: {
          repository: repo,
          sandboxProvider: {
            type: "mounted",
            name: "local-fixture",
            acquire: { $ref: "extensions.acquire" },
          },
          candidates: [
            {
              key: "candidate",
              agent: { $ref: "extensions.candidate" },
              request: { brief: { text: "Try" }, logging: false },
            },
          ],
          budget: { attempts: 1 },
          validate: { $ref: "extensions.validate" },
          sandbox: { logging: false },
        },
      },
    ],
  };
  const options = await files(repo, recipe, configuration);
  await validateRecipeProject(options);
  output.length = 0;
  events.length = 0;
  await using runtime = await createRecipeRuntime(options);
  const report = await runtime.run();
  assert.equal(report.status, "done", JSON.stringify(report.errors));
  const result = report.outputs.choose?.value;
  assert.ok(result && typeof result === "object" && !Array.isArray(result));
  const native = await speculate({
    repository: repo,
    sandboxProvider: createLocalSandboxProvider(),
    candidates: [
      {
        key: "candidate",
        agent: candidate(),
        request: { brief: { text: "Try" }, logging: false },
      },
    ],
    budget: { attempts: 1 },
    validate,
    sandbox: { logging: false },
  });
  assert.ok("status" in result);
  assert.equal(result.status, native.status);
  assert.deepEqual(report.usage?.tokens, native.usage.tokens);
  assert.equal(report.usage?.tokens.input, 3);
  assert.equal(await readFile(join(repo, "base.txt"), "utf8"), "base\n");
  assert.ok(output.length);
  assert.ok(events.some((event) => event.kind === "summary"));
  assert.equal(JSON.stringify(result).includes('"resume"'), false);
  await writeFile(
    options.config,
    JSON.stringify({ ...configuration, experimental: false }),
  );
  await assert.rejects(validateRecipeProject(options), /experimental: true/);
  await writeFile(
    options.config,
    JSON.stringify({ ...configuration, experimental: "true" }),
  );
  await assert.rejects(validateRecipeProject(options), /experimental/);
  await writeFile(options.config, JSON.stringify(configuration));
  await writeFile(
    options.file,
    JSON.stringify({
      ...recipe,
      tasks: [
        {
          key: "choose",
          speculation: {
            ...recipe.tasks[0]!.speculation,
            candidates: [
              {
                ...recipe.tasks[0]!.speculation.candidates[0],
                request: { brief: { text: "{{ inputs.missing }}" } },
              },
            ],
          },
        },
      ],
    }),
  );
  await assert.rejects(validateRecipeProject(options), /missing/);
});

test("recipe conflict resolution preserves its separate verification and usage report", async (t) => {
  const repo = await repository(t);
  const options = await files(
    repo,
    {
      version: 3,
      name: "resolve",
      tasks: [
        { key: "edit", agent: "candidate", brief: "Edit" },
        {
          key: "host",
          after: ["edit"],
          call: { $ref: "extensions.host" },
          arguments: repo,
        },
      ],
    },
    {
      version: 2,
      repository: repo,
      sandbox: { provider: "local" },
      workspace: { logging: false },
      branch: { mode: "integrate" },
      agents: { candidate: { $ref: "extensions.candidate" } },
      extensions: {
        candidate: factory("agent", "candidate"),
        resolver: factory("agent", "resolver"),
        host: extension("callback", "hostEdit", "call.options.perform"),
      },
      resolvers: {
        agent: {
          type: "agent",
          agent: { $ref: "extensions.resolver" },
          sandboxProvider: { type: "local" },
          verify: {
            executable: process.execPath,
            arguments: ["-e", "process.exit(0)"],
          },
          logging: false,
        },
      },
      integration: {
        onConflict: { $ref: "resolvers.agent" },
        deadlineMs: 30000,
      },
    },
  );
  await using runtime = await createRecipeRuntime(options);
  const report = await runtime.run();
  assert.equal(report.status, "done", JSON.stringify(report.errors));
  assert.equal(report.usage?.tokens.input, 3);
  assert.equal(report.integration?.usage.input, 7);
  assert.equal(report.integration?.verification.status, 0);
  assert.equal(
    await readFile(join(repo, "base.txt"), "utf8"),
    "host + candidate\n",
  );
});

test("durable speculation survives process boundaries without replaying a completed candidate", async (t) => {
  const repo = await repository(t);
  const options = await files(
    repo,
    {
      version: 3,
      name: "durable-speculation",
      workflow: {
        checkpoint: {
          store: { $ref: "stores.checkpoint" },
          runId: "outer",
          version: "1",
        },
      },
      tasks: [
        {
          key: "choose",
          speculation: {
            repository: repo,
            sandboxProvider: { $ref: "extensions.provider" },
            candidates: [
              {
                key: "candidate",
                agent: { $ref: "extensions.candidate" },
                request: { brief: { text: "Try" }, logging: false },
              },
            ],
            durability: {
              transporter: { $ref: "transports.disk" },
              runId: "inner",
              version: "1",
            },
            budget: { attempts: 1 },
            validate: { $ref: "extensions.validate" },
            sandbox: { logging: false },
          },
        },
      ],
    },
    {
      version: 2,
      experimental: true,
      repository: repo,
      sandbox: { provider: "local" },
      transports: {
        disk: { type: "local", directory: join(repo, ".outpost", "durable") },
      },
      stores: {
        checkpoint: {
          type: "transport",
          transporter: { $ref: "transports.disk" },
        },
      },
      extensions: {
        candidate: factory("agent", "candidate"),
        provider: factory("sandboxProvider", "provider"),
        validate: extension(
          "callback",
          "validate",
          "speculation.options.validate",
        ),
      },
    },
  );
  const settings = join(repo, ".outpost", "settings.json");
  await writeFile(settings, JSON.stringify({ runId: "outer" }));
  const run = async (operation: string) =>
    JSON.parse(
      (
        await promisify(execFile)(process.execPath, [
          resolve("test/fixtures/recipe-runtime-driver.ts"),
          operation,
          options.file,
          options.config,
          settings,
        ])
      ).stdout,
    );
  const first = await run("run");
  assert.equal(first.status, "done", JSON.stringify(first.errors));
  const resumed = await run("resume");
  assert.equal(resumed.status, "done", JSON.stringify(resumed.errors));
  assert.deepEqual(resumed.usage, first.usage);
  assert.deepEqual(resumed.outputs, first.outputs);
  assert.equal(first.usage.tokens.input, 3);
  assert.equal(
    first.outputs.choose.value.runId,
    JSON.stringify(["outer", "choose", "inner"]),
  );
  await writeFile(settings, JSON.stringify({ runId: "another-run" }));
  const another = await run("run");
  assert.equal(another.status, "done", JSON.stringify(another.errors));
  assert.notEqual(
    another.outputs.choose.value.id,
    first.outputs.choose.value.id,
  );
  assert.equal(another.usage.tokens.input, 3);
});

test("speculation usage receipts survive partial publication and subsequent cumulative updates", async (t) => {
  const repo = await repository(t),
    transport = createLocalTransport({
      directory: join(repo, ".outpost", "ledger"),
    });
  const receipts = new Set<string>();
  let input = 0;
  const context: TaskContext = {
    signal: new AbortController().signal,
    attempt: 1,
    executionId: "test",
    idempotencyKey: "test",
    value: () => {
      throw new Error("unused");
    },
    reportUsage: (usage) => {
      input += usage.input;
    },
    reportUsageOnce(receipt, usage) {
      if (!receipts.has(receipt)) {
        receipts.add(receipt);
        input += usage.input;
      }
    },
    checkpoint: async () => {},
  };
  const save = async (
    wrapped: ReturnType<typeof recipeSpeculationTransport>,
    usage: Usage,
    revision: string | null,
  ) =>
    wrapped.write(
      "speculations/fixture.json",
      Buffer.from(
        JSON.stringify({
          owner: null,
          state: { id: "test", usage: { tokens: usage } },
        }),
      ),
      { ifRevision: revision },
    );
  const first = recipeSpeculationTransport(transport, context);
  const saved = await save(first, { input: 3, cached: 0, output: 2 }, null);
  assert.equal(input, 3);
  const replay = recipeSpeculationTransport(transport, context);
  await replay.read(saved.key);
  const resumed = await save(
    replay,
    { input: 3, cached: 0, output: 2 },
    saved.revision,
  );
  assert.equal(input, 3);
  await save(replay, { input: 7, cached: 0, output: 4 }, resumed.revision);
  assert.equal(input, 7);
});

test("borrowed recipe options and overlapping workspaces fail explicitly; schema annotations traverse local pointers and intersections", async (t) => {
  const repo = await repository(t);
  await using sandbox = await createSandbox({
    repository: repo,
    sandboxProvider: createLocalSandboxProvider(),
  });
  assert.throws(
    () =>
      defineRecipe(
        JSON.stringify({
          version: 3,
          name: "raw",
          workflow: { concurrency: 2 },
          tasks: [{ key: "one", value: 1 }],
        }),
        { sandbox },
      ),
    /require createRecipeRuntime/,
  );
  const source = {
    type: "object",
    properties: { selected: { $ref: "#/$defs/a~1b" } },
    $defs: { "a/b": { allOf: [{ type: "object" }, { component: "agent" }] } },
  };
  assert.deepEqual(
    mapRecipeSchema(
      source,
      { selected: { $ref: "agents.local" } },
      (shape, value) => ({ kind: shape.component, value }),
    ),
    { selected: { kind: "agent", value: { $ref: "agents.local" } } },
  );
  const options = await files(
    repo,
    {
      version: 3,
      name: "overlap",
      tasks: [
        { key: "shared", command: { executable: "true" } },
        {
          key: "isolated",
          after: ["shared"],
          isolated: {
            repository: repo,
            sandboxProvider: { type: "local" },
            branch: { mode: "current" },
            agent: { $ref: "extensions.candidate" },
            brief: { text: "Edit" },
          },
        },
      ],
    },
    {
      version: 2,
      repository: repo,
      branch: { mode: "current" },
      sandbox: { provider: "local" },
      extensions: { candidate: factory("agent", "candidate") },
    },
  );
  await using runtime = await createRecipeRuntime(options);
  await assert.rejects(runtime.run(), /shared recipe workspace/);
});
