import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, writeFile, rm, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import {
  createRecipeRuntime,
  validateRecipeProject,
  createRecipeRegistry,
  defineRecipeComponent,
} from "../../src/recipes.ts";
import {
  defineTask,
  defineWorkflow,
  defineLoopTask,
  defineDecision,
  defineDecisionTask,
  openWorkspace,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import {
  transform,
  attempt,
  check,
  decider,
  visits,
} from "../fixtures/recipe-workflow.ts";
import { parseRecipe } from "../../src/infrastructure/recipe.ts";
import { Ajv2020 } from "ajv/dist/2020.js";

const module = resolve("test/fixtures/recipe-workflow.ts");
const extension = (kind: string, name: string, contract?: string) => ({
  module,
  export: name,
  kind,
  version: "1",
  ...(contract ? { contract } : {}),
});
const configuration = {
  version: 2,
  repository: "/not-an-allocated-repository",
  sandbox: { provider: "local" },
  extensions: {
    transform: extension("callback", "transform", "call.options.perform"),
    attempt: extension("callback", "attempt", "loop.options.attempt"),
    check: extension("callback", "check", "loop.options.check"),
    decider: extension("decisionProvider", "decider"),
  },
};

test("recipe data, callbacks, loop rounds and decisions match TypeScript without allocating a sandbox", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-workflow-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  const recipe = {
    version: 3,
    name: "composition",
    inputs: {
      payload: {
        type: "object",
        description: "Typed input",
        default: { tags: ["review"], enabled: true },
        schema: {
          type: "object",
          required: ["tags", "enabled"],
          properties: {
            tags: { type: "array", items: { type: "string" } },
            enabled: { type: "boolean" },
          },
          additionalProperties: false,
        },
      },
    },
    workflow: { concurrency: 3, stopOnError: false },
    tasks: [
      {
        key: "select",
        value: {
          enabled: { $input: "payload", path: ["enabled"] },
          tags: { $select: { from: { $input: "payload" }, path: ["tags"] } },
          literal: { $literal: "{{ steps.missing.text }}" },
        },
      },
      {
        key: "transform",
        after: ["select"],
        when: {
          all: [
            { eq: [{ $step: "select", path: ["value", "enabled"] }, true] },
            { in: ["review", { $input: "payload", path: ["tags"] }] },
          ],
        },
        call: { $ref: "extensions.transform" },
        arguments: { $step: "select", path: ["value", "tags"] },
      },
      {
        key: "repeat",
        after: ["transform"],
        loop: {
          maxRounds: 3,
          attempt: { $ref: "extensions.attempt" },
          check: { $ref: "extensions.check" },
        },
      },
      {
        key: "choose",
        after: ["repeat"],
        decision: {
          provider: { $ref: "extensions.decider" },
          model: "offline",
          decision: {
            type: "questions",
            questions: { approve: { type: "noul", instructions: "Evaluate" } },
          },
        },
        state: { $step: "repeat", path: ["value"] },
      },
      {
        key: "skip",
        when: { exists: { $input: "payload", path: ["missing"] } },
        value: "never",
      },
    ],
  };
  await writeFile(file, JSON.stringify(recipe));
  await writeFile(config, JSON.stringify(configuration));
  await validateRecipeProject({ file, config });
  const schema = JSON.parse(await readFile("recipe.schema.json", "utf8"));
  const validate = new Ajv2020({ strict: false }).compile(schema);
  assert.equal(validate(recipe), true, JSON.stringify(validate.errors));
  visits.length = 0;
  await using runtime = await createRecipeRuntime({ file, config });
  const yaml = await runtime.run();
  assert.equal(yaml.status, "done", JSON.stringify(yaml.errors));
  assert.equal(yaml.workspace, undefined);
  assert.deepEqual(yaml.outputs.select?.value, {
    enabled: true,
    tags: ["review"],
    literal: "{{ steps.missing.text }}",
  });
  assert.equal(
    yaml.tasks.find((task) => task.key === "skip")?.status,
    "skipped",
  );
  assert.equal(
    yaml.tasks.find((task) => task.key === "repeat")?.rounds?.length,
    2,
  );
  const events = [...visits];
  visits.length = 0;
  const selected = defineTask({
    key: "select",
    perform: () => ({ tags: ["review"] }),
  });
  const transformed = defineTask({
    key: "transform",
    after: [selected],
    perform: (context) => transform(context.value(selected).tags, context),
  });
  const repeated = defineLoopTask({
    key: "repeat",
    after: [transformed],
    maxRounds: 3,
    attempt,
    check,
  });
  const chosen = defineDecisionTask({
    key: "choose",
    after: [repeated],
    provider: decider,
    model: "offline",
    decision: defineDecision({
      questions: { approve: { type: "noul", instructions: "Evaluate" } },
    }),
    state: (context) => ({ round: context.value(repeated).round }),
  });
  const typed = await defineWorkflow("composition", [
    selected,
    transformed,
    repeated,
    chosen,
  ]).start({ concurrency: 3 });
  typed.unwrap();
  assert.deepEqual(visits, events);
  assert.deepEqual(yaml.outputs.choose?.value, typed.value(chosen));
  assert.deepEqual(yaml.usage?.tokens, typed.usage.tokens);
  await assert.rejects(
    runtime.run({ inputs: { payload: { tags: [3], enabled: true } } }),
    /inputs.payload/,
  );
});

