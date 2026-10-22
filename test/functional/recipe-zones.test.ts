import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { inspectRecipeExecution } from "../../src/application/recipes/plan.ts";
import { readRecipeProject } from "../../src/application/recipes/project.ts";
import { ConfigurationError } from "../../src/domain/configuration-diagnostic.ts";
import { createRecipeRuntime } from "../../src/application/recipes/runtime.ts";
import { repository } from "../helpers.ts";

async function project(t: { after(callback: () => Promise<void>): void }) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-zones-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "execution.yaml");
  const write = (recipe: unknown, configuration: unknown) =>
    Promise.all([
      writeFile(file, JSON.stringify(recipe)),
      writeFile(config, JSON.stringify(configuration)),
    ]);
  return { directory, file, config, write };
}

const configuration = {
  version: 3,
  workspace: { kind: "ephemeral" },
  sandbox: { provider: "local" },
  workspaces: { other: { kind: "ephemeral" } },
  sandboxes: {
    host: { provider: "local" },
    elsewhere: { workspace: { $ref: "workspaces.other" }, provider: "local" },
  },
};

function command(key: string, sandbox?: string, after?: string[]) {
  return {
    key,
    command: { executable: "must-not-run" },
    ...(sandbox ? { sandbox } : {}),
    ...(after ? { after } : {}),
  };
}

test("recipe tasks reference the sandboxes their configuration declares", async (t) => {
  const { file, config, write } = await project(t);
  await write(
    { version: 3, name: "zones", tasks: [command("draft", "missing")] },
    configuration,
  );
  await assert.rejects(readRecipeProject({ file, config }), (error) => {
    assert.ok(error instanceof ConfigurationError);
    assert.match(error.message, /Unknown recipe sandbox: missing/);
    assert.equal(error.diagnostic.file, file);
    assert.deepEqual(error.diagnostic.path, ["tasks", 0, "sandbox"]);
    assert.equal(
      error.diagnostic.hint,
      "Declare sandboxes.missing in the execution configuration.",
    );
    return true;
  });
  await write(
    {
      version: 3,
      name: "zones",
      tasks: [command("draft")],
    },
    {
      version: 2,
      repository: ".",
      sandbox: { provider: "local" },
      sandboxes: { host: { provider: "local" } },
    },
  );
  await assert.rejects(
    readRecipeProject({ file, config }),
    /Unknown configuration field sandboxes/,
  );
});

test("only tasks of one workspace must be ordered to run concurrently", async (t) => {
  const { file, config, write } = await project(t);
  const recipe = (tasks: unknown[]) => ({
    version: 3,
    name: "zones",
    workflow: { concurrency: 2 },
    tasks,
  });
  await write(
    recipe([command("draft", "host"), command("review", "elsewhere")]),
    configuration,
  );
  await readRecipeProject({ file, config });
  await write(
    recipe([command("draft", "host"), command("review")]),
    configuration,
  );
  await assert.rejects(readRecipeProject({ file, config }), (error) => {
    assert.ok(error instanceof ConfigurationError);
    assert.match(
      error.message,
      /Concurrent recipe tasks draft and review share one workspace/,
    );
    assert.equal(error.diagnostic.file, file);
    assert.deepEqual(error.diagnostic.path, ["workflow", "concurrency"]);
    return true;
  });
  await write(
    recipe([command("draft", "host"), command("review", undefined, ["draft"])]),
    configuration,
  );
  await readRecipeProject({ file, config });
});

test("static plans show each task's workspace and sandbox", async (t) => {
  const { file, config, write } = await project(t);
  await write(
    {
      version: 3,
      name: "zones",
      tasks: [
        command("draft"),
        command("review", "elsewhere", ["draft"]),
        { key: "done", value: true, after: ["review"] },
      ],
    },
    configuration,
  );
  const plan = await inspectRecipeExecution({ file, config });
  assert.deepEqual(plan.workspaces, { other: { kind: "ephemeral" } });
  assert.deepEqual(plan.sandboxes.elsewhere, {
    workspace: "workspaces.other",
    binding: "ephemeral",
    sandbox: {
      provider: "local",
      placement: "host",
      bindings: ["copy", "ephemeral"],
    },
  });
  assert.equal(plan.sandboxes.host?.workspace, "workspace");
  assert.deepEqual(
    plan.tasks.map((task) => task.zone),
    [
      { workspace: "workspace", sandbox: "sandbox" },
      { workspace: "workspaces.other", sandbox: "sandboxes.elsewhere" },
      undefined,
    ],
  );
  const { stdout } = await promisify(execFile)(
    process.execPath,
    [
      resolve("src/cli/main.ts"),
      "recipe",
      "plan",
      "--file",
      file,
      "--config",
      config,
    ],
    { encoding: "utf8" },
  );
  assert.match(stdout, /\nWorkspace other: ephemeral\n/);
  assert.match(
    stdout,
    /\nSandbox elsewhere: on workspaces\.other, ephemeral on local \(host; supports copy, ephemeral\)\n/,
  );
  assert.match(
    stdout,
    /\nTasks: draft, review \(sandboxes\.elsewhere\), done\n/,
  );
});

