import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { createServer } from "node:net";
import { createHmac } from "node:crypto";
import {
  createRecipeRuntime,
  validateRecipeProject,
} from "../../src/recipes.ts";
import { createSqliteTaskQueue } from "../../src/infrastructure/task-queue.ts";
import type { QueueJob, TaskQueue } from "../../src/index.ts";

async function settled(queue: TaskQueue, id: string): Promise<QueueJob> {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const job = await queue.get(id);
    if (job && !["pending", "active"].includes(job.status)) return job;
    await delay(20);
  }
  throw new Error(`Queue job did not settle: ${id}`);
}
async function availablePort(): Promise<number> {
  const socket = createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const address = socket.address();
  assert.ok(address && typeof address === "object");
  await new Promise<void>((done, reject) =>
    socket.close((error) => (error ? reject(error) : done())),
  );
  return address.port;
}

test("YAML enqueue and explicit workers use native durable jobs across processes without starting other services", async () => {
  await using cleanup = new AsyncDisposableStack();
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-service-"));
  cleanup.defer(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml"),
    db = join(directory, "jobs.sqlite"),
    evidence = join(directory, "effect");
  const configuration = {
    version: 2,
    repository: ".",
    sandbox: { provider: "local" },
    transports: { state: { type: "local", directory: "./state" } },
    stores: {
      state: { type: "transport", transporter: { $ref: "transports.state" } },
    },
    queues: { jobs: { type: "sqlite", file: "./jobs.sqlite" } },
    jobs: {
      apply: {
        type: "recipe",
        file: "./recipe.yaml",
        config: "./outpost.yaml",
      },
    },
    services: {
      worker: {
        type: "worker",
        queue: { $ref: "queues.jobs" },
        worker: "recipe-worker",
        handlers: { apply: { $ref: "jobs.apply" } },
        pollMs: 10,
      },
      forbidden: { $ref: "extensions.forbidden" },
    },
    extensions: {
      effect: {
        module: resolve("test/fixtures/recipe-service.ts"),
        export: "effect",
        kind: "callback",
        contract: "call.options.perform",
        version: "1",
      },
      forbidden: {
        module: resolve("test/fixtures/recipe-service.ts"),
        export: "forbiddenService",
        kind: "service",
        factory: true,
        schema: { type: "object", additionalProperties: false },
        version: "1",
      },
    },
  };
  await writeFile(config, JSON.stringify(configuration));
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "queued-recipe",
      inputs: {
        file: {
          type: "string",
          description: "Evidence file",
          default: evidence,
        },
      },
      workflow: {
        checkpoint: {
          store: { $ref: "stores.state" },
          runId: "default",
          version: "1",
        },
      },
      tasks: [
        {
          key: "effect",
          call: { $ref: "extensions.effect" },
          arguments: { file: { $input: "file" } },
        },
      ],
    }),
  );
  await validateRecipeProject({ file, config });
  await assert.rejects(stat(db), /ENOENT/);
  const cli = resolve("src/cli/main.ts"),
    execute = promisify(execFile);
  const queued = await execute(process.execPath, [
    cli,
    "recipe",
    "enqueue",
    "--file",
    file,
    "--config",
    config,
    "--queue",
    "jobs",
    "--handler",
    "apply",
    "--run-id",
    "job-run",
    "--json",
  ]);
  assert.equal(queued.stderr, "");
  assert.equal(JSON.parse(queued.stdout).status, "pending");
  await assert.rejects(stat(evidence), /ENOENT/);
  const queue = await createSqliteTaskQueue(db);
  cleanup.defer(() => queue.close());
  const child = spawn(
    process.execPath,
    [
      cli,
      "recipe",
      "serve",
      "--file",
      file,
      "--config",
      config,
      "--service",
      "worker",
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  cleanup.defer(async () => {
    if (child.exitCode !== null || child.signalCode !== null) return;
    const exit = once(child, "exit");
    child.kill("SIGKILL");
    await exit;
  });
  let stdout = "",
    stderr = "";
  child.stdout.on("data", (chunk) => (stdout += chunk));
  child.stderr.on("data", (chunk) => (stderr += chunk));
  const completed = await settled(queue, "recipe:apply:job-run");
  assert.equal(completed.status, "done", JSON.stringify(completed.result));
  assert.equal(completed.result?.usage?.input, 2);
  await using runtime = await createRecipeRuntime({ file, config });
  await runtime.enqueue({
    queue: "jobs",
    handler: "apply",
    runId: "job-run",
    id: "redelivery",
    idempotencyKey: "recipe:apply:job-run",
  });
  assert.equal((await settled(queue, "redelivery")).status, "done");
  assert.equal((await readFile(evidence, "utf8")).trim().split("\n").length, 1);
  const exit = once(child, "exit");
  child.kill("SIGTERM");
  await exit;
  assert.equal(stdout, "");
  assert.equal(stderr, "");
  assert.equal(child.exitCode, process.platform === "win32" ? null : 143);
  assert.equal(
    child.signalCode,
    process.platform === "win32" ? "SIGTERM" : null,
  );
  await assert.rejects(runtime.serve({ service: "missing" }), /Unknown/);
  await assert.rejects(runtime.serve({ service: "forbidden" }), /Unselected/);
  await writeFile(
    config,
    JSON.stringify({
      ...configuration,
      queues: { jobs: { type: "sqlite", file: "./must-not-exist.sqlite" } },
      jobs: { apply: { $ref: "extensions.invalid" } },
      extensions: {
        ...configuration.extensions,
        invalid: {
          module: resolve("test/fixtures/recipe-service.ts"),
          export: "invalidHandler",
          kind: "job",
          version: "1",
        },
      },
    }),
  );
  await using invalid = await createRecipeRuntime({ file, config });
  await assert.rejects(invalid.serve({ service: "worker" }), /invalid job/);
  await assert.rejects(
    stat(join(directory, "must-not-exist.sqlite")),
    /ENOENT/,
  );
});

