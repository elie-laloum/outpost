import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parse, stringify } from "yaml";
import { validateRecipeProject } from "../../src/application/recipes/project.ts";

const execute = promisify(execFile);
const cli = fileURLToPath(new URL("../../dist/cli/main.js", import.meta.url));
async function blocks(slug, locale = "", language = "yaml") {
  const source = await readFile(
    new URL(`../src/content/docs/${locale}guide/${slug}.md`, import.meta.url),
    "utf8",
  );
  return [...source.matchAll(/^```(\w+) title="([^"\n]+)"\n([\s\S]*?)^```/gm)]
    .filter((match) => match[1] === language)
    .map((match) => ({ title: match[2], source: match[3] }));
}

async function project(t, recipe, configuration) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-yaml-guide-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml");
  const config = join(directory, "outpost.yaml");
  await writeFile(file, recipe);
  await writeFile(config, configuration);
  const validation = await validateRecipeProject({ file, config });
  assert.equal(validation.version, 3);
  assert.equal(validation.configurationVersion, 3);
  return { directory, file, config };
}

async function command(project, action, ...args) {
  return execute(
    process.execPath,
    [
      cli,
      "recipe",
      action,
      "--file",
      project.file,
      "--config",
      project.config,
      ...args,
    ],
    { cwd: project.directory, timeout: 30_000, maxBuffer: 1024 * 1024 },
  );
}

