import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { inspectRecipeExecution } from "../../src/application/recipes/plan.ts";
import { readRecipeProject } from "../../src/application/recipes/project.ts";
import { ConfigurationError } from "../../src/domain/configuration-diagnostic.ts";

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
