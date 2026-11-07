import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { Ajv2020 } from "ajv/dist/2020.js";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import {
  createRecipeRuntime,
  validateRecipeProject,
} from "../../src/recipes.ts";
import { defineRecipe } from "../../src/application/recipe.ts";
import { createSandbox } from "../../src/application/sandbox.ts";
import { createObservationHub } from "../../src/observation.ts";
import {
  LoopTaskExhausted,
  createWorkflowCheckpointStore,
} from "../../src/workflows.ts";
import { createLocalTransport } from "../../src/core.ts";
import {
  createScriptedAgent,
  createMemorySandboxProvider,
} from "../../src/testing.ts";
import { recipeObject } from "../../src/domain/recipes/values.ts";
import { recipeAgentRoles } from "../../src/domain/recipes/step-resources.ts";
import { validateRecipe } from "../../src/domain/recipe.ts";
import { ConfigurationError } from "../../src/domain/configuration-diagnostic.ts";
import {
  recipeHasSharedSandbox,
  validateRecipeConcurrency,
} from "../../src/application/recipes/workflow.ts";
import { repository } from "../helpers.ts";
import type { Observation } from "../../src/observation.ts";
import type { MemoryCommand } from "../../src/testing.ts";
import type { WorkflowEvent } from "../../src/workflows.ts";
import type { DispatchOptions } from "../../src/application/execution.types.ts";

const npmTest = { executable: "npm", arguments: ["test"] };

async function loopSandbox(
  t: Parameters<typeof repository>[0],
  commands: readonly MemoryCommand[],
) {
  const root = await repository(t);
  return createSandbox({
    repository: root,
    sandboxProvider: createMemorySandboxProvider({ commands }),
    logging: false,
  });
}

function recorded(
  sandbox: Awaited<ReturnType<typeof loopSandbox>>,
  requests: DispatchOptions<unknown>[],
) {
  return {
    ...sandbox,
    dispatch<T>(options: DispatchOptions<T>) {
      requests.push(options);
      return sandbox.dispatch(options);
    },
  };
}

test("a declarative loop retries an agent attempt until its command check passes", async (t) => {
  await using sandbox = await loopSandbox(t, [
    {
      ...npmTest,
      status: 1,
      stdout: "not ok 1 - parser\n",
      stderr: "1 failing\n",
    },
    { ...npmTest, stdout: "ok 1 - parser\n" },
  ]);
  const requests: DispatchOptions<unknown>[] = [];
  const events: WorkflowEvent[] = [];
  const observed: Observation[] = [];
  const workflow = defineRecipe(
    JSON.stringify({
      version: 3,
      name: "fix-until-green",
      inputs: { goal: { type: "string", description: "Goal" } },
      tasks: [
        {
          key: "implement",
          loop: {
            maxRounds: 3,
            attempt: {
              agent: "coder",
              brief:
                "Round {{ loop.round }}: {{ inputs.goal }}\n{{ loop.feedback }}",
            },
            check: { command: npmTest },
          },
        },
        {
          key: "summary",
          after: ["implement"],
          value: "{{ steps.implement.text }} ({{ steps.implement.rounds }})",
        },
      ],
    }),
    {
      sandbox: recorded(sandbox, requests),
      inputs: { goal: "fix the parser" },
      agents: {
        coder: createScriptedAgent({
          turns: [
            {
              text: "First try",
              commit: { message: "try parser", files: { "a.txt": "1" } },
            },
            {
              text: "Fixed",
              commit: { message: "fix parser", files: { "a.txt": "2" } },
            },
          ],
        }),
      },
    },
  );
  const result = await workflow.start({
    observe: (event) => events.push(event),
    observation: createObservationHub({
      sinks: [{ observe: (value) => void observed.push(value) }],
    }),
  });
  result.unwrap();
  assert.deepEqual(
    requests.map((request) => request.brief.text),
    [
      "Round 1: fix the parser\n",
      "Round 2: fix the parser\nnpm exited with status 1.\n\nstdout:\nnot ok 1 - parser\n\nstderr:\n1 failing",
    ],
  );
  assert.ok(requests.every((request) => request.continuation === undefined));
  const output = result.value(workflow.tasks[0]!);
  assert.ok(recipeObject(output));
  assert.equal(output.text, "Fixed");
  assert.equal(output.rounds, 2);
  assert.equal(output.usage, undefined);
  assert.equal(output.turns, undefined);
  assert.ok(Array.isArray(output.commits));
  assert.deepEqual(
    output.commits.map((commit) => recipeObject(commit) && commit.subject),
    ["try parser", "fix parser"],
  );
  assert.deepEqual(result.value(workflow.tasks[1]!), { value: "Fixed (2)" });
  assert.deepEqual(
    events
      .filter((event) => event.type === "loop" && event.phase === "complete")
      .map((event) => event.feedback?.split("\n")[0]),
    ["npm exited with status 1.", undefined],
  );
  assert.ok(
    observed.some(
      (value) =>
        value.event.kind === "command-output" &&
        value.event.text.includes("not ok 1"),
    ),
  );
});