test("a selected YAML webhook verifies signatures and only enqueues deterministic native jobs", async () => {
  await using cleanup = new AsyncDisposableStack();
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-trigger-"));
  cleanup.defer(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml"),
    db = join(directory, "jobs.sqlite"),
    port = await availablePort();
  const secret = "recipe-webhook-test-secret";
  const previous = process.env.OUTPOST_RECIPE_WEBHOOK_TEST;
  process.env.OUTPOST_RECIPE_WEBHOOK_TEST = secret;
  cleanup.defer(() => {
    if (previous === undefined) delete process.env.OUTPOST_RECIPE_WEBHOOK_TEST;
    else process.env.OUTPOST_RECIPE_WEBHOOK_TEST = previous;
  });
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "triggered",
      tasks: [{ key: "value", value: true }],
    }),
  );
  await writeFile(
    config,
    JSON.stringify({
      version: 2,
      repository: ".",
      sandbox: { provider: "local" },
      queues: { jobs: { type: "sqlite", file: "./jobs.sqlite" } },
      triggers: {
        github: {
          type: "github",
          secret: { env: "OUTPOST_RECIPE_WEBHOOK_TEST" },
        },
      },
      routes: {
        review: {
          type: "job",
          handler: "review",
          kinds: ["issues"],
          actions: ["opened"],
          runIdPrefix: "review",
        },
      },
      services: {
        webhook: {
          type: "triggers",
          queue: { $ref: "queues.jobs" },
          port,
          routes: [
            {
              path: "/github",
              source: { $ref: "triggers.github" },
              on: { $ref: "routes.review" },
            },
          ],
        },
      },
    }),
  );
  await validateRecipeProject({ file, config });
  await assert.rejects(stat(db), /ENOENT/);
  await using runtime = await createRecipeRuntime({ file, config });
  const stop = new AbortController(),
    service = runtime.serve({ service: "webhook", signal: stop.signal });
  cleanup.defer(async () => {
    stop.abort();
    await service;
  });
  const body = JSON.stringify({
    action: "opened",
    issue: { number: 4 },
    sender: { login: "contributor" },
  });
  const headers = {
    "content-type": "application/json",
    "x-github-event": "issues",
    "x-github-delivery": "delivery-4",
    "x-hub-signature-256": `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`,
  };
  const url = `http://127.0.0.1:${port}/github`;
  let response: Response | undefined;
  for (let attempt = 0; attempt < 100 && !response; attempt++) {
    try {
      response = await fetch(url, { method: "POST", body, headers });
    } catch {
      await delay(10);
    }
  }
  assert.equal(response?.status, 202, await response?.text());
  assert.equal(
    (await fetch(url, { method: "POST", body, headers })).status,
    202,
  );
  assert.equal(
    (
      await fetch(url, {
        method: "POST",
        body,
        headers: { ...headers, "x-hub-signature-256": "sha256=invalid" },
      })
    ).status,
    401,
  );
  const queue = await createSqliteTaskQueue(db);
  cleanup.defer(() => queue.close());
  const job = await queue.get("trigger:/github:delivery-4");
  assert.equal(job?.status, "pending");
  assert.equal(job?.handler, "review");
  assert.deepEqual(JSON.parse(JSON.stringify(job?.input)), {
    runId: "review:delivery-4",
    input: JSON.parse(body),
  });
  stop.abort();
  await service;
  await assert.rejects(fetch(url), /fetch failed/);
});