test("Git configurations register named sandboxes and workspace options as components", async (t) => {
  const { directory, file, config, write } = await project(t);
  await write(
    {
      version: 3,
      name: "zones",
      tasks: [command("draft", "docker"), command("review", "podman")],
    },
    {
      version: 3,
      workspace: { kind: "git", repository: "." },
      sandbox: { provider: "local" },
      workspaces: {
        review: {
          kind: "git",
          repository: ".",
          branch: { mode: "named", name: "review" },
          label: "review",
        },
      },
      sandboxes: {
        docker: { provider: "docker", image: "outpost:claude" },
        podman: {
          workspace: { $ref: "workspaces.review" },
          provider: "podman",
          image: "outpost:claude",
        },
      },
    },
  );
  const loaded = await readRecipeProject({ file, config });
  assert.equal(
    loaded.graph.nodes.get("sandboxes.docker")?.kind,
    "sandboxProvider",
  );
  assert.equal(
    loaded.graph.nodes.get("sandboxes.podman")?.definition?.name,
    "sandboxProvider.podman",
  );
  assert.equal(
    loaded.graph.nodes.get("workspaces.review")?.kind,
    "sandboxOptions",
  );
  const plan = await inspectRecipeExecution({ file, config });
  assert.deepEqual(plan.workspaces, {
    review: { kind: "git", repository: directory },
  });
  assert.deepEqual(plan.sandboxes, {
    docker: { workspace: "workspace" },
    podman: { workspace: "workspaces.review" },
  });
});

test("named file workspaces reference declared Transports", async (t) => {
  const { file, config, write } = await project(t);
  await write(
    { version: 3, name: "zones", tasks: [command("draft", "elsewhere")] },
    {
      ...configuration,
      runtime: { namespace: "zones" },
      workspaces: {
        other: {
          kind: "ephemeral",
          retention: {
            policy: "portable",
            transporter: { $ref: "transports.missing" },
          },
        },
      },
    },
  );
  await assert.rejects(readRecipeProject({ file, config }), (error) => {
    assert.ok(error instanceof ConfigurationError);
    assert.match(
      error.message,
      /Portable workspace retention references an unknown Transport/,
    );
    assert.equal(error.diagnostic.file, config);
    assert.deepEqual(error.diagnostic.path, [
      "workspaces",
      "other",
      "retention",
      "transporter",
    ]);
    return true;
  });
});

function shell(
  key: string,
  script: string,
  extra: Record<string, unknown> = {},
) {
  return {
    key,
    command: { executable: "sh", arguments: ["-c", script] },
    ...extra,
  };
}

test("tasks switch sandboxes on one Git workspace, keep its files and integrate every workspace", async (t) => {
  const { file, config, write } = await project(t);
  const repo = await repository(t);
  const commit = 'git add -A && git commit -qm "$ZONE"';
  await write(
    {
      version: 3,
      name: "zones",
      tasks: [
        shell("draft", `echo "$ZONE" > zone.txt && ${commit}`, {
          sandbox: "a",
        }),
        shell(
          "review",
          `cat zone.txt && echo "$ZONE" >> zone.txt && ${commit}`,
          {
            sandbox: "b",
            after: ["draft"],
          },
        ),
        shell("check", 'cat zone.txt; echo "$ZONE"', { after: ["review"] }),
        shell("other", `echo "$ZONE" > other.txt && ${commit}`, {
          sandbox: "c",
        }),
      ],
    },
    {
      version: 3,
      workspace: { kind: "git", repository: repo },
      sandbox: { provider: "local", variables: { ZONE: "default" } },
      workspaces: {
        side: {
          kind: "git",
          repository: repo,
          branch: { mode: "named", name: "side" },
        },
      },
      sandboxes: {
        a: { provider: "local", variables: { ZONE: "a" } },
        b: { provider: "local", variables: { ZONE: "b" } },
        c: {
          workspace: { $ref: "workspaces.side" },
          provider: "local",
          variables: { ZONE: "c" },
        },
      },
    },
  );
  await using runtime = await createRecipeRuntime({ file, config });
  const report = await runtime.run();
  assert.equal(report.status, "done", JSON.stringify(report.errors));
  assert.equal(report.outputs.review?.stdout, "a\n");
  assert.equal(report.outputs.check?.stdout, "a\nb\ndefault\n");
  const show = (revision: string) =>
    promisify(execFile)("git", ["-C", repo, "show", revision], {
      encoding: "utf8",
    }).then(({ stdout }) => stdout);
  assert.equal(await show("main:zone.txt"), "a\nb\n");
  assert.equal(await show("side:other.txt"), "c\n");
  assert.equal(report.workspace?.retainedDirectory, undefined);
  assert.equal(report.workspaces?.side?.kind, "git");
  assert.equal(
    report.workspaces?.side?.kind === "git" && report.workspaces.side.branch,
    "side",
  );
});

