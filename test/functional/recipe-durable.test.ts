import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import type { RecipeReport } from "../../src/application/recipe-report.types.ts";
import { validateRecipeSchema } from "../../src/infrastructure/recipes/schema.ts";
import { createRecipeRuntime } from "../../src/recipes.ts";

test("a YAML checkpoint resumes in another process, retaining committed and uncommitted work without replaying completed tasks", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-durable-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const repository = join(directory, "repository");
  await mkdir(repository);
  const execute = promisify(execFile);
  const git = (...args: string[]) => execute("git", args, { cwd: repository });
  await git("init", "-b", "main");
  await git("config", "core.autocrlf", "false");
  await git("config", "user.name", "Recipe");
  await git("config", "user.email", "recipe@example.invalid");
  await writeFile(join(repository, "initial"), "initial");
  await git("add", ".");
  await git("commit", "-m", "initial");
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml"),
    settingsFile = join(directory, "settings.json");
  const configuration = {
    version: 2,
    repository: "./repository",
    sandbox: { provider: "local" },
    branch: { mode: "integrate" },
    transports: { state: { type: "local", directory: "./storage" } },
    stores: {
      checkpoint: {
        type: "transport",
        transporter: { $ref: "transports.state" },
      },
    },
  };
  const recipe = {
    version: 3,
    name: "durable",
    inputs: { title: { type: "string", description: "Change title" } },
    workflow: {
      checkpoint: {
        store: { $ref: "stores.checkpoint" },
        runId: "default",
        version: "1",
      },
    },
    tasks: [
      {
        key: "edit",
        command: {
          executable: process.execPath,
          arguments: [
            "-e",
            "const f=require('fs'), c=require('child_process'); f.appendFileSync('evidence',process.argv[1]+'\\n'); c.execFileSync('git',['add','evidence']); c.execFileSync('git',['commit','-m','First change']); f.writeFileSync('draft','unfinished');",
            "{{ inputs.title }}",
          ],
        },
      },
      {
        key: "approve",
        after: ["edit"],
        gate: { kind: "approval", prompt: "Continue?", actors: ["maintainer"] },
      },
      {
        key: "finish",
        after: ["approve"],
        command: {
          executable: process.execPath,
          arguments: [
            "-e",
            "const f=require('fs'), c=require('child_process'); if(f.readFileSync('draft','utf8')!=='unfinished') throw Error('Lost draft'); f.appendFileSync('evidence','finished\\n'); c.execFileSync('git',['add','evidence','draft']); c.execFileSync('git',['commit','-m','Finish change']);",
          ],
        },
      },
    ],
  };
  await writeFile(file, JSON.stringify(recipe));
  await writeFile(config, JSON.stringify(configuration));
  async function invoke(
    operation: string,
    settings: unknown,
  ): Promise<RecipeReport> {
    await writeFile(settingsFile, JSON.stringify(settings));
    const result = await execute(process.execPath, [
      resolve("test/fixtures/recipe-runtime-driver.ts"),
      operation,
      file,
      config,
      settingsFile,
    ]);
    assert.equal(result.stderr, "");
    return validateRecipeSchema<RecipeReport>(
      {
        type: "object",
        required: ["status", "tasks", "outputs"],
        properties: {
          status: { type: "string" },
          tasks: { type: "array" },
          outputs: { type: "object" },
        },
      },
      JSON.parse(result.stdout),
      "report",
    );
  }
  const paused = await invoke("run", {
    runId: "review-1",
    inputs: { title: "persisted" },
  });
  assert.equal(paused.status, "paused", JSON.stringify(paused.errors));
  assert.ok(paused.workspace?.retainedDirectory);
  assert.equal(
    await readFile(join(paused.workspace.directory, "draft"), "utf8"),
    "unfinished",
  );
  const approval = paused.tasks.find((task) => task.key === "approve")?.pause;
  assert.ok(approval);
  const decisions = [
    {
      executionId: paused.executionId,
      key: "approve",
      requestId: approval.id,
      action: "approve",
      actor: "maintainer",
      reason: "Reviewed",
    },
  ];
  await execute("git", ["checkout", "--detach"], {
    cwd: paused.workspace.directory,
  });
  await assert.rejects(
    invoke("resume", { runId: "review-1", decisions }),
    /branch changed/,
  );
  await execute("git", ["checkout", paused.workspace.branch], {
    cwd: paused.workspace.directory,
  });
  const resumed = await invoke("resume", { runId: "review-1", decisions });
  assert.equal(resumed.status, "done", JSON.stringify(resumed.errors));
  assert.equal(resumed.executionId, paused.executionId);
  assert.equal(resumed.tasks.find((task) => task.key === "edit")?.attempts, 1);
  assert.equal(
    await readFile(join(repository, "evidence"), "utf8"),
    "persisted\nfinished\n",
  );
  assert.equal(await readFile(join(repository, "draft"), "utf8"), "unfinished");
  const again = await invoke("resume", { runId: "review-1" });
  assert.deepEqual(again.usage, resumed.usage);
  assert.equal(
    await readFile(join(repository, "evidence"), "utf8"),
    "persisted\nfinished\n",
  );
  await using runtime = await createRecipeRuntime({ file, config });
  const status = await runtime.status("review-1");
  assert.equal(status?.owned, false);
  assert.equal(status?.report?.status, "done");
  await assert.rejects(
    runtime.run({ runId: "review-1", inputs: { title: "persisted" } }),
    /already exists/,
  );
  await assert.rejects(
    runtime.resume({ runId: "review-1", inputs: { title: "changed" } }),
    /identity/,
  );
});