test("format 3 refuses unsafe references, invalid conditions and concurrent shared sandbox use before importing extensions", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-validation-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  const marker = join(directory, "marker");
  await writeFile(
    join(directory, "extension.mjs"),
    `import { writeFileSync } from 'node:fs'; writeFileSync(${JSON.stringify(marker)}, 'loaded'); export const perform = () => 1;`,
  );
  await writeFile(
    config,
    JSON.stringify({
      ...configuration,
      extensions: {
        action: {
          module: "./extension.mjs",
          export: "perform",
          kind: "callback",
          contract: "call.options.perform",
          version: "1",
        },
      },
    }),
  );
  const failures = [
    { tasks: [{ key: "one", value: { $input: "missing" } }] },
    {
      tasks: [
        { key: "one", value: 1 },
        { key: "two", value: { $step: "one" } },
      ],
    },
    { tasks: [{ key: "one", when: { eq: [1] }, value: 1 }] },
    {
      tasks: [{ key: "one", value: { $input: "a", extra: true } }],
      inputs: { a: { type: "number", description: "input" } },
    },
    {
      tasks: [{ key: "one", value: "{{ inputs.a }}" }],
      inputs: { a: { type: "array", description: "input" } },
    },
    {
      workflow: { concurrency: 2 },
      tasks: [
        { key: "one", command: { executable: "true" } },
        { key: "two", command: { executable: "true" } },
      ],
    },
    { tasks: [{ key: "one", value: 1, options: { unknown: true } }] },
  ];
  for (const invalid of failures) {
    await writeFile(
      file,
      JSON.stringify({ version: 3, name: "invalid", ...invalid }),
    );
    await assert.rejects(validateRecipeProject({ file, config }));
  }
  await assert.rejects(readFile(marker), { code: "ENOENT" });
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "credentials",
      tasks: [
        {
          key: "isolated",
          isolated: {
            repository: "/not-a-repository",
            sandboxProvider: { type: "local" },
            agent: {
              type: "composed",
              harness: {
                type: "claude",
                authentication: {
                  usage: {
                    variable: "OUTPOST_RECIPE_TEST_MISSING_ISOLATED_AUTH",
                  },
                },
              },
            },
            brief: { text: "Run" },
          },
        },
      ],
    }),
  );
  await writeFile(
    config,
    JSON.stringify({
      version: 2,
      repository: "/not-a-repository",
      sandbox: { provider: "local" },
    }),
  );
  await using invalidRuntime = await createRecipeRuntime({ file, config });
  await assert.rejects(
    invalidRuntime.run(),
    /OUTPOST_RECIPE_TEST_MISSING_ISOLATED_AUTH/,
  );

  assert.throws(
    () =>
      parseRecipe(
        JSON.stringify({
          version: 2,
          name: "legacy",
          inputs: { value: { type: "object", description: "unavailable" } },
          tasks: [{ key: "one", command: { executable: "true" } }],
        }),
      ),
    /type/,
  );
});