test("YAML HTTP queues rotate declared callbacks and schedules publish without executing", async () => {
  await using cleanup = new AsyncDisposableStack();
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-http-"));
  cleanup.defer(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml"),
    db = join(directory, "jobs.sqlite"),
    port = await availablePort();
  const module = resolve("test/fixtures/recipe-service.ts");
  const previous = process.env.OUTPOST_RECIPE_QUEUE_TOKEN;
  process.env.OUTPOST_RECIPE_QUEUE_TOKEN = "a".repeat(40);
  cleanup.defer(() => {
    if (previous === undefined) delete process.env.OUTPOST_RECIPE_QUEUE_TOKEN;
    else process.env.OUTPOST_RECIPE_QUEUE_TOKEN = previous;
  });
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "http-queue",
      tasks: [{ key: "value", value: true }],
    }),
  );
  const configuration = {
    version: 2,
    repository: ".",
    sandbox: { provider: "local" },
    queues: {
      jobs: { type: "sqlite", file: "./jobs.sqlite" },
      remote: {
        type: "http",
        url: `http://127.0.0.1:${port}`,
        token: { $ref: "extensions.client" },
      },
    },
    extensions: {
      server: {
        module,
        export: "serverTokens",
        kind: "callback",
        contract: "service.queue.token",
        version: "1",
      },
      client: {
        module,
        export: "clientToken",
        kind: "callback",
        contract: "queue.http.token",
        version: "1",
      },
      scheduleInput: {
        module,
        export: "scheduleInput",
        kind: "callback",
        contract: "schedule.cron.input",
        version: "1",
      },
      runId: {
        module,
        export: "scheduleRunId",
        kind: "callback",
        contract: "schedule.cron.runId",
        version: "1",
      },
    },
    crons: {
      minute: {
        type: "schedule",
        expression: "* * * * *",
        timeZone: "Europe/Paris",
      },
    },
    schedules: {
      minute: {
        type: "cron",
        name: "minute",
        cron: { $ref: "crons.minute" },
        handler: "apply",
        input: { $ref: "extensions.scheduleInput" },
        runId: { $ref: "extensions.runId" },
      },
    },
    services: {
      http: {
        type: "queue",
        queue: { $ref: "queues.jobs" },
        port,
        token: { $ref: "extensions.server" },
      },
      clock: {
        type: "schedules",
        queue: { $ref: "queues.jobs" },
        schedules: [{ $ref: "schedules.minute" }],
      },
    },
  };
  await writeFile(config, JSON.stringify(configuration));
  await validateRecipeProject({ file, config });
  await using server = await createRecipeRuntime({ file, config });
  const serving = server.serve({ service: "http" });
  cleanup.defer(async () => {
    await server.close();
    await serving;
  });
  await using publisher = await createRecipeRuntime({ file, config });
  let queued: QueueJob | undefined;
  for (let attempt = 0; attempt < 100 && !queued; attempt++) {
    try {
      queued = await publisher.enqueue({
        queue: "remote",
        handler: "apply",
        runId: "first",
      });
    } catch {
      await delay(10);
    }
  }
  assert.equal(queued?.status, "pending");
  process.env.OUTPOST_RECIPE_QUEUE_TOKEN = "b".repeat(40);
  assert.equal(
    (
      await publisher.enqueue({
        queue: "remote",
        handler: "apply",
        runId: "second",
      })
    ).status,
    "pending",
  );
  await assert.rejects(
    publisher.enqueue({
      queue: "remote",
      handler: "apply",
      runId: "expired",
      deadline: NaN,
    }),
    /number|deadline/,
  );
  await using clock = await createRecipeRuntime({ file, config });
  const running = clock.serve({ service: "clock" });
  cleanup.defer(async () => {
    await clock.close();
    await running;
  });
  const queue = await createSqliteTaskQueue(db);
  cleanup.defer(() => queue.close());
  let scheduled: QueueJob | undefined;
  for (let attempt = 0; attempt < 100 && !scheduled; attempt++) {
    const job = await queue.claim({
      worker: "inspector",
      handlers: ["apply"],
      leaseMs: 5000,
    });
    if (job?.id.startsWith("schedule:")) scheduled = job;
    if (job && !scheduled)
      await queue.complete(
        { id: job.id, worker: "inspector", fence: job.fence },
        { value: null },
      );
    await delay(10);
  }
  assert.ok(scheduled);
  assert.match(scheduled.id, /^schedule:minute:/);
  assert.deepEqual(JSON.parse(JSON.stringify(scheduled.input)), {
    runId: `slot:${scheduled.id.slice("schedule:minute:".length)}`,
    input: { ready: true, source: "callback" },
  });
  await clock.close();
  await running;
  await server.close();
  await serving;
  await assert.rejects(fetch(`http://127.0.0.1:${port}`), /fetch failed/);
  await writeFile(
    config,
    JSON.stringify({
      ...configuration,
      services: {
        ...configuration.services,
        http: {
          ...configuration.services.http,
          queue: { type: "sqlite", file: "./must-not-exist.sqlite" },
          token: { env: "OUTPOST_RECIPE_MISSING_TOKEN_TEST" },
        },
      },
    }),
  );
  await using missing = await createRecipeRuntime({ file, config });
  await assert.rejects(
    missing.serve({ service: "http" }),
    /Missing declared environment variable/,
  );
  await assert.rejects(
    stat(join(directory, "must-not-exist.sqlite")),
    /ENOENT/,
  );
});