test("durable YAML preserves cumulative usage, refuses implicit replay and fences explicit crash recovery", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-replay-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  const module = resolve("test/fixtures/recipe-durable.ts");
  const configuration = {
    version: 2,
    repository: ".",
    sandbox: { provider: "local" },
    transports: { state: { type: "local", directory: "./state" } },
    stores: {
      state: { type: "transport", transporter: { $ref: "transports.state" } },
    },
    extensions: {
      effect: {
        module,
        export: "effect",
        kind: "callback",
        version: "1",
        contract: "call.options.perform",
      },
      crash: {
        module,
        export: "crash",
        kind: "callback",
        version: "1",
        contract: "call.options.perform",
      },
    },
  };
  const recipe = {
    version: 3,
    name: "recovery",
    workflow: {
      checkpoint: {
        runId: "replay",
        version: "1",
        store: { $ref: "stores.state" },
      },
    },
    tasks: [
      {
        key: "completed",
        call: { $ref: "extensions.effect" },
        arguments: { file: join(directory, "completed") },
      },
      {
        key: "interrupted",
        after: ["completed"],
        call: { $ref: "extensions.effect" },
        arguments: { file: join(directory, "interrupted"), fail: true },
      },
    ],
  };
  await writeFile(config, JSON.stringify(configuration));
  await writeFile(file, JSON.stringify(recipe));
  await using runtime = await createRecipeRuntime({ file, config });
  const failed = await runtime.run();
  assert.equal(failed.status, "failed");
  assert.equal(failed.usage?.tokens.input, 6);
  const denied = await runtime.resume({ runId: "replay" });
  assert.equal(denied.status, "failed");
  assert.match(JSON.stringify(denied.errors), /retry-incomplete/);
  const done = await runtime.resume({ runId: "replay", retryIncomplete: true });
  assert.equal(done.status, "done", JSON.stringify(done.errors));
  assert.equal(done.usage?.tokens.input, 9);
  assert.equal(done.usage?.attempts, 3);
  assert.equal(
    (await readFile(join(directory, "completed"), "utf8")).trim().split("\n")
      .length,
    1,
  );
  const keys = (await readFile(join(directory, "interrupted"), "utf8"))
    .trim()
    .split("\n");
  assert.equal(keys.length, 2);
  assert.equal(keys[0], keys[1]);
  const crashRecipe = {
    ...recipe,
    tasks: [
      {
        key: "crash",
        call: { $ref: "extensions.crash" },
        arguments: { file: join(directory, "crash") },
      },
    ],
  };
  await writeFile(file, JSON.stringify(crashRecipe));
  const settings = join(directory, "settings.json");
  await writeFile(settings, JSON.stringify({ runId: "crash" }));
  await assert.rejects(
    promisify(execFile)(process.execPath, [
      resolve("test/fixtures/recipe-runtime-driver.ts"),
      "run",
      file,
      config,
      settings,
    ]),
    (error) =>
      error instanceof Error &&
      (process.platform === "win32"
        ? "code" in error && error.code === 1
        : "signal" in error && error.signal === "SIGKILL"),
  );
  await using recovered = await createRecipeRuntime({ file, config });
  const status = await recovered.status("crash");
  assert.equal(status?.owned, true);
  assert.equal(status?.usage?.tokens.input, 5);
  await assert.rejects(
    recovered.resume({ runId: "crash", retryIncomplete: true }),
    /owned|owner|acquired|recover/,
  );
  await assert.rejects(
    recovered.resume({
      runId: "crash",
      recoverRevision: "stale",
      retryIncomplete: true,
    }),
    /revision|changed/,
  );
  const resumed = await recovered.resume({
    runId: "crash",
    recoverRevision: status!.revision,
    retryIncomplete: true,
  });
  assert.equal(resumed.status, "done", JSON.stringify(resumed.errors));
  assert.equal(resumed.usage?.tokens.input, 5);
  assert.equal(resumed.usage?.attempts, 2);
});

