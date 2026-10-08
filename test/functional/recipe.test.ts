import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createSandbox } from "../../src/application/outpost.ts";
import { defineRecipe } from "../../src/application/recipe.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";

const cli = resolve("src/cli/main.ts");
const yaml = (tasks: unknown) =>
  JSON.stringify({ version: 1, name: "recipe-test", tasks });
const command = (key: string, code: string, after: string[] = []) => ({
  key,
  after,
  command: { executable: process.execPath, arguments: ["-e", code] },
});

test("recipe executes real commands, preserves nonzero status, and releases CLI ownership", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipes-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const git = (...args: string[]) =>
    promisify(execFile)("git", args, { cwd: directory });
  await git("init", "-b", "main");
  await git("config", "user.name", "Recipe tests");
  await git("config", "user.email", "recipe@example.invalid");
  await writeFile(join(directory, "base.txt"), "base\n");
  await git("add", ".");
  await git("commit", "-m", "Initial");
  const file = join(directory, "recipe.yaml");
  const config = join(directory, "config.mts");
  const closed = join(directory, "closed.txt");
  await writeFile(
    config,
    `
import { createSandbox } from ${JSON.stringify(pathToFileURL(resolve("src/application/outpost.ts")).href)};
import { createLocalSandboxProvider } from ${JSON.stringify(pathToFileURL(resolve("src/providers/local.ts")).href)};
import { appendFile } from 'node:fs/promises';
export default async (signal) => {
  const sandbox = await createSandbox({ repository: ${JSON.stringify(directory)}, sandboxProvider: createLocalSandboxProvider(), logging: false, signal });
  const close = sandbox.close;
  return { sandbox: { ...sandbox,
    command(options) {
      if (process.env.RECIPE_SIGNAL) setImmediate(() => process.emit(process.env.RECIPE_SIGNAL));
      return sandbox.command(options);
    },
    async close(options) { await close(options); await appendFile(${JSON.stringify(closed)}, 'closed\\n'); } },
    agents: process.env.INVALID_AGENTS ? [] : undefined };
};
`,
  );
  const run = (variables = {}) =>
    executeProcess({
      executable: process.execPath,
      arguments: [
        cli,
        "recipe",
        "run",
        "--file",
        file,
        "--config",
        config,
        "--json",
      ],
      variables,
    });
  await writeFile(
    file,
    yaml([
      command(
        "fail",
        "process.stdout.end();process.stderr.end();setTimeout(()=>process.exit(7),50)",
      ),
      command("dependent", "process.exit(0)", ["fail"]),
    ]),
  );
  const failed = await run();
  assert.equal(failed.status, 1);
  const report = JSON.parse(failed.stdout);
  assert.equal(report.status, "failed");
  assert.equal(report.tasks[0].status, "failed");
  assert.notEqual(report.tasks[1].status, "done");
  assert.equal(await readFile(closed, "utf8"), "closed\n");

  await writeFile(
    file,
    yaml([
      command(
        "second",
        "console.log(require('fs').readFileSync('ordered.txt','utf8'))",
        ["first"],
      ),
      command("first", "require('fs').writeFileSync('ordered.txt','ready')"),
    ]),
  );
  const success = await run();
  assert.equal(success.status, 0, success.stderr);
  assert.deepEqual(
    JSON.parse(success.stdout).tasks.map(
      (task: { key: string; status: string }) => [task.key, task.status],
    ),
    [
      ["first", "done"],
      ["second", "done"],
    ],
  );
  assert.equal(await readFile(join(directory, "ordered.txt"), "utf8"), "ready");
  const invalidAgents = await run({ INVALID_AGENTS: "1" });
  assert.equal(invalidAgents.status, 1);
  assert.match(invalidAgents.stderr, /agents must be a mapping/);
  assert.equal((await readFile(closed, "utf8")).trim().split("\n").length, 3);
  await writeFile(file, yaml([command("slow", "setTimeout(()=>{},30000)")]));
  for (const [signal, status] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ] as const) {
    const cancelled = await run({ RECIPE_SIGNAL: signal });
    assert.equal(cancelled.status, status, cancelled.stderr);
    assert.equal(JSON.parse(cancelled.stdout).status, "cancelled");
  }
  assert.equal((await readFile(closed, "utf8")).trim().split("\n").length, 5);
  await writeFile(file, yaml([command("ok", "console.log('done')")]));
  const text = await executeProcess({
    executable: process.execPath,
    arguments: [cli, "recipe", "run", "--file", file, "--config", config],
  });
  assert.equal(text.status, 0, text.stderr);
  assert.equal(text.stdout, "recipe-test: done\n");

  await using sandbox = await createSandbox({
    repository: directory,
    sandboxProvider: createLocalSandboxProvider(),
    logging: false,
  });
  assert.throws(
    () =>
      defineRecipe(yaml([{ key: "fix", agent: "constructor", brief: "Fix" }]), {
        sandbox,
        agents: {},
      }),
    /Unknown recipe agent/,
  );
  const controller = new AbortController();
  const slow = defineRecipe(
    yaml([command("slow", "console.log('ready');setTimeout(()=>{},30000)")]),
    {
      sandbox: {
        ...sandbox,
        command: (invocation) =>
          sandbox.command({ ...invocation, observe: () => controller.abort() }),
      },
    },
  );
  const cancelled = await slow.start({ signal: controller.signal });
  assert.equal(cancelled.status, "cancelled");
  assert.equal(
    (
      await sandbox.command({
        executable: process.execPath,
        arguments: ["-e", "console.log('reused')"],
      })
    ).stdout,
    "reused\n",
  );
  const good = defineRecipe(yaml([command("ok", "console.log('done')")]), {
    sandbox,
  });
  assert.throws(() => good.start({ concurrency: 2 }), /requires concurrency 1/);
  const done = await good.start();
  done.unwrap();
  assert.deepEqual(done.value(good.tasks[0]!), {
    status: 0,
    stdout: "done\n",
    stderr: "",
  });
});

test("recipe CLI scopes its help and rejects loading errors before execution", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-load-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml");
  const config = join(directory, "config.mjs");
  const run = (args: string[]) =>
    executeProcess({
      executable: process.execPath,
      arguments: [cli, "recipe", "run", ...args],
    });
  const help = await run(["--help"]);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /--config/);
  assert.match((await run([])).stderr, /requires --file/);
  await writeFile(file, yaml([command("check", "")]));
  await writeFile(config, "export default {};");
  const args = ["--file", file, "--config", config];
  assert.match((await run(args)).stderr, /default bindings factory/);
  await writeFile(config, "export default () => null;");
  assert.match((await run(args)).stderr, /must return/);
  await writeFile(config, "export default () => ({ sandbox: {} });");
  assert.match((await run(args)).stderr, /open Sandbox/);
  assert.match(
    (await run(["--file", file, "--config", `${config}.json`])).stderr,
    /module/,
  );
  assert.equal(
    (await run(["--file", file, "--config", `${config}.missing.ts`])).status,
    1,
  );
  await writeFile(file, "x".repeat(1_048_577));
  assert.match((await run(args)).stderr, /exceeds/);
  await writeFile(file, "not: [valid");
  assert.match((await run(args)).stderr, /Invalid recipe YAML/);
});