test("a YAML queued task composes defineQueuedTask with a native defineWorkflowJob and preserves usage", async () => {
  await using cleanup = new AsyncDisposableStack();
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-queued-"));
  cleanup.defer(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "queued-task",
      tasks: [
        {
          key: "remote",
          queued: {
            queue: { $ref: "queues.jobs" },
            handler: "native",
            pollMs: 10,
          },
          arguments: { runId: "native-child", input: { requested: true } },
        },
      ],
    }),
  );
  await writeFile(
    config,
    JSON.stringify({
      version: 2,
      repository: ".",
      sandbox: { provider: "local" },
      transports: { state: { type: "local", directory: "./state" } },
      stores: {
        state: { type: "transport", transporter: { $ref: "transports.state" } },
      },
      queues: { jobs: { type: "sqlite", file: "./jobs.sqlite" } },
      extensions: {
        build: {
          module: resolve("test/fixtures/recipe-service.ts"),
          export: "nativeWorkflow",
          kind: "callback",
          version: "1",
          contract: "job.workflow.workflow",
        },
      },
      jobs: {
        native: {
          type: "workflow",
          workflow: { $ref: "extensions.build" },
          checkpoint: { store: { $ref: "stores.state" }, version: "1" },
        },
      },
      services: {
        worker: {
          type: "worker",
          queue: { $ref: "queues.jobs" },
          worker: "native-worker",
          handlers: { native: { $ref: "jobs.native" } },
          pollMs: 10,
        },
      },
    }),
  );
  await using worker = await createRecipeRuntime({ file, config });
  const serving = worker.serve({ service: "worker" });
  cleanup.defer(async () => {
    await worker.close();
    await serving;
  });
  await using runtime = await createRecipeRuntime({ file, config });
  const report = await runtime.run();
  assert.equal(report.status, "done", JSON.stringify(report.errors));
  assert.deepEqual(report.usage?.tokens, { input: 4, cached: 1, output: 2 });
  assert.equal(report.workspace, undefined);
  const value = report.outputs.remote!.value;
  assert.ok(value && typeof value === "object" && "status" in value);
  assert.equal(value.status, "done");
  await worker.close();
  await serving;
});
