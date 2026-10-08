import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createSandbox } from "../../src/application/outpost.ts";
import {
  createMemorySandboxProvider,
  scriptedAgent,
} from "../../src/testing.ts";
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
  assert.match(text.stdout, /recipe-test: done\n\[ok\] stdout\ndone\n/);

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

test("recipe CLI integrates Git changes and reports outputs and finalization failures", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-finalize-"));
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
  await writeFile(
    config,
    `
import { createSandbox } from ${JSON.stringify(pathToFileURL(resolve("src/application/outpost.ts")).href)};
import { createLocalSandboxProvider } from ${JSON.stringify(pathToFileURL(resolve("src/providers/local.ts")).href)};
export default async signal => {
  const sandbox = await createSandbox({repository: ${JSON.stringify(directory)}, sandboxProvider:createLocalSandboxProvider(), branch:{mode:"integrate"}, logging:false, signal});
  return {sandbox:{...sandbox,
    workspace:{...sandbox.workspace, integrate: async options => {
      if (process.env.RECIPE_CONFLICT) throw new Error("Integration refused");
      await sandbox.workspace.integrate(options);
    }},
    close: async options => {
      if (process.env.RECIPE_CLEANUP_SIGNAL) process.emit(process.env.RECIPE_CLEANUP_SIGNAL);
      const disposal = await sandbox.close(options);
      if (process.env.RECIPE_CLEANUP) throw new Error("Cleanup failed");
      return disposal;
    }
  }};
};`,
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
        "commit",
        "require('fs').writeFileSync('fixed.txt','fixed');require('child_process').execFileSync('git',['add','fixed.txt']);require('child_process').execFileSync('git',['commit','-m','Recipe fix']);console.log('Useful result')",
      ),
    ]),
  );
  const success = await run();
  assert.equal(success.status, 0, success.stderr);
  const report = JSON.parse(success.stdout);
  assert.equal(report.status, "done");
  assert.match(report.outputs.commit.stdout, /Useful result/);
  assert.equal(await readFile(join(directory, "fixed.txt"), "utf8"), "fixed");
  assert.match((await git("log", "-1", "--format=%s")).stdout, /Recipe fix/);
  assert.equal((await git("branch", "--list", "outpost/*")).stdout.trim(), "");
  await writeFile(
    file,
    yaml([
      command("fail", "console.error('Exact diagnostic');process.exit(7)"),
    ]),
  );
  const failed = await run();
  assert.equal(failed.status, 1);
  const failure = JSON.parse(failed.stdout);
  assert.equal(failure.errors[0].status, 7);
  assert.match(failure.errors[0].stderr, /Exact diagnostic/);
  assert.ok(failure.workspace.retainedDirectory);
  await writeFile(file, yaml([command("ok", "console.log('done')")]));
  for (const [variable, message] of [
    ["RECIPE_CONFLICT", "Integration refused"],
    ["RECIPE_CLEANUP", "Cleanup failed"],
  ]) {
    const failed = await run({ [variable!]: "1" });
    assert.equal(failed.status, 1);
    const report = JSON.parse(failed.stdout);
    assert.equal(report.status, "failed");
    assert.equal(report.workflowStatus, "done");
    assert.equal(report.errors[0].message, message);
    if (variable === "RECIPE_CONFLICT")
      assert.ok(report.workspace.retainedDirectory);
  }
  for (const [signal, status] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ] as const) {
    const cancelled = await run({ RECIPE_CLEANUP_SIGNAL: signal });
    assert.equal(cancelled.status, status, cancelled.stderr);
    const report = JSON.parse(cancelled.stdout);
    assert.equal(report.status, "cancelled");
    assert.equal(report.workflowStatus, "done");
  }
});