test("a continued loop sends feedback in the same conversation and an agent check decides", async (t) => {
  await using sandbox = await loopSandbox(t, []);
  const requests: DispatchOptions<unknown>[] = [];
  const workflow = defineRecipe(
    JSON.stringify({
      version: 3,
      name: "reviewed",
      tasks: [
        {
          key: "implement",
          quotaResume: "restart",
          loop: {
            maxRounds: 2,
            attempt: {
              agent: "coder",
              brief: "Implement the change.",
              conversation: "continue",
            },
            check: {
              agent: "reviewer",
              brief: "Review round {{ loop.round }}: {{ loop.text }}",
            },
          },
        },
      ],
    }),
    {
      sandbox: recorded(sandbox, requests),
      agents: {
        coder: createScriptedAgent({
          turns: [{ text: "Draft" }, { text: "Draft with tests" }],
        }),
        reviewer: createScriptedAgent({
          name: "reviewer",
          turns: [
            {
              text: '<loop-check>{"done": false, "feedback": "Add tests"}</loop-check>',
            },
            { text: '<loop-check>{"done": true, "feedback": ""}</loop-check>' },
          ],
        }),
      },
    },
  );
  const result = await workflow.start();
  result.unwrap();
  assert.deepEqual(
    requests.map((request) => request.brief.text),
    [
      "Implement the change.",
      "Review round 1: Draft",
      "The check rejected your previous attempt:\n\nAdd tests\n\nAddress this feedback, then complete the task.",
      "Review round 2: Draft with tests",
    ],
  );
  assert.equal(requests[0]?.continuation, undefined);
  assert.equal(requests[1]?.response?.tag, "loop-check");
  assert.ok(requests[2]?.continuation?.id);
  assert.equal(requests[3]?.continuation, undefined);
  const output = result.value(workflow.tasks[0]!);
  assert.ok(recipeObject(output));
  assert.equal(output.text, "Draft with tests");
  assert.equal(output.conversation, requests[2]?.continuation?.id);
  assert.deepEqual(output.commits, []);
});

test("an exhausted declarative loop reports the last command feedback in its message", async (t) => {
  await using sandbox = await loopSandbox(t, [
    { ...npmTest, status: 2, stdout: "still failing" },
  ]);
  const workflow = defineRecipe(
    JSON.stringify({
      version: 3,
      name: "exhausted",
      tasks: [
        {
          key: "implement",
          loop: {
            maxRounds: 1,
            attempt: { agent: "coder", brief: "Fix. {{ loop.feedback }}" },
            check: { command: npmTest },
          },
        },
      ],
    }),
    {
      sandbox,
      agents: { coder: createScriptedAgent({ turns: [{ text: "Tried" }] }) },
    },
  );
  const result = await workflow.start();
  assert.equal(result.status, "failed");
  const [error] = result.errors;
  assert.ok(error instanceof LoopTaskExhausted);
  assert.equal(
    error.message,
    "Loop task implement exhausted its 1 rounds: npm exited with status 2.\n\nstdout:\nstill failing",
  );
});