test("tasks switch sandboxes on one file workspace and each workspace publishes its outputs", async (t) => {
  const { directory, file, config, write } = await project(t);
  await mkdir(join(directory, "source"));
  await writeFile(join(directory, "source", "base.txt"), "base\n");
  await write(
    {
      version: 3,
      name: "zones",
      tasks: [
        shell("draft", 'echo "$ZONE" > zone.txt', { sandbox: "a" }),
        shell("review", 'cat zone.txt base.txt && echo "$ZONE" >> zone.txt', {
          sandbox: "b",
          after: ["draft"],
        }),
        shell("other", 'printf \'{"zone":"%s"}\' "$ZONE" > result.json', {
          sandbox: "c",
        }),
      ],
    },
    {
      version: 3,
      workspace: { kind: "directory", directory: "./source" },
      outputs: [
        { paths: ["zone.txt"], destination: "./published", policy: "create" },
      ],
      workspaces: {
        scratch: {
          kind: "ephemeral",
          outputs: [
            {
              paths: ["result.json"],
              destination: "./scratch",
              policy: "create",
            },
          ],
        },
      },
      sandboxes: {
        a: { provider: "local", variables: { ZONE: "a" } },
        b: { provider: "local", variables: { ZONE: "b" } },
        c: {
          workspace: { $ref: "workspaces.scratch" },
          provider: "local",
          variables: { ZONE: "c" },
        },
      },
    },
  );
  await using runtime = await createRecipeRuntime({ file, config });
  const report = await runtime.run();
  assert.equal(report.status, "done", JSON.stringify(report.errors));
  assert.equal(report.outputs.review?.stdout, "a\nbase\n");
  assert.equal(
    await readFile(join(directory, "published", "zone.txt"), "utf8"),
    "a\nb\n",
  );
  assert.equal(
    await readFile(join(directory, "scratch", "result.json"), "utf8"),
    '{"zone":"c"}',
  );
  await assert.rejects(readFile(join(directory, "source", "zone.txt")), {
    code: "ENOENT",
  });
  assert.equal(report.fileOutputs?.length, 1);
  const scratch = report.workspaces?.scratch;
  assert.equal(scratch?.kind, "files");
  assert.equal(scratch?.kind === "files" && scratch.fileOutputs.length, 1);
});

test("workspaces progress in parallel when the recipe allows concurrency", async (t) => {
  const { directory, file, config, write } = await project(t);
  const repo = await repository(t);
  const barrier = (mine: string, other: string) =>
    `touch "${directory}/${mine}" && while [ ! -e "${directory}/${other}" ]; do sleep 0.05; done`;
  await write(
    {
      version: 3,
      name: "zones",
      workflow: { concurrency: 2 },
      tasks: [
        shell("left", barrier("left", "right"), { timeoutMs: 20000 }),
        shell("right", barrier("right", "left"), {
          sandbox: "side",
          timeoutMs: 20000,
        }),
      ],
    },
    {
      version: 3,
      workspace: { kind: "git", repository: repo },
      sandbox: { provider: "local" },
      workspaces: {
        side: {
          kind: "git",
          repository: repo,
          branch: { mode: "named", name: "side" },
        },
      },
      sandboxes: {
        side: { workspace: { $ref: "workspaces.side" }, provider: "local" },
      },
    },
  );
  await using runtime = await createRecipeRuntime({ file, config });
  const report = await runtime.run();
  assert.equal(report.status, "done", JSON.stringify(report.errors));
});

