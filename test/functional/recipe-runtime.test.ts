import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import {
  createRecipeRuntime,
  validateRecipeProject,
  createRecipeRegistry,
  defineRecipeComponent,
} from "../../src/recipes.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import type { Observation } from "../../src/domain/observation.types.ts";

test("YAML observation spans workflow and sandbox cleanup while the CLI is silent by default", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-runtime-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const git = (...args: string[]) =>
    promisify(execFile)("git", args, { cwd: directory });
  await git("init", "-b", "main");
  await git("config", "user.name", "Recipe test");
  await git("config", "user.email", "recipe@example.invalid");
  await writeFile(join(directory, "initial"), "initial");
  await git("add", ".");
  await git("commit", "-m", "Initial");
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "observe",
      tasks: [
        {
          key: "echo",
          command: {
            executable: process.execPath,
            arguments: ["-e", "console.log('task output')"],
          },
        },
      ],
    }),
  );
  const configuration = {
    version: 2,
    repository: directory,
    sandbox: { provider: "local" },
    branch: { mode: "current" },
  };
  await writeFile(config, JSON.stringify(configuration));
  const cli = (...extra: string[]) =>
    executeProcess({
      executable: process.execPath,
      arguments: [
        resolve("src/cli/main.ts"),
        "recipe",
        "run",
        "--file",
        file,
        "--config",
        config,
        ...extra,
      ],
    });
  const silent = await cli();
  assert.equal(silent.status, 0, silent.stderr);
  assert.equal(silent.stdout, "");
  assert.equal(silent.stderr, "");
  const json = await cli("--json");
  assert.equal(JSON.parse(json.stdout).status, "done");
  await writeFile(
    config,
    JSON.stringify({
      ...configuration,
      observation: { sinks: [{ type: "console", format: "json" }] },
      reports: [{ type: "text" }],
    }),
  );
  const declared = await cli();
  assert.match(declared.stdout, /observe: done/);
  assert.ok(
    declared.stderr
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line))
      .some((value) => value.event.kind === "command-output"),
  );
  const override = await cli("--json");
  assert.equal(JSON.parse(override.stdout).name, "observe");

  const events: Observation[] = [];
  let disposed = false;
  const registry = createRecipeRegistry({
    components: [
      defineRecipeComponent({
        name: "sink.fixture",
        kind: "sink",
        schema: { type: "object", additionalProperties: false },
        create() {
          return {
            observe(value: Observation) {
              events.push(value);
            },
          };
        },
        accepts(value) {
          return !!value && typeof value === "object" && "observe" in value;
        },
        dispose() {
          disposed = true;
          throw new Error("Fixture observer cleanup failed");
        },
      }),
    ],
  });
  await writeFile(
    config,
    JSON.stringify({
      ...configuration,
      observation: { sinks: [{ type: "fixture" }] },
    }),
  );
  await using runtime = await createRecipeRuntime({ file, config, registry });
  const observed = await runtime.run();
  assert.equal(observed.status, "done");
  assert.equal(
    observed.observerErrors?.[0]?.message,
    "Fixture observer cleanup failed",
  );
  assert.equal(disposed, true);
  assert.ok(
    events.some(
      (value) => value.source === "workflow" && value.scope.taskKey === "echo",
    ),
  );
  assert.ok(events.some((value) => value.event.kind === "command-output"));
  assert.ok(
    events.some(
      (value) =>
        value.event.kind === "operation" &&
        value.event.name === "repository.release",
    ),
  );
  disposed = false;
  await writeFile(
    config,
    JSON.stringify({
      ...configuration,
      repository: join(directory, "missing"),
      observation: { sinks: [{ type: "fixture" }] },
    }),
  );
  await using failed = await createRecipeRuntime({ file, config, registry });
  await assert.rejects(failed.run(), /Directory is unavailable/);
  assert.equal(
    disposed,
    true,
    "allocation failure must dispose prepared components",
  );
  await failed.close();
  await assert.rejects(failed.run(), /closed/);
});

test("recipe validation never imports extensions and runtime rejects incompatible exports before allocation", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-extension-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  const marker = join(directory, "loaded.txt");
  await writeFile(
    join(directory, "observer.mjs"),
    `import {writeFileSync} from 'node:fs'; writeFileSync(${JSON.stringify(marker)},'loaded'); export const sink = {observe() {}}; export const invalid = {};`,
  );
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "extension",
      tasks: [{ key: "hello", command: { executable: "hello" } }],
    }),
  );
  const configuration = {
    version: 2,
    repository: directory,
    sandbox: { provider: "local" },
    extensions: {
      fixture: {
        module: "./observer.mjs",
        export: "invalid",
        kind: "sink",
        version: "1",
      },
    },
    observation: { sinks: [{ $ref: "extensions.fixture" }] },
  };
  await writeFile(config, JSON.stringify(configuration));
  const report = await validateRecipeProject({ file, config });
  assert.deepEqual(report.extensions, ["extensions.fixture"]);
  await assert.rejects(readFile(marker), { code: "ENOENT" });
  await using runtime = await createRecipeRuntime({ file, config });
  await assert.rejects(runtime.run(), /invalid sink/);
  assert.equal(await readFile(marker, "utf8"), "loaded");
  await writeFile(
    config,
    JSON.stringify({
      ...configuration,
      observation: { $ref: "extensions.fixture" },
    }),
  );
  await assert.rejects(
    validateRecipeProject({ file, config }),
    /requires observation/,
  );
  await writeFile(
    config,
    JSON.stringify({
      ...configuration,
      observations: {
        first: { $ref: "observations.second" },
        second: { $ref: "observations.first" },
      },
    }),
  );
  await assert.rejects(validateRecipeProject({ file, config }), /cycle/);
  await writeFile(
    config,
    JSON.stringify({
      ...configuration,
      extensions: {
        fixture: {
          module: "https://example.invalid/observer.mjs",
          export: "sink",
          kind: "sink",
          version: "1",
        },
      },
    }),
  );
  await assert.rejects(validateRecipeProject({ file, config }), /local files/);
  const imported = pathToFileURL(resolve("src/domain/observation.ts")).href;
  await writeFile(
    join(directory, "borrowed.mts"),
    `import {createObservationHub} from ${JSON.stringify(imported)}; export const hub = createObservationHub(); hub.close = async () => { throw new Error('borrowed hub closed'); };`,
  );
  await writeFile(
    config,
    JSON.stringify({
      ...configuration,
      extensions: {
        hub: {
          module: "./borrowed.mts",
          export: "hub",
          kind: "observation",
          version: "1",
        },
      },
      observation: { $ref: "extensions.hub" },
    }),
  );
  await using borrowed = await createRecipeRuntime({ file, config });
  await assert.rejects(borrowed.run(), /git|repository/i);
});