function loopRecipe(loop: Record<string, unknown>, extra: object = {}) {
  return {
    version: 3,
    name: "loop",
    tasks: [{ key: "implement", loop, ...extra }],
  };
}

function refusal(code: string, path: string) {
  return (error: unknown) =>
    error instanceof ConfigurationError &&
    error.diagnostic.code === code &&
    error.diagnostic.path.join(".") === path;
}

test("declarative loops are refused before execution when the attempt cannot see the feedback or fields conflict", () => {
  const attempt = { agent: "coder", brief: "Fix. {{ loop.feedback }}" };
  const check = { command: npmTest };
  validateRecipe(loopRecipe({ maxRounds: 2, attempt, check }));
  validateRecipe(
    loopRecipe(
      {
        maxRounds: 2,
        attempt: { agent: "coder", brief: "Fix.", conversation: "continue" },
        check: { agent: "reviewer", brief: "Review {{ loop.text }}" },
      },
      { quotaResume: "continue" },
    ),
  );
  assert.throws(
    () =>
      validateRecipe(
        loopRecipe({
          maxRounds: 2,
          attempt: { agent: "coder", brief: "Fix." },
          check,
        }),
      ),
    refusal("missing-loop-feedback", "tasks.0.loop.attempt.brief"),
  );
  assert.throws(
    () =>
      validateRecipe(
        loopRecipe({
          maxRounds: 2,
          attempt: {
            agent: "coder",
            brief: "Fix.",
            conversation: "continue",
            followUp: "Try again.",
          },
          check,
        }),
      ),
    refusal("missing-loop-feedback", "tasks.0.loop.attempt.followUp"),
  );
  assert.throws(
    () =>
      validateRecipe(
        loopRecipe({
          maxRounds: 2,
          attempt: { ...attempt, followUp: "{{ loop.feedback }}" },
          check,
        }),
      ),
    /followUp requires conversation: continue/,
  );
  assert.throws(
    () =>
      validateRecipe(
        loopRecipe({
          maxRounds: 2,
          attempt,
          check: { $ref: "functions.check" },
        }),
      ),
    refusal("mixed-loop", "tasks.0.loop"),
  );
  assert.throws(
    () =>
      validateRecipe(
        loopRecipe({
          maxRounds: 2,
          attempt: {
            agent: "coder",
            brief: "{{ loop.feedback }} {{ loop.text }}",
          },
          check,
        }),
      ),
    /\{\{ loop.text \}\} is not available here/,
  );
  assert.throws(
    () =>
      validateRecipe(
        loopRecipe({
          maxRounds: 2,
          attempt,
          check: {
            command: { executable: "echo", arguments: ["{{ loop.text }}"] },
          },
        }),
      ),
    /use \{\{ loop.round \}\}$/,
  );
  assert.throws(
    () =>
      validateRecipe({
        ...loopRecipe({ maxRounds: 2, attempt, check }),
        tasks: [
          { key: "implement", loop: { maxRounds: 2, attempt, check } },
          { key: "after", after: ["implement"], value: "{{ loop.feedback }}" },
        ],
      }),
    /only available inside a loop attempt or check/,
  );
  assert.throws(
    () => validateRecipe(loopRecipe({ maxRounds: 2, attempt, check: {} })),
    refusal("missing-field", "tasks.0.loop.check"),
  );
  assert.throws(
    () =>
      validateRecipe(
        loopRecipe({
          maxRounds: 2,
          attempt: { ...attempt, retries: 2 },
          check,
        }),
      ),
    refusal("unknown-field", "tasks.0.loop.attempt.retries"),
  );
  assert.throws(
    () => validateRecipe(loopRecipe({ maxRounds: 0, attempt, check })),
    /maxRounds must be an integer >= 1/,
  );
  assert.throws(
    () =>
      validateRecipe(
        loopRecipe(
          {
            maxRounds: 2,
            attempt: { $ref: "functions.attempt" },
            check: { $ref: "functions.check" },
          },
          { quotaResume: "continue" },
        ),
      ),
    /quotaResume requires an agent, isolated or declarative loop task/,
  );
});