test("a durable run resumes each workspace and reopens the sandbox the next task selects", async (t) => {
  const { file, config, write } = await project(t);
  const repo = await repository(t);
  const commit = (paths: string) =>
    `git add ${paths} && git commit -qm "$ZONE"`;
  await write(
    {
      version: 3,
      name: "zones",
      workflow: {
        checkpoint: {
          store: { $ref: "stores.checkpoint" },
          runId: "default",
          version: "1",
        },
      },
      tasks: [
        shell(
          "draft",
          `echo "$ZONE" > zone.txt && ${commit("zone.txt")} && echo unfinished > draft.txt`,
          { sandbox: "a" },
        ),
        shell("other", `echo "$ZONE" > other.txt && ${commit("other.txt")}`, {
          sandbox: "c",
        }),
        {
          key: "approve",
          after: ["draft", "other"],
          gate: {
            kind: "approval",
            prompt: "Continue?",
            actors: ["maintainer"],
          },
        },
        shell(
          "review",
          `cat draft.txt && echo "$ZONE" >> zone.txt && ${commit("zone.txt draft.txt")}`,
          { sandbox: "b", after: ["approve"] },
        ),
      ],
    },
    {
      version: 3,
      workspace: { kind: "git", repository: repo },
      sandbox: { provider: "local" },
      workspaces: {
        side: {
          kind: "git",
          repository: repo,
          branch: { mode: "named", name: "side" },
        },
      },
      sandboxes: {
        a: { provider: "local", variables: { ZONE: "a" } },
        b: { provider: "local", variables: { ZONE: "b" } },
        c: {
          workspace: { $ref: "workspaces.side" },
          provider: "local",
          variables: { ZONE: "c" },
        },
      },
      transports: { state: { type: "local", directory: "./storage" } },
      stores: {
        checkpoint: {
          type: "transport",
          transporter: { $ref: "transports.state" },
        },
      },
    },
  );
  const paused = await (async () => {
    await using runtime = await createRecipeRuntime({ file, config });
    return await runtime.run({ runId: "zones" });
  })();
  assert.equal(paused.status, "paused", JSON.stringify(paused.errors));
  assert.ok(paused.workspace?.retainedDirectory);
  const side = paused.workspaces?.side;
  assert.ok(side?.kind === "git" && side.retainedDirectory);
  const approval = paused.tasks.find((task) => task.key === "approve")?.pause;
  assert.ok(approval);
  await using runtime = await createRecipeRuntime({ file, config });
  const resumed = await runtime.resume({
    runId: "zones",
    decisions: [
      {
        executionId: paused.executionId!,
        key: "approve",
        requestId: approval.id,
        action: "approve",
        actor: "maintainer",
        reason: "Reviewed",
      },
    ],
  });
  assert.equal(resumed.status, "done", JSON.stringify(resumed.errors));
  assert.equal(resumed.outputs.review?.stdout, "unfinished\n");
  assert.equal(resumed.tasks.find((task) => task.key === "draft")?.attempts, 1);
  const show = (revision: string) =>
    promisify(execFile)("git", ["-C", repo, "show", revision], {
      encoding: "utf8",
    }).then(({ stdout }) => stdout);
  assert.equal(await show("main:zone.txt"), "a\nb\n");
  assert.equal(await show("main:draft.txt"), "unfinished\n");
  assert.equal(await show("side:other.txt"), "c\n");
  assert.equal(resumed.workspace?.retainedDirectory, undefined);
  assert.equal(resumed.workspaces?.side?.kind, "git");
});