test("YAML dialogue resumes between processes through CLI answer without replaying completed turns", async (t) => {
  const repository = await (await import("../helpers.ts")).repository(t);
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-dialogue-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  await writeFile(
    config,
    JSON.stringify({
      version: 2,
      repository: ".",
      sandbox: { provider: "local" },
      transports: { state: { type: "local", directory: "./storage" } },
      stores: {
        state: { type: "transport", transporter: { $ref: "transports.state" } },
      },
      extensions: {
        model: {
          module: resolve("test/fixtures/recipe-durable.ts"),
          export: "interview",
          kind: "modelProvider",
          version: "1",
        },
      },
      agents: {
        interviewer: {
          type: "composed",
          model: "fixture",
          harness: {
            type: "outpost",
            modelProvider: { $ref: "extensions.model" },
          },
        },
      },
    }),
  );
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "interview",
      workflow: {
        checkpoint: {
          runId: "interview",
          version: "1",
          store: { $ref: "stores.state" },
        },
      },
      tasks: [
        {
          key: "interview",
          interactive: {
            repository,
            sandboxProvider: { type: "local" },
            agent: { $ref: "agents.interviewer" },
            actors: ["owner"],
            brief: "Design a shop",
            bootstrap: false,
          },
        },
      ],
    }),
  );
  const execute = promisify(execFile);
  const cli = resolve("src/cli/main.ts");
  const args = [
    cli,
    "recipe",
    "run",
    "--file",
    file,
    "--config",
    config,
    "--json",
  ];
  let output = "";
  try {
    await execute(process.execPath, args);
    assert.fail("Waiting input must have nonzero exit status");
  } catch (error) {
    assert.ok(
      error instanceof Error &&
        "stdout" in error &&
        typeof error.stdout === "string",
    );
    assert.ok(
      error.stdout,
      "stderr" in error ? String(error.stderr) : error.message,
    );
    output = error.stdout;
  }
  const paused: RecipeReport = JSON.parse(output);
  assert.equal(paused.status, "waiting-input", JSON.stringify(paused.errors));
  const request = paused.inputRequests?.[0];
  assert.ok(request);
  const answer = join(directory, "answer.json");
  await writeFile(
    answer,
    JSON.stringify({
      executionId: paused.executionId,
      key: "interview",
      requestId: request.id,
      actor: "owner",
      value: "medium",
    }),
  );
  const completed = await execute(process.execPath, [
    cli,
    "recipe",
    "answer",
    "--file",
    file,
    "--config",
    config,
    "--run-id",
    "interview",
    "--answer",
    answer,
    "--json",
  ]);
  assert.equal(completed.stderr, "");
  const done: RecipeReport = JSON.parse(completed.stdout);
  assert.equal(done.status, "done", JSON.stringify(done.errors));
  assert.equal(done.usage?.attempts, 2);
  assert.equal(done.usage?.tokens.input, 8);
  const silent = await execute(process.execPath, [
    cli,
    "recipe",
    "resume",
    "--file",
    file,
    "--config",
    config,
    "--run-id",
    "interview",
  ]);
  assert.equal(silent.stdout, "");
  assert.equal(silent.stderr, "");
  const status = await execute(process.execPath, [
    cli,
    "recipe",
    "status",
    "--file",
    file,
    "--config",
    config,
    "--run-id",
    "interview",
    "--json",
  ]);
  assert.equal(JSON.parse(status.stdout).report.status, "done");
});