test("a declarative loop shares the recipe workspace and is ordered against other workspace tasks", () => {
  const document = validateRecipe({
    version: 3,
    name: "shared",
    workflow: { concurrency: 2 },
    tasks: [
      {
        key: "implement",
        loop: {
          maxRounds: 2,
          attempt: { agent: "coder", brief: "{{ loop.feedback }}" },
          check: { agent: "reviewer", brief: "Review." },
        },
      },
      { key: "docs", agent: "writer", brief: "Write docs." },
    ],
  });
  assert.equal(recipeHasSharedSandbox(document), true);
  assert.deepEqual(recipeAgentRoles(document), ["coder", "reviewer", "writer"]);
  assert.throws(
    () => validateRecipeConcurrency(document, 2),
    /Concurrent recipe tasks implement and docs share one sandbox/,
  );
});

test("validateRecipeProject locates loop agents and refuses a continuation the harness cannot resume", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-loop-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml");
  const config = join(directory, "outpost.yaml");
  const recipe = (dispatch: string) =>
    [
      "version: 3",
      "name: reviewed",
      "tasks:",
      "  - key: implement",
      "    loop:",
      "      maxRounds: 2",
      "      attempt:",
      "        agent: coder",
      "        brief: Implement the change.",
      "        conversation: continue",
      `        dispatch: ${dispatch}`,
      "      check:",
      "        agent: reviewer",
      "        brief: Review the change.",
      "",
    ].join("\n");
  const configuration = (coder: string, reviewer = true) =>
    [
      "version: 3",
      "workspace: { kind: ephemeral }",
      "sandbox: { provider: local }",
      "agents:",
      `  coder: { harness: ${coder}, authentication: account }`,
      ...(reviewer
        ? ["  reviewer: { harness: codex, authentication: account }"]
        : []),
      "",
    ].join("\n");
  await writeFile(file, recipe("{ deadlineMs: 600000 }"));
  await writeFile(config, configuration("codex", false));
  await assert.rejects(validateRecipeProject({ file, config }), (error) => {
    assert.ok(error instanceof ConfigurationError);
    assert.equal(error.diagnostic.code, "unknown-agent");
    assert.deepEqual(error.diagnostic.path, [
      "tasks",
      0,
      "loop",
      "check",
      "agent",
    ]);
    assert.equal(error.diagnostic.line, 13);
    return true;
  });
  await writeFile(config, configuration("codex"));
  const validation = await validateRecipeProject({ file, config });
  assert.deepEqual(validation.agents, ["coder", "reviewer"]);
  await writeFile(config, configuration("agy"));
  await assert.rejects(
    validateRecipeProject({ file, config }),
    (error) =>
      error instanceof ConfigurationError &&
      error.diagnostic.code === "unsupported-capability" &&
      /implement/.test(error.diagnostic.hint ?? ""),
  );
  await writeFile(file, recipe("{ continuation: { id: previous } }"));
  await writeFile(config, configuration("codex"));
  await assert.rejects(
    validateRecipeProject({ file, config }),
    refusal(
      "invalid-configuration",
      "tasks.0.loop.attempt.dispatch.continuation",
    ),
  );
});