test("a durable file run resumes each workspace and publishes after the switch", async (t) => {
  const { directory, file, config, write } = await project(t);
  await mkdir(join(directory, "source"));
  await write(
    {
      version: 3,
      name: "zones",
      workflow: {
        checkpoint: {
          store: { $ref: "stores.checkpoint" },
          runId: "default",
          version: "1",
        },
      },
      tasks: [
        shell("draft", 'echo "$ZONE" > zone.txt', { sandbox: "a" }),
        shell("other", 'echo "$ZONE" > result.txt', { sandbox: "c" }),
        {
          key: "approve",
          after: ["draft", "other"],
          gate: {
            kind: "approval",
            prompt: "Continue?",
            actors: ["maintainer"],
          },
        },
        shell("review", 'cat zone.txt && echo "$ZONE" >> zone.txt', {
          sandbox: "b",
          after: ["approve"],
        }),
      ],
    },
    {
      version: 3,
      runtime: { directory: "./control", namespace: "zones" },
      workspace: {
        kind: "directory",
        directory: "./source",
        retention: { policy: "local" },
      },
      outputs: [
        { paths: ["zone.txt"], destination: "./published", policy: "create" },
      ],
      workspaces: {
        scratch: {
          kind: "ephemeral",
          retention: { policy: "local" },
          outputs: [
            {
              paths: ["result.txt"],
              destination: "./scratch",
              policy: "create",
            },
          ],
        },
      },
      sandboxes: {
        a: { provider: "local", variables: { ZONE: "a" } },
        b: { provider: "local", variables: { ZONE: "b" } },
        c: {
          workspace: { $ref: "workspaces.scratch" },
          provider: "local",
          variables: { ZONE: "c" },
        },
      },
      transports: { state: { type: "local", directory: "./state" } },
      stores: {
        checkpoint: {
          type: "transport",
          transporter: { $ref: "transports.state" },
        },
      },
    },
  );
  const paused = await (async () => {
    await using runtime = await createRecipeRuntime({ file, config });
    return await runtime.run({ runId: "zones" });
  })();
  assert.equal(paused.status, "paused", JSON.stringify(paused.errors));
  await assert.rejects(readFile(join(directory, "published", "zone.txt")), {
    code: "ENOENT",
  });
  const approval = paused.tasks.find((task) => task.key === "approve")?.pause;
  assert.ok(approval);
  await using runtime = await createRecipeRuntime({ file, config });
  const resumed = await runtime.resume({
    runId: "zones",
    decisions: [
      {
        executionId: paused.executionId!,
        key: "approve",
        requestId: approval.id,
        action: "approve",
        actor: "maintainer",
        reason: "Reviewed",
      },
    ],
  });
  assert.equal(resumed.status, "done", JSON.stringify(resumed.errors));
  assert.equal(resumed.outputs.review?.stdout, "a\n");
  assert.equal(
    await readFile(join(directory, "published", "zone.txt"), "utf8"),
    "a\nb\n",
  );
  assert.equal(
    await readFile(join(directory, "scratch", "result.txt"), "utf8"),
    "c\n",
  );
  const status = await runtime.status("zones");
  assert.deepEqual(
    Object.entries(status?.workspaces ?? {})
      .map(([key, resource]) => [key, resource.state])
      .sort(),
    [
      ["shared", "closed"],
      ["workspaces.scratch", "closed"],
    ],
  );
});

test("a resumed file run publishes the configuration workspace that no remaining task reopens", async (t) => {
  const { directory, file, config, write } = await project(t);
  await write(
    {
      version: 3,
      name: "zones",
      workflow: {
        checkpoint: {
          store: { $ref: "stores.checkpoint" },
          runId: "default",
          version: "1",
        },
      },
      tasks: [
        shell("draft", "echo ready > result.txt"),
        {
          key: "approve",
          after: ["draft"],
          gate: {
            kind: "approval",
            prompt: "Publish?",
            actors: ["maintainer"],
          },
        },
        { key: "done", after: ["approve"], value: true },
      ],
    },
    {
      version: 3,
      runtime: { directory: "./control", namespace: "zones" },
      workspace: { kind: "ephemeral", retention: { policy: "local" } },
      sandbox: { provider: "local" },
      outputs: [
        { paths: ["result.txt"], destination: "./published", policy: "create" },
      ],
      transports: { state: { type: "local", directory: "./state" } },
      stores: {
        checkpoint: {
          type: "transport",
          transporter: { $ref: "transports.state" },
        },
      },
    },
  );
  const paused = await (async () => {
    await using runtime = await createRecipeRuntime({ file, config });
    return await runtime.run({ runId: "publish" });
  })();
  assert.equal(paused.status, "paused", JSON.stringify(paused.errors));
  const approval = paused.tasks.find((task) => task.key === "approve")?.pause;
  assert.ok(approval);
  await using runtime = await createRecipeRuntime({ file, config });
  const resumed = await runtime.resume({
    runId: "publish",
    decisions: [
      {
        executionId: paused.executionId!,
        key: "approve",
        requestId: approval.id,
        action: "approve",
        actor: "maintainer",
        reason: "Reviewed",
      },
    ],
  });
  assert.equal(resumed.status, "done", JSON.stringify(resumed.errors));
  assert.equal(resumed.fileOutputs?.length, 1);
  assert.equal(
    await readFile(join(directory, "published", "result.txt"), "utf8"),
    "ready\n",
  );
  assert.equal(
    (await runtime.status("publish"))?.workspaces?.shared?.state,
    "closed",
  );
});