test("isolated recipe tasks run concurrently in separate repositories with native dispatch projections", async (t) => {
  const directory = await mkdtemp(
    join(tmpdir(), "outpost-recipe-repositories-"),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const repositories = await Promise.all(
    ["left", "right"].map(async (name) => {
      const repository = join(directory, name);
      await promisify(execFile)("git", ["init", "-b", "main", repository]);
      const git = (...args: string[]) =>
        promisify(execFile)("git", args, { cwd: repository });
      await git("config", "user.name", "Recipe");
      await git("config", "user.email", "recipe@example.invalid");
      await writeFile(join(repository, "initial"), "initial");
      await git("add", ".");
      await git("commit", "-m", "initial");
      return repository;
    }),
  );
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  await writeFile(
    config,
    JSON.stringify({
      ...configuration,
      extensions: {
        memory: extension("sandboxProvider", "memory"),
        ...Object.fromEntries(
          ["left", "right"].map((name) => [
            name,
            {
              ...extension("agent", "agent"),
              factory: true,
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["turns"],
                properties: {
                  turns: { type: "array", items: { type: "object" } },
                },
              },
              options: {
                turns: [
                  {
                    text: name,
                    usage: { input: 2, output: 3 },
                    commit: {
                      message: `Update ${name}`,
                      files: { "result.txt": name },
                    },
                  },
                ],
              },
            },
          ]),
        ),
      },
    }),
  );
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "repositories",
      workflow: { concurrency: 2 },
      tasks: ["left", "right"].map((key, index) => ({
        key,
        isolated: {
          repository: repositories[index],
          sandboxProvider: { $ref: "extensions.memory" },
          agent: { $ref: `extensions.${key}` },
          brief: { text: `Update ${key}` },
          logging: false,
          branch: { mode: "integrate" },
        },
      })),
    }),
  );
  await using runtime = await createRecipeRuntime({ file, config });
  const report = await runtime.run();
  assert.equal(report.status, "done", JSON.stringify(report.errors));
  assert.equal(report.workspace, undefined);
  assert.equal(report.usage?.tokens.input, 4);
  for (const [index, key] of ["left", "right"].entries()) {
    assert.equal(
      await readFile(join(repositories[index]!, "result.txt"), "utf8"),
      key,
    );
    assert.equal(report.outputs[key]?.text, key);
    assert.equal(report.outputs[key]?.resume, undefined);
    assert.equal(typeof report.outputs[key]?.directory, "string");
  }
  await using workspace = await openWorkspace({
    repository: repositories[0]!,
    branch: { mode: "named", name: "borrowed" },
  });
  const registry = createRecipeRegistry({
    components: [
      defineRecipeComponent({
        name: "workspace.borrowed",
        kind: "workspace",
        schema: { type: "object", additionalProperties: false },
        create: () => workspace,
        accepts: (value) => value === workspace,
      }),
    ],
  });
  await writeFile(
    config,
    JSON.stringify({
      version: 2,
      repository: repositories[0],
      sandbox: { provider: "local" },
      workspace: { workspace: { type: "borrowed" } },
    }),
  );
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "borrowed",
      tasks: [
        {
          key: "read",
          command: {
            executable: "git",
            arguments: ["rev-parse", "--abbrev-ref", "HEAD"],
          },
        },
      ],
    }),
  );
  await using borrowed = await createRecipeRuntime({ file, config, registry });
  assert.equal((await borrowed.run()).outputs.read?.stdout, "borrowed\n");
  await borrowed.close();
  await using usable = await workspace.sandbox({
    sandboxProvider: createLocalSandboxProvider(),
  });
  assert.equal(
    (
      await usable.command({
        executable: "git",
        arguments: ["status", "--porcelain"],
      })
    ).status,
    0,
  );
});