test("YAML artifacts, task caches, signed gates and quota pauses reuse native persistence contracts", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-storage-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  const { generateKeyPairSync } = await import("node:crypto");
  const {
    signWorkflowDecision,
    createLocalTransport,
    createArtifactStore,
    defineJsonArtifact,
    readStoredArtifact,
  } = await import("../../src/index.ts");
  const pair = generateKeyPairSync("ed25519"),
    module = resolve("test/fixtures/recipe-durable.ts");
  const jsonSchema = {
    type: "object",
    required: ["completed"],
    properties: { completed: { const: true } },
    additionalProperties: false,
  };
  const configuration = {
    version: 2,
    repository: ".",
    sandbox: { provider: "local" },
    transports: { state: { type: "local", directory: "./storage" } },
    stores: {
      state: { type: "transport", transporter: { $ref: "transports.state" } },
    },
    caches: {
      data: { type: "transport", transporter: { $ref: "transports.state" } },
    },
    artifactStores: {
      outputs: { type: "transport", transporter: { $ref: "transports.state" } },
    },
    artifacts: {
      evidence: { type: "json", name: "evidence", version: "1", jsonSchema },
    },
    extensions: {
      effect: {
        module,
        export: "effect",
        kind: "callback",
        version: "1",
        contract: "call.options.perform",
      },
      cacheKey: {
        module,
        export: "cacheKey",
        kind: "callback",
        version: "1",
        contract: "task.options.cache.key",
      },
      approvers: {
        module,
        export: "approvers",
        kind: "callback",
        factory: true,
        version: "1",
        contract: "verifier.ed25519.keys",
        schema: {
          type: "object",
          required: ["publicKey"],
          additionalProperties: false,
          properties: { publicKey: { type: "string" } },
        },
        options: {
          publicKey: pair.publicKey.export({ type: "spki", format: "pem" }),
        },
      },
    },
    verifiers: {
      maintainers: { type: "ed25519", keys: { $ref: "extensions.approvers" } },
    },
  };
  const recipe = {
    version: 3,
    name: "storage",
    workflow: {
      checkpoint: {
        runId: "storage",
        version: "1",
        store: { $ref: "stores.state" },
      },
      decisionVerifier: { $ref: "verifiers.maintainers" },
    },
    tasks: [
      {
        key: "data",
        call: { $ref: "extensions.effect" },
        arguments: { file: join(directory, "effects") },
        options: {
          cache: {
            store: { $ref: "caches.data" },
            version: "1",
            key: { $ref: "extensions.cacheKey" },
          },
        },
      },
      {
        key: "artifact",
        after: ["data"],
        artifact: {
          store: { $ref: "artifactStores.outputs" },
          contract: { $ref: "artifacts.evidence" },
        },
        data: { $step: "data", path: ["value"] },
      },
      {
        key: "review",
        after: ["artifact"],
        gate: {
          kind: "approval",
          authentication: "signed",
          prompt: "Approve evidence?",
          actors: ["maintainer"],
        },
      },
    ],
  };
  await writeFile(config, JSON.stringify(configuration));
  await writeFile(file, JSON.stringify(recipe));
  await using runtime = await createRecipeRuntime({ file, config });
  const paused = await runtime.run();
  assert.equal(paused.status, "paused", JSON.stringify(paused.errors));
  const reference = paused.outputs.artifact;
  assert.equal(typeof reference?.id, "string");
  const stored = await readStoredArtifact(
    createArtifactStore({
      transporter: createLocalTransport({
        directory: join(directory, "storage"),
      }),
    }),
    defineJsonArtifact({
      name: "evidence",
      version: "1",
      schema: (value) => validateRecipeSchema(jsonSchema, value, "evidence"),
    }),
    reference,
  );
  assert.deepEqual(stored, { completed: true });
  const decision = {
    executionId: paused.executionId!,
    key: "review",
    requestId: paused.tasks.find((task) => task.key === "review")!.pause!.id,
    actor: "maintainer",
    reason: "Reviewed",
    action: "approve" as const,
  };
  const refused = await runtime.resume({
    runId: "storage",
    decisions: [decision],
  });
  assert.equal(refused.status, "failed");
  assert.match(JSON.stringify(refused.errors), /Signed/);
  const signed = signWorkflowDecision({
    decision,
    keyId: "maintainer",
    privateKey: pair.privateKey,
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  });
  const completed = await runtime.resume({
    runId: "storage",
    decisions: [signed],
  });
  assert.equal(completed.status, "done", JSON.stringify(completed.errors));
  const cached = await runtime.run({ runId: "cached" });
  assert.equal(cached.tasks.find((task) => task.key === "data")?.attempts, 0);
  assert.equal(cached.usage?.tokens.input, 0);
  assert.equal(
    (await readFile(join(directory, "effects"), "utf8")).trim().split("\n")
      .length,
    1,
  );
  await writeFile(
    file,
    JSON.stringify({
      ...recipe,
      workflow: {
        checkpoint: recipe.workflow.checkpoint,
        onQuota: { action: "pause" },
        budget: { attempts: 3 },
      },
      tasks: [
        {
          key: "quota",
          call: { $ref: "extensions.effect" },
          arguments: { file: join(directory, "quota"), quota: true },
        },
      ],
    }),
  );
  await using quota = await createRecipeRuntime({ file, config });
  const limited = await quota.run({ runId: "quota" });
  assert.equal(limited.status, "paused", JSON.stringify(limited.errors));
  const resumed = await quota.resume({ runId: "quota" });
  assert.equal(resumed.status, "done", JSON.stringify(resumed.errors));
  assert.equal(resumed.usage?.tokens.input, 6);
});