test("recipe v2 reuses one YAML across repositories and validates before allocation", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-inputs-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml");
  const config = join(directory, "config.mts");
  await writeFile(
    file,
    JSON.stringify({
      version: 2,
      name: "portable",
      inputs: {
        goal: { type: "string", description: "Goal" },
        count: { type: "number", description: "Count", default: 2 },
        check: { type: "boolean", description: "Check", default: true },
      },
      tasks: [
        {
          key: "first",
          command: {
            executable: process.execPath,
            arguments: [
              "-e",
              "process.stdout.write(process.argv[1])",
              "{{ inputs.goal }}",
            ],
          },
        },
        {
          key: "second",
          after: ["first"],
          command: {
            executable: process.execPath,
            arguments: [
              "-e",
              "require('fs').writeFileSync('result.txt',process.argv.slice(1).join('|'))",
              "{{ steps.first.stdout }}",
              "{{ inputs.count }}",
              "{{ inputs.check }}",
            ],
          },
        },
      ],
    }),
  );
  await writeFile(
    config,
    `
import {createLocalSandboxProvider} from ${JSON.stringify(pathToFileURL(resolve("src/providers/local.ts")).href)};
export default {sandbox:{repository:process.env.RECIPE_REPOSITORY,sandboxProvider:createLocalSandboxProvider(),logging:false}};`,
  );
  const run = (args: string[], variables = {}) =>
    executeProcess({
      executable: process.execPath,
      arguments: [cli, "recipe", ...args],
      variables,
    });
  const validated = await run(["validate", "--file", file, "--json"]);
  assert.equal(validated.status, 0, validated.stderr);
  assert.deepEqual(JSON.parse(validated.stdout).tasks, ["first", "second"]);
  const source = await readFile(file, "utf8");
  for (const [index, goal] of [
    "first repository",
    "literal {{ inputs.count }} $(echo unsafe) = value",
  ].entries()) {
    const repository = join(directory, `repo-${index}`);
    await promisify(execFile)("git", ["init", "-b", "main", repository]);
    const git = (...args: string[]) =>
      promisify(execFile)("git", args, { cwd: repository });
    await writeFile(join(repository, "base.txt"), "base");
    await git("add", ".");
    await git(
      "-c",
      "user.name=Recipe tests",
      "-c",
      "user.email=recipe@example.invalid",
      "commit",
      "-m",
      "Initial",
    );
    const result = await run(
      [
        "run",
        "--file",
        file,
        "--config",
        config,
        "--input",
        `goal=${goal}`,
        "--input",
        "count=3",
        "--input",
        "check=false",
        "--json",
      ],
      { RECIPE_REPOSITORY: repository },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      await readFile(join(repository, "result.txt"), "utf8"),
      `${goal}|3|false`,
    );
    assert.equal(JSON.parse(result.stdout).outputs.first.stdout, goal);
    const yamlConfig = join(directory, "outpost.yaml");
    await writeFile(
      yamlConfig,
      JSON.stringify({
        version: 1,
        repository,
        sandbox: { provider: "local" },
        branch: { mode: "current" },
      }),
    );
    const yamlRun = await run([
      "run",
      "--file",
      file,
      "--config",
      yamlConfig,
      "--input",
      `goal=${goal}`,
      "--json",
    ]);
    assert.equal(yamlRun.status, 0, yamlRun.stderr);
    assert.equal(
      await readFile(join(repository, "result.txt"), "utf8"),
      `${goal}|2|true`,
    );
    assert.equal(
      (await run(["validate", "--file", file, "--config", yamlConfig])).status,
      0,
    );
  }
  assert.equal(await readFile(file, "utf8"), source);
  await writeFile(config, "throw new Error('CONFIG_LOADED');");
  for (const args of [
    [],
    ["--input", "unknown=x"],
    ["--input", "goal=x", "--input", "goal=y"],
    ["--input", "goal=x", "--input", "count=bad"],
    ["--input", "goal=x", "--input", "check=42"],
    ["--input", "broken"],
  ]) {
    const result = await run([
      "run",
      "--file",
      file,
      "--config",
      config,
      ...args,
    ]);
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stderr, /CONFIG_LOADED/);
  }
  await writeFile(
    file,
    JSON.stringify({
      version: 2,
      name: "missing-agent",
      tasks: [{ key: "fix", agent: "missing", brief: "Fix" }],
    }),
  );
  await writeFile(
    config,
    `export default {sandbox:{sandboxProvider:{acquire(){throw new Error('ALLOCATED')},name:'fixture',placement:'mounted'}}};`,
  );
  const missing = await run(["run", "--file", file, "--config", config]);
  assert.match(missing.stderr, /Unknown recipe agent: missing/);
  assert.doesNotMatch(missing.stderr, /ALLOCATED/);
  const starter = join(directory, "starter.yaml");
  assert.equal((await run(["init", "--file", starter, "--json"])).status, 0);
  assert.equal((await run(["validate", "--file", starter])).status, 0);
  assert.equal((await run(["init", "--file", starter])).status, 1);
  assert.match(await readFile(starter, "utf8"), /yaml-language-server/);
  const configuredStarter = join(directory, "configured.yaml");
  const executionConfig = join(directory, "execution.yaml");
  const created = await run([
    "init",
    "--file",
    configuredStarter,
    "--config",
    executionConfig,
    "--json",
  ]);
  assert.equal(created.status, 0, created.stderr);
  assert.equal(
    (
      await run([
        "validate",
        "--file",
        configuredStarter,
        "--config",
        executionConfig,
      ])
    ).status,
    0,
  );
  const existing = await readFile(configuredStarter, "utf8");
  assert.equal(
    (
      await run([
        "init",
        "--file",
        configuredStarter,
        "--config",
        executionConfig,
      ])
    ).status,
    1,
  );
  assert.equal(await readFile(configuredStarter, "utf8"), existing);
});