test("a durable declarative loop resumes an interrupted check and continues the saved conversation", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-loop-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const checkpoint = {
    store: createWorkflowCheckpointStore({
      transporter: createLocalTransport({ directory }),
    }),
    runId: "loop",
    version: "1",
  };
  await using sandbox = await loopSandbox(t, [
    { ...npmTest, status: 1, stdout: "not ok" },
    npmTest,
  ]);
  const coder = createScriptedAgent({
    turns: [
      { text: "First", commit: { message: "first", files: { "a.txt": "1" } } },
      {
        text: "Second",
        commit: { message: "second", files: { "a.txt": "2" } },
      },
    ],
  });
  const source = JSON.stringify({
    version: 3,
    name: "durable-loop",
    tasks: [
      {
        key: "implement",
        loop: {
          maxRounds: 3,
          attempt: {
            agent: "coder",
            brief: "Implement.",
            conversation: "continue",
          },
          check: { command: npmTest },
        },
      },
    ],
  });
  const run = async (resume?: "retry-incomplete") => {
    const requests: DispatchOptions<unknown>[] = [];
    const workflow = defineRecipe(source, {
      sandbox: recorded(sandbox, requests),
      agents: { coder },
    });
    const stop = new AbortController();
    const result = await workflow.start({
      signal: stop.signal,
      checkpoint: { ...checkpoint, ...(resume ? { resume } : {}) },
      observe(event) {
        if (!resume && event.type === "loop" && event.phase === "check")
          stop.abort();
      },
    });
    return { result, requests, task: workflow.tasks[0]! };
  };
  const interrupted = await run();
  assert.equal(interrupted.result.status, "cancelled");
  assert.equal(interrupted.requests.length, 1);
  const resumed = await run("retry-incomplete");
  resumed.result.unwrap();
  assert.equal(resumed.requests.length, 1, "round 1 is not attempted again");
  const [request] = resumed.requests;
  assert.match(request?.brief.text ?? "", /^The check rejected[\s\S]*not ok/);
  const output = resumed.result.value(resumed.task);
  assert.ok(recipeObject(output));
  assert.equal(request?.continuation?.id, output.conversation);
  assert.equal(output.text, "Second");
  assert.equal(output.rounds, 2);
  assert.ok(Array.isArray(output.commits));
  assert.deepEqual(
    output.commits.map((commit) => recipeObject(commit) && commit.subject),
    ["first", "second"],
  );
});

test("createRecipeRuntime resolves the attempt's dispatch components and reports the last attempt", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-loop-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const git = (...args: string[]) =>
    promisify(execFile)("git", args, { cwd: directory });
  await git("init", "-b", "main");
  await git("config", "user.name", "Recipe");
  await git("config", "user.email", "recipe@example.invalid");
  await writeFile(join(directory, "initial"), "initial");
  await git("add", ".");
  await git("commit", "-m", "initial");
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  const module = resolve("test/fixtures/recipe-workflow.ts");
  const scripted = (turns: readonly object[]) => ({
    module,
    export: "agent",
    kind: "agent",
    version: "1",
    factory: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["turns"],
      properties: { turns: { type: "array", items: { type: "object" } } },
    },
    options: { turns },
  });
  await writeFile(
    config,
    JSON.stringify({
      version: 2,
      repository: ".",
      branch: { mode: "current" },
      sandbox: { $ref: "extensions.memory" },
      extensions: {
        memory: {
          module,
          export: "memory",
          kind: "sandboxProvider",
          version: "1",
        },
        coder: scripted([
          { text: '<result>{"ok": false}</result>' },
          { text: '<result>{"ok": true}</result>' },
        ]),
        reviewer: scripted([
          {
            text: '<loop-check>{"done": false, "feedback": "again"}</loop-check>',
          },
          { text: '<loop-check>{"done": true, "feedback": ""}</loop-check>' },
        ]),
      },
      agents: {
        coder: { $ref: "extensions.coder" },
        reviewer: { $ref: "extensions.reviewer" },
      },
      responses: {
        result: {
          type: "json",
          tag: "result",
          jsonSchema: {
            type: "object",
            properties: { ok: { type: "boolean" } },
            required: ["ok"],
            additionalProperties: false,
          },
        },
      },
    }),
  );
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "typed-loop",
      tasks: [
        {
          key: "implement",
          loop: {
            maxRounds: 2,
            attempt: {
              agent: "coder",
              brief: "Answer. {{ loop.feedback }}",
              dispatch: { response: { $ref: "responses.result" } },
            },
            check: { agent: "reviewer", brief: "Check {{ loop.text }}" },
          },
        },
      ],
    }),
  );
  assert.deepEqual((await validateRecipeProject({ file, config })).agents, [
    "coder",
    "reviewer",
  ]);
  await using runtime = await createRecipeRuntime({ file, config });
  const report = await runtime.run();
  assert.equal(report.status, "done", JSON.stringify(report.errors));
  assert.deepEqual(report.outputs.implement?.value, { ok: true });
  assert.equal(report.outputs.implement?.rounds, 2);
  assert.equal(
    report.tasks.find((task) => task.key === "implement")?.rounds?.length,
    2,
  );
});