test("durable workspace guards keep the original diff baseline and missing worktrees are never replaced", async (t) => {
  const repository = await (await import("../helpers.ts")).repository(t);
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-guard-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  await writeFile(
    config,
    JSON.stringify({
      version: 2,
      repository,
      sandbox: { provider: "local" },
      branch: { mode: "integrate" },
      workspace: { guard: { protectedPaths: ["base.txt"] } },
      transports: { state: { type: "local", directory: "./state" } },
      stores: {
        state: { type: "transport", transporter: { $ref: "transports.state" } },
      },
    }),
  );
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "guard",
      workflow: {
        checkpoint: {
          store: { $ref: "stores.state" },
          runId: "guard",
          version: "1",
        },
      },
      tasks: [
        {
          key: "edit",
          command: {
            executable: process.execPath,
            arguments: [
              "-e",
              "const f=require('fs'),c=require('child_process');f.writeFileSync('base.txt','protected');c.execFileSync('git',['add','.']);c.execFileSync('git',['commit','-m','Protected change']);",
            ],
          },
        },
        {
          key: "approval",
          after: ["edit"],
          gate: { kind: "approval", prompt: "Review?", actors: ["maintainer"] },
        },
      ],
    }),
  );
  await using runtime = await createRecipeRuntime({ file, config });
  const paused = await runtime.run();
  assert.equal(paused.status, "paused", JSON.stringify(paused.errors));
  const decision = {
    executionId: paused.executionId!,
    key: "approval",
    requestId: paused.tasks.find((task) => task.key === "approval")!.pause!.id,
    action: "approve" as const,
    actor: "maintainer",
    reason: "Reviewed",
  };
  const guarded = await runtime.resume({
    runId: "guard",
    decisions: [decision],
  });
  assert.equal(guarded.status, "failed");
  assert.ok(
    guarded.errors.some((error) => error.code === "guard"),
    JSON.stringify(guarded.errors),
  );
  assert.equal(await readFile(join(repository, "base.txt"), "utf8"), "base\n");
  assert.equal(
    await readFile(join(paused.workspace!.directory, "base.txt"), "utf8"),
    "protected",
  );
  await rm(paused.workspace!.directory, { recursive: true });
  const before = await runtime.status("guard");
  await assert.rejects(
    runtime.resume({ runId: "guard" }),
    /ENOENT|exist|directory/i,
  );
  const after = await runtime.status("guard");
  assert.deepEqual(after?.tasks, before?.tasks);
  assert.deepEqual(after?.usage, before?.usage);
});