for (const locale of ["", "fr/"]) {
  test(`${locale}first YAML recipe runs locally without a Git repository`, async (t) => {
    const [recipe, configuration] = await blocks("yaml-recipes", locale);
    const files = await project(t, recipe.source, configuration.source);
    await command(files, "validate");
    const { stdout } = await command(files, "run", "--json");
    const report = JSON.parse(stdout);
    assert.equal(report.status, "done");
    assert.equal(report.outputs.read.stdout.trim(), "Hello from Outpost!");
    assert.equal(report.outputs.read.status, 0);
    await assert.rejects(readFile(join(files.directory, "hello.txt")), {
      code: "ENOENT",
    });
  });

  test(`${locale}workspace examples preserve copied sources and select a Git branch`, async (t) => {
    const [recipe] = await blocks("yaml-recipes", locale);
    const configurations = (await blocks("recipe-workspaces", locale)).filter(
      (block) => block.title === "outpost.yaml",
    );
    for (const configuration of configurations) {
      const files = await project(t, recipe.source, configuration.source);
      const value = parse(configuration.source);
      if (value.workspace.kind === "directory") {
        await mkdir(join(files.directory, "documents"));
        await writeFile(
          join(files.directory, "documents", "original.txt"),
          "Keep me",
        );
        if (value.workspace.access !== "copy") continue;
        await command(files, "run", "--json");
        assert.equal(
          await readFile(join(files.directory, "results", "hello.txt"), "utf8"),
          "Hello from Outpost!",
        );
        assert.equal(
          await readFile(
            join(files.directory, "documents", "original.txt"),
            "utf8",
          ),
          "Keep me",
        );
        await assert.rejects(
          readFile(join(files.directory, "documents", "hello.txt")),
          {
            code: "ENOENT",
          },
        );
        continue;
      }
      const repository = join(files.directory, "project");
      await mkdir(repository);
      for (const args of [
        ["init", "-b", "main"],
        [
          "-c",
          "user.name=Guide",
          "-c",
          "user.email=guide@example.invalid",
          "commit",
          "--allow-empty",
          "-m",
          "Initial",
        ],
      ])
        await execute("git", args, { cwd: repository });
      const { stdout } = await command(files, "run", "--json");
      assert.equal(JSON.parse(stdout).status, "done");
      const { stdout: branch } = await execute(
        "git",
        ["branch", "--show-current"],
        { cwd: repository },
      );
      assert.equal(branch.trim(), "main");
      await execute(
        "git",
        ["show-ref", "--verify", "refs/heads/feature/hello"],
        { cwd: repository },
      );
      await assert.rejects(readFile(join(repository, "hello.txt")), {
        code: "ENOENT",
      });
    }
  });

  test(`${locale}sandbox examples share one workspace and named workspaces keep their branches`, async (t) => {
    const named = Object.fromEntries(
      (await blocks("recipe-workspaces", locale)).map((block) => [
        block.title,
        block.source,
      ]),
    );
    const files = await project(
      t,
      named["recipe.yaml — sandboxes"],
      named["outpost.yaml — sandboxes"],
    );
    // Host sandboxes stand in for Docker and Podman; test:container runs real engines.
    const local = parse(named["outpost.yaml — sandboxes"]);
    for (const sandbox of Object.values(local.sandboxes)) {
      sandbox.provider = "local";
      delete sandbox.image;
    }
    await writeFile(files.config, stringify(local));
    const report = JSON.parse((await command(files, "run", "--json")).stdout);
    assert.equal(report.status, "done");
    assert.equal(report.outputs.review.stdout, "drafted in Docker\n");
    assert.equal(
      await readFile(join(files.directory, "results", "notes.txt"), "utf8"),
      "drafted in Docker\nreviewed in Podman\n",
    );
    const branches = await project(
      t,
      stringify({
        version: 3,
        name: "branches",
        tasks: [
          { key: "app", command: { executable: "git", arguments: ["status"] } },
          {
            key: "docs",
            sandbox: "writer",
            command: { executable: "git", arguments: ["status"] },
          },
        ],
      }),
      named["outpost.yaml — workspaces"],
    );
    const repository = join(branches.directory, "project");
    await mkdir(repository);
    await execute("git", ["init", "-b", "main"], { cwd: repository });
    await execute(
      "git",
      [
        "-c",
        "user.name=Guide",
        "-c",
        "user.email=guide@example.invalid",
        "commit",
        "--allow-empty",
        "-m",
        "Initial",
      ],
      { cwd: repository },
    );
    const run = JSON.parse((await command(branches, "run", "--json")).stdout);
    assert.equal(run.status, "done");
    assert.match(run.outputs.app.stdout, /On branch feature\/app/);
    assert.match(run.outputs.docs.stdout, /On branch feature\/docs/);
    assert.equal(run.workspaces.docs.branch, "feature/docs");
  });

  test(`${locale}workflow examples validate typed inputs and separate branches`, async (t) => {
    const [, configuration] = await blocks("yaml-recipes", locale);
    const [recipe, isolated, isolatedConfiguration] = await blocks(
      "recipe-workflows",
      locale,
    );
    const files = await project(t, recipe.source, configuration.source);
    const { stdout } = await command(
      files,
      "run",
      "--input",
      'changes={"files":["a.ts"]}',
      "--json",
    );
    assert.deepEqual(JSON.parse(stdout).outputs.envelope.value.files, ["a.ts"]);
    const empty = JSON.parse(
      (await command(files, "run", "--input", 'changes={"files":[]}', "--json"))
        .stdout,
    );
    assert.equal(empty.outputs.envelope, undefined);
    await assert.rejects(
      command(files, "run", "--input", 'changes={"files":[42]}', "--json"),
    );
    await project(t, isolated.source, isolatedConfiguration.source);
  });

  test(`${locale}durability and services examples preserve a pending approval`, async (t) => {
    const [configuration, recipe] = await blocks("recipe-durability", locale);
    const files = await project(t, recipe.source, configuration.source);
    let output;
    try {
      await command(files, "run", "--json");
      assert.fail("An approval must remain pending without interaction");
    } catch (error) {
      assert.equal(error.code, 1);
      output = JSON.parse(error.stdout);
    }
    assert.equal(output.status, "paused");
    assert.deepEqual(output.outputs.evidence.value, {
      summary: "Ready for review",
    });
    assert.equal(output.outputs.accepted, undefined);
    const status = JSON.parse(
      (await command(files, "status", "--run-id", "reviewed-change", "--json"))
        .stdout,
    );
    assert.ok(status);
    const [worker, schedule, clock, trigger, webhook] = await blocks(
      "recipe-services",
      locale,
    );
    const combined = {
      ...parse(configuration.source),
      ...parse(worker.source),
      ...parse(schedule.source),
      ...parse(trigger.source),
    };
    Object.assign(
      combined.services,
      parse(clock.source),
      parse(webhook.source),
    );
    await project(t, recipe.source, stringify(combined));
  });

  test(`${locale}agent, reporting and callback examples have complete bindings`, async (t) => {
    const [configuration, recipe] = await blocks(
      "recipe-configuration",
      locale,
    );
    await project(t, recipe.source, configuration.source);
    const [checkpointConfiguration, durableRecipe] = await blocks(
      "recipe-durability",
      locale,
    );
    const [interactive] = await blocks("recipe-dialogue", locale);
    await project(
      t,
      stringify({
        ...parse(durableRecipe.source),
        tasks: parse(interactive.source),
      }),
      stringify({
        ...parse(configuration.source),
        ...parse(checkpointConfiguration.source),
      }),
    );
    const [tutorial] = await blocks("yaml-recipes", locale);
    const [observation] = await blocks("recipe-observation", locale);
    await project(t, tutorial.source, observation.source);
    const [, fileConfiguration] = await blocks("yaml-recipes", locale);
    const [harness, structuredRecipe, response] = await blocks(
      "recipe-harness",
      locale,
    );
    await project(
      t,
      structuredRecipe.source,
      stringify({
        ...parse(fileConfiguration.source),
        ...parse(harness.source),
        ...parse(response.source),
      }),
    );
    const [callbackRecipe, callbackConfiguration] = await blocks(
      "recipe-extensions",
      locale,
    );
    const files = await project(
      t,
      callbackRecipe.source,
      callbackConfiguration.source,
    );
    const [module] = await blocks("recipe-extensions", locale, "ts");
    await writeFile(join(files.directory, "steps.ts"), module.source);
    const report = JSON.parse((await command(files, "run", "--json")).stdout);
    assert.deepEqual(report.outputs.summarize.value, {
      count: 2,
      files: ["src/index.ts", "src/parser.ts"],
    });
  });
}