test("recipe passes input and dependency text literally into agent briefs", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-brief-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const git = (...args: string[]) =>
    promisify(execFile)("git", args, { cwd: directory });
  await git("init", "-b", "main");
  await writeFile(join(directory, "base.txt"), "base");
  await git("add", ".");
  await git(
    "-c",
    "user.name=Recipe tests",
    "-c",
    "user.email=recipe@example.invalid",
    "commit",
    "-m",
    "Initial",
  );
  await using sandbox = await createSandbox({
    repository: directory,
    sandboxProvider: createMemorySandboxProvider(),
    logging: false,
  });
  const briefs: string[] = [];
  const source = JSON.stringify({
    version: 2,
    name: "agents",
    inputs: { goal: { type: "string", description: "Goal" } },
    tasks: [
      { key: "analyze", agent: "reviewer", brief: "{{ inputs.goal }}" },
      {
        key: "fix",
        agent: "coder",
        after: ["analyze"],
        brief: "Use {{ steps.analyze.text }}",
      },
    ],
  });
  const workflow = defineRecipe(source, {
    sandbox: {
      ...sandbox,
      dispatch(options) {
        briefs.push(options.brief.text ?? "");
        return sandbox.dispatch(options);
      },
    },
    inputs: { goal: "Literal {{ steps.analyze.text }}" },
    agents: {
      reviewer: scriptedAgent({
        turns: [{ text: "literal {{ inputs.goal }}" }],
      }),
      coder: scriptedAgent({ turns: [{ text: "Done" }] }),
    },
  });
  (await workflow.start()).unwrap();
  assert.deepEqual(briefs, [
    "Literal {{ steps.analyze.text }}",
    "Use literal {{ inputs.goal }}",
  ]);
  assert.throws(
    () => defineRecipe(source, { sandbox }),
    /Missing recipe input/,
  );
  assert.throws(
    () => defineRecipe(source, { sandbox, inputs: { goal: 1 } }),
    /Invalid recipe input/,
  );
  assert.throws(
    () => defineRecipe(source, { sandbox, inputs: { goal: "x", other: "y" } }),
    /Unknown recipe input/,
  );
});