test("durable recipe observers stay open until cleanup and retain projection cursors across resumes", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-observed-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  const configuration = {
    version: 2,
    repository: ".",
    sandbox: { provider: "local" },
    transports: { state: { type: "local", directory: "./state" } },
    stores: {
      state: { type: "transport", transporter: { $ref: "transports.state" } },
    },
    observation: {
      sinks: [
        {
          type: "run",
          transporter: { $ref: "transports.state" },
          id: "observed",
          kind: "workflow",
          resume: false,
        },
      ],
    },
  };
  await writeFile(config, JSON.stringify(configuration));
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "observed",
      workflow: {
        checkpoint: {
          runId: "observed",
          version: "1",
          store: { $ref: "stores.state" },
        },
      },
      tasks: [
        {
          key: "gate",
          gate: { kind: "pause", prompt: "Continue?", actors: ["maintainer"] },
        },
      ],
    }),
  );
  const { createLocalTransport, readRun } = await import("../../src/index.ts");
  const transporter = createLocalTransport({
    directory: join(directory, "state"),
  });
  await using runtime = await createRecipeRuntime({ file, config });
  const paused = await runtime.run();
  assert.equal(paused.status, "paused");
  const first = await readRun({ transporter, id: "observed" });
  assert.equal(first?.status, "paused");
  configuration.observation.sinks[0]!.resume = true;
  await writeFile(config, JSON.stringify(configuration));
  await using resumed = await createRecipeRuntime({ file, config });
  const done = await resumed.resume({
    runId: "observed",
    decisions: [
      {
        executionId: paused.executionId!,
        key: "gate",
        requestId: paused.tasks[0]!.pause!.id,
        actor: "maintainer",
        action: "resume",
        reason: "Continue",
      },
    ],
  });
  assert.equal(done.status, "done", JSON.stringify(done.errors));
  const last = await readRun({ transporter, id: "observed" });
  assert.equal(last?.status, "done");
  assert.ok(last!.seq > first!.seq);
  assert.equal(last?.executionId, first?.executionId);
});