test("the published recipe schema accepts declarative loops and refuses invalid ones", async () => {
  const schema = JSON.parse(await readFile("recipe.schema.json", "utf8"));
  const validate = new Ajv2020({ strict: false }).compile(schema);
  const attempt = { agent: "coder", brief: "Fix. {{ loop.feedback }}" };
  const valid = [
    loopRecipe({ maxRounds: 3, attempt, check: { command: npmTest } }),
    loopRecipe(
      {
        maxRounds: 3,
        attempt: {
          agent: "coder",
          brief: "Fix.",
          conversation: "continue",
          followUp: "{{ loop.feedback }}",
          dispatch: { deadlineMs: 600000 },
        },
        check: { agent: "reviewer", brief: "Review {{ loop.text }}" },
      },
      { quotaResume: "continue" },
    ),
    loopRecipe({
      maxRounds: 2,
      attempt: { $ref: "functions.attempt" },
      check: { $ref: "functions.check" },
    }),
  ];
  for (const recipe of valid)
    assert.equal(validate(recipe), true, JSON.stringify(validate.errors));
  for (const recipe of [
    loopRecipe({ maxRounds: 0, attempt, check: { command: npmTest } }),
    loopRecipe({
      maxRounds: 2,
      attempt: { ...attempt, followUp: "{{ loop.feedback }}" },
      check: { command: npmTest },
    }),
    loopRecipe({ maxRounds: 2, attempt, check: { agent: "reviewer" } }),
    loopRecipe({
      maxRounds: 2,
      attempt,
      check: { command: npmTest, agent: "reviewer", brief: "Review." },
    }),
  ])
    assert.equal(validate(recipe), false, JSON.stringify(recipe));
});

test("the bundled fix-until-green recipe feeds failing tests back into the coder's conversation", async (t) => {
  await using sandbox = await loopSandbox(t, [
    { executable: "bun", arguments: ["test"], status: 1, stdout: "1 fail" },
    { executable: "bun", arguments: ["test"], stdout: "1 pass" },
  ]);
  const requests: DispatchOptions<unknown>[] = [];
  const workflow = defineRecipe(
    await readFile("recipes/fix-until-green.yaml", "utf8"),
    {
      sandbox: recorded(sandbox, requests),
      inputs: { goal: "add a parser", runner: "bun" },
      agents: {
        coder: createScriptedAgent({
          turns: [{ text: "Added" }, { text: "Fixed" }],
        }),
      },
    },
  );
  const result = await workflow.start();
  result.unwrap();
  assert.equal(
    requests[0]?.brief.text,
    "Implement this change and commit it: add a parser",
  );
  assert.match(requests[1]?.brief.text ?? "", /bun exited with status 1/);
  assert.ok(requests[1]?.continuation?.id);
});
