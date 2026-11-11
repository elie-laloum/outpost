import assert from "node:assert/strict";
import { test } from "node:test";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
import {
  createLocalTransport,
  createFallbackAgent,
  OutpostError,
} from "../../src/core.ts";
import {
  createScriptedAgent,
  createMemorySandboxProvider,
} from "../../src/testing.ts";
import { recipeObject } from "../../src/domain/recipes/values.ts";
import { recipeAgentRoles } from "../../src/domain/recipes/step-resources.ts";
import { validateRecipe } from "../../src/domain/recipe.ts";
import { ConfigurationError } from "../../src/domain/configuration-diagnostic.ts";
import {
  bindRecipeWorkflow,
  recipeHasSharedSandbox,
  validateRecipeConcurrency,
} from "../../src/application/recipes/workflow.ts";
import {
  defineJsonResponse,
  defineTextResponse,
} from "../../src/domain/response.ts";
import { recordRecovery } from "../../src/domain/errors.ts";
import type { RecipeExecutionBindings } from "../../src/application/recipes/workflow-components.types.ts";
import type { RecipeDispatchSettings } from "../../src/application/recipes/agent-components.types.ts";
import type { DispatchAgent } from "../../src/domain/fallback-agent.types.ts";
import { recoveryDetails } from "../../src/domain/errors.ts";
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

test("declarative loops accept briefs without feedback and followUp in new conversations, and refuse conflicting fields", () => {
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
  validateRecipe(
    loopRecipe({
      maxRounds: 2,
      attempt: { agent: "coder", brief: "Fix." },
      check,
    }),
  );
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
  );
  validateRecipe(
    loopRecipe({
      maxRounds: 2,
      attempt: { ...attempt, followUp: "Fix again: {{ loop.feedback }}" },
      check,
    }),
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

test("the published recipe schema accepts declarative loops in both forms and refuses invalid ones", async () => {
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
    loopRecipe({
      maxRounds: 2,
      attempt: { ...attempt, followUp: "Fix again: {{ loop.feedback }}" },
      check: { command: npmTest },
    }),
    loopRecipe(
      {
        maxRounds: 4,
        attempt: [
          { agent: "coder", brief: "Code.", conversation: "continue" },
          { command: lint },
          { agent: "documenter", brief: "Document.", followUp: "Again." },
        ],
        check: [
          { command: npmTest },
          {
            agent: "reviewer",
            brief: "Review.",
            dispatch: {
              deadlineMs: 600000,
              response: { $ref: "responses.review" },
            },
            done: {
              all: [
                { gte: [{ $response: ["score"] }, { $input: "threshold" }] },
                { eq: [{ $response: ["issues"] }, []] },
              ],
            },
          },
        ],
      },
      { quotaResume: "restart" },
    ),
  ];
  for (const recipe of valid)
    assert.equal(validate(recipe), true, JSON.stringify(validate.errors));
  for (const recipe of [
    loopRecipe({ maxRounds: 0, attempt, check: { command: npmTest } }),
    loopRecipe({ maxRounds: 2, attempt, check: { agent: "reviewer" } }),
    loopRecipe({ maxRounds: 2, attempt: [], check: { command: npmTest } }),
    loopRecipe({ maxRounds: 2, attempt, check: [] }),
    loopRecipe({
      maxRounds: 2,
      attempt: [{ command: lint }],
      check: { command: npmTest },
    }),
    loopRecipe({
      maxRounds: 2,
      attempt: { command: lint },
      check: { command: npmTest },
    }),
    loopRecipe({
      maxRounds: 2,
      attempt: [{ ...attempt, done: true }],
      check: { command: npmTest },
    }),
    loopRecipe({
      maxRounds: 2,
      attempt,
      check: [{ command: npmTest, done: true }],
    }),
    loopRecipe({
      maxRounds: 2,
      attempt,
      check: [{ agent: "reviewer", brief: "Review.", done: true }],
    }),
    loopRecipe({
      maxRounds: 2,
      attempt,
      check: [
        { agent: "reviewer", brief: "Review.", conversation: "continue" },
      ],
    }),
    loopRecipe(
      { maxRounds: 2, attempt, check: { command: npmTest } },
      { when: { eq: [{ $response: ["score"] }, 1] } },
    ),
    {
      version: 3,
      name: "reserved",
      tasks: [{ key: "value", value: { $response: ["score"] } }],
    },
    loopRecipe({
      maxRounds: 2,
      attempt,
      check: { command: npmTest, agent: "reviewer", brief: "Review." },
    }),
    loopRecipe(
      {
        maxRounds: 2,
        attempt: { $ref: "functions.attempt" },
        check: { $ref: "functions.check" },
      },
      { quotaResume: "continue" },
    ),
  ])
    assert.equal(validate(recipe), false, JSON.stringify(recipe));
});

test("the bundled fix-until-green recipe feeds failing tests back into the coder's conversation", async (t) => {
  await using sandbox = await loopSandbox(t, [
    {
      executable: "bun",
      arguments: ["run", "test"],
      status: 1,
      stdout: "1 fail",
    },
    { executable: "bun", arguments: ["run", "test"], stdout: "1 pass" },
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

function commandLoop(check: Record<string, unknown> = { command: npmTest }) {
  return JSON.stringify(
    loopRecipe({
      maxRounds: 2,
      attempt: { agent: "coder", brief: "Fix. {{ loop.feedback }}" },
      check,
    }),
  );
}

test("a check command that exceeds its deadline becomes feedback with the output seen so far", async (t) => {
  await using sandbox = await loopSandbox(t, [npmTest]);
  const requests: DispatchOptions<unknown>[] = [];
  let timedOut = false;
  const workflow = defineRecipe(commandLoop(), {
    sandbox: {
      ...recorded(sandbox, requests),
      async command(command) {
        if (timedOut) return sandbox.command(command);
        timedOut = true;
        command.observe?.("stdout", "running test 1\n");
        throw new OutpostError("timeout", "Command exceeded 50 ms", {
          deadlineMs: 50,
        });
      },
    },
    agents: {
      coder: createScriptedAgent({ turns: [{ text: "A" }, { text: "B" }] }),
    },
  });
  (await workflow.start()).unwrap();
  assert.equal(
    requests[1]?.brief.text,
    "Fix. npm did not finish: Command exceeded 50 ms.\n\nstdout:\nrunning test 1",
  );
});

test("long check output keeps its tail and counts what was omitted", async (t) => {
  await using sandbox = await loopSandbox(t, [
    { ...npmTest, status: 1, stdout: `${"x".repeat(5_000)}END\n` },
    npmTest,
  ]);
  const requests: DispatchOptions<unknown>[] = [];
  const workflow = defineRecipe(commandLoop(), {
    sandbox: recorded(sandbox, requests),
    agents: {
      coder: createScriptedAgent({ turns: [{ text: "A" }, { text: "B" }] }),
    },
  });
  (await workflow.start()).unwrap();
  const brief = requests[1]?.brief.text ?? "";
  assert.match(brief, /stdout:\n\[1003 characters omitted\]\nx{3997}END$/);
});

test("a continued loop fails clearly when the previous attempt reported no conversation", async (t) => {
  await using sandbox = await loopSandbox(t, [
    { ...npmTest, status: 1, stdout: "not ok" },
  ]);
  const workflow = defineRecipe(
    JSON.stringify(
      loopRecipe({
        maxRounds: 2,
        attempt: { agent: "coder", brief: "Fix.", conversation: "continue" },
        check: { command: npmTest },
      }),
    ),
    {
      sandbox: {
        ...sandbox,
        async dispatch<T>(options: DispatchOptions<T>) {
          const { conversation: _conversation, ...result } =
            await sandbox.dispatch(options);
          return result;
        },
      },
      agents: { coder: createScriptedAgent({ turns: [{ text: "A" }] }) },
    },
  );
  const result = await workflow.start();
  assert.equal(result.status, "failed");
  const [error] = result.errors;
  assert.ok(error instanceof OutpostError);
  assert.equal(error.code, "session");
  assert.match(error.message, /cannot continue round 2/);
});

test("a continued loop refuses a fallback agent before any round runs", async (t) => {
  await using sandbox = await loopSandbox(t, []);
  const coder = createFallbackAgent(
    [
      createScriptedAgent({ turns: [{ text: "A" }] }),
      createScriptedAgent({ name: "spare", turns: [{ text: "B" }] }),
    ],
    { on: ["quota"] },
  );
  assert.throws(
    () =>
      defineRecipe(
        JSON.stringify(
          loopRecipe({
            maxRounds: 2,
            attempt: {
              agent: "coder",
              brief: "Fix.",
              conversation: "continue",
            },
            check: { command: npmTest },
          }),
        ),
        { sandbox, agents: { coder } },
      ),
    (error) =>
      error instanceof ConfigurationError &&
      error.diagnostic.code === "unsupported-capability" &&
      error.diagnostic.path.join(".") ===
        "tasks.implement.loop.attempt.conversation",
  );
});

test("an agent check gets one repair for a malformed answer", async (t) => {
  await using sandbox = await loopSandbox(t, []);
  const requests: DispatchOptions<unknown>[] = [];
  const workflow = defineRecipe(
    commandLoop({ agent: "reviewer", brief: "Review {{ loop.text }}" }),
    {
      sandbox: recorded(sandbox, requests),
      agents: {
        coder: createScriptedAgent({ turns: [{ text: "Done" }] }),
        reviewer: createScriptedAgent({
          name: "reviewer",
          turns: [
            { text: "Looks good to me." },
            { text: '<loop-check>{"done": true, "feedback": ""}</loop-check>' },
          ],
        }),
      },
    },
  );
  (await workflow.start()).unwrap();
  assert.equal(requests[1]?.response?.repairs, 1);
});

const lint = { executable: "make", arguments: ["lint"] };

function stepsRecipe(loop: Record<string, unknown>, extra: object = {}) {
  return {
    version: 3,
    name: "steps",
    inputs: {
      threshold: { type: "number", description: "Score", default: 8 },
    },
    tasks: [{ key: "implement", loop, ...extra }],
  };
}

/** Binds a recipe with resolved loop dispatch options, as createRecipeRuntime would. */
function boundLoop(
  recipe: object,
  bindings: RecipeExecutionBindings,
  loopDispatch: Readonly<Record<string, RecipeDispatchSettings>> = {},
) {
  return bindRecipeWorkflow(validateRecipe(recipe), bindings, {
    workflow: {},
    steps: { implement: { loopDispatch } },
  });
}

const reviewSchema = {
  type: "object",
  properties: {
    score: { type: "number" },
    issues: { type: "array" },
    done: { type: "boolean" },
    feedback: { type: "string" },
  },
  required: ["feedback"],
};

const reviewResponse = (
  repairs = 0,
  jsonSchema: Readonly<Record<string, unknown>> = reviewSchema,
) =>
  defineJsonResponse<unknown>({
    tag: "review",
    repairs,
    jsonSchema,
    schema: (input) => input,
  });

function logged(
  sandbox: Awaited<ReturnType<typeof loopSandbox>>,
  requests: DispatchOptions<unknown>[],
  log: string[],
) {
  return {
    ...recorded(sandbox, requests),
    dispatch<T>(options: DispatchOptions<T>) {
      requests.push(options);
      log.push(`agent:${options.brief.text}`);
      return sandbox.dispatch(options);
    },
    command(command: Parameters<typeof sandbox.command>[0]) {
      log.push(`command:${command.executable}`);
      return sandbox.command(command);
    },
  };
}

test("a new-conversation attempt sends its followUp from round 2, or its brief again", async (t) => {
  for (const followUp of ["Fix again: {{ loop.feedback }}", undefined]) {
    await using sandbox = await loopSandbox(t, [
      { ...npmTest, status: 1, stdout: "not ok" },
      npmTest,
    ]);
    const requests: DispatchOptions<unknown>[] = [];
    const workflow = defineRecipe(
      JSON.stringify(
        loopRecipe({
          maxRounds: 2,
          attempt: {
            agent: "coder",
            brief: "Fix round {{ loop.round }}.",
            ...(followUp ? { followUp } : {}),
          },
          check: { command: npmTest },
        }),
      ),
      {
        sandbox: recorded(sandbox, requests),
        agents: {
          coder: createScriptedAgent({ turns: [{ text: "A" }, { text: "B" }] }),
        },
      },
    );
    (await workflow.start()).unwrap();
    assert.deepEqual(
      requests.map((request) => request.brief.text),
      [
        "Fix round 1.",
        followUp
          ? "Fix again: npm exited with status 1.\n\nstdout:\nnot ok"
          : "Fix round 2.",
      ],
    );
    assert.ok(requests.every((request) => request.continuation === undefined));
  }
});

test("attempt steps run in order and each agent continues its own conversation", async (t) => {
  const format = { executable: "make", arguments: ["format"] };
  await using sandbox = await loopSandbox(t, [
    format,
    { ...npmTest, status: 1, stdout: "not ok" },
    format,
    npmTest,
  ]);
  const requests: DispatchOptions<unknown>[] = [];
  const log: string[] = [];
  const coder = createScriptedAgent({
    turns: [
      { text: "Coded", commit: { message: "code", files: { "a.txt": "1" } } },
      {
        text: "Recoded",
        commit: { message: "recode", files: { "a.txt": "2" } },
      },
    ],
  });
  const documenter = createScriptedAgent({
    name: "documenter",
    turns: [
      {
        text: "Documented",
        commit: { message: "docs", files: { "d.md": "1" } },
      },
      { text: "Redocumented" },
    ],
  });
  const workflow = defineRecipe(
    JSON.stringify(
      stepsRecipe({
        maxRounds: 2,
        attempt: [
          {
            agent: "coder",
            brief: "Code {{ loop.round }}.",
            conversation: "continue",
            followUp: "Coder: {{ loop.feedback }}",
          },
          { command: format },
          { agent: "documenter", brief: "Document.", conversation: "continue" },
        ],
        check: [{ command: npmTest }],
      }),
    ),
    { sandbox: logged(sandbox, requests, log), agents: { coder, documenter } },
  );
  const result = await workflow.start();
  result.unwrap();
  const feedback = "npm exited with status 1.\n\nstdout:\nnot ok";
  assert.deepEqual(log, [
    "agent:Code 1.",
    "command:make",
    "agent:Document.",
    "command:npm",
    `agent:Coder: ${feedback}`,
    "command:make",
    `agent:The check rejected your previous attempt:\n\n${feedback}\n\nAddress this feedback, then complete the task.`,
    "command:npm",
  ]);
  const output = result.value(workflow.tasks[0]!);
  assert.ok(recipeObject(output));
  assert.equal(output.text, "Redocumented");
  assert.equal(output.rounds, 2);
  assert.ok(Array.isArray(output.conversations));
  const [coded, documented] = output.conversations;
  assert.equal(requests[0]?.continuation, undefined);
  assert.equal(requests[2]?.continuation?.id, coded);
  assert.equal(requests[3]?.continuation?.id, documented);
  assert.notEqual(coded, documented);
  assert.equal(output.conversation, documented);
  assert.ok(Array.isArray(output.commits));
  assert.deepEqual(
    output.commits.map((commit) => recipeObject(commit) && commit.subject),
    ["code", "docs", "recode"],
  );
});

test("a continued attempt agent without a previous conversation fails the task with its step", async (t) => {
  await using sandbox = await loopSandbox(t, [
    { ...npmTest, status: 1, stdout: "not ok" },
  ]);
  const documenter = createScriptedAgent({
    name: "documenter",
    turns: [{ text: "Documented" }],
  });
  const workflow = defineRecipe(
    JSON.stringify(
      stepsRecipe({
        maxRounds: 2,
        attempt: [
          { agent: "coder", brief: "Code." },
          { agent: "documenter", brief: "Document.", conversation: "continue" },
        ],
        check: [{ command: npmTest }],
      }),
    ),
    {
      sandbox: {
        ...sandbox,
        async dispatch<T>(options: DispatchOptions<T>) {
          const result = await sandbox.dispatch(options);
          if (options.agent !== documenter) return result;
          const { conversation: _conversation, ...rest } = result;
          return rest;
        },
      },
      agents: {
        coder: createScriptedAgent({ turns: [{ text: "A" }, { text: "B" }] }),
        documenter,
      },
    },
  );
  const result = await workflow.start();
  assert.equal(result.status, "failed");
  const [error] = result.errors;
  assert.ok(error instanceof OutpostError);
  assert.equal(error.code, "session");
  assert.match(
    error.message,
    /^Loop task implement, round 2, attempt step 2 \(agent documenter\): .*cannot continue round 2/,
  );
});

test("a failing attempt command fails the task without another round", async (t) => {
  await using sandbox = await loopSandbox(t, [
    { ...lint, status: 2, stderr: "lint failed" },
  ]);
  const requests: DispatchOptions<unknown>[] = [];
  const workflow = defineRecipe(
    JSON.stringify(
      stepsRecipe({
        maxRounds: 3,
        attempt: [{ agent: "coder", brief: "Code." }, { command: lint }],
        check: { command: npmTest },
      }),
    ),
    {
      sandbox: recorded(sandbox, requests),
      agents: { coder: createScriptedAgent({ turns: [{ text: "A" }] }) },
    },
  );
  const result = await workflow.start();
  assert.equal(result.status, "failed");
  const [error] = result.errors;
  assert.ok(error instanceof OutpostError);
  assert.equal(error.code, "process");
  assert.match(
    error.message,
    /^Loop task implement, round 1, attempt step 2 \(command make\): Workflow command failed/,
  );
  assert.equal(requests.length, 1);
});

test("checks run in order, stop at the first refusal and report the last refusal when exhausted", async (t) => {
  for (const maxRounds of [3, 2]) {
    await using sandbox = await loopSandbox(t, [
      { ...npmTest, status: 1, stdout: "tests fail" },
      npmTest,
      { ...lint, status: 1, stdout: "lint fails" },
      npmTest,
      lint,
    ]);
    const log: string[] = [];
    const workflow = defineRecipe(
      JSON.stringify(
        stepsRecipe({
          maxRounds,
          attempt: { agent: "coder", brief: "Fix. {{ loop.feedback }}" },
          check: [{ command: npmTest }, { command: lint }],
        }),
      ),
      {
        sandbox: logged(sandbox, [], log),
        agents: {
          coder: createScriptedAgent({
            turns: [{ text: "A" }, { text: "B" }, { text: "C" }],
          }),
        },
      },
    );
    const result = await workflow.start();
    if (maxRounds === 2) {
      const [error] = result.errors;
      assert.ok(error instanceof LoopTaskExhausted);
      assert.match(error.feedback, /^make exited with status 1/);
      continue;
    }
    result.unwrap();
    assert.deepEqual(log, [
      "agent:Fix. ",
      "command:npm",
      "agent:Fix. npm exited with status 1.\n\nstdout:\ntests fail",
      "command:npm",
      "command:make",
      "agent:Fix. make exited with status 1.\n\nstdout:\nlint fails",
      "command:npm",
      "command:make",
    ]);
  }
});

test("a check agent applies its dispatch options and decides with its own { done, feedback } response", async (t) => {
  await using sandbox = await loopSandbox(t, [npmTest, npmTest]);
  const requests: DispatchOptions<unknown>[] = [];
  const review = reviewResponse(1, {
    ...reviewSchema,
    required: ["done", "feedback"],
  });
  const workflow = boundLoop(
    stepsRecipe({
      maxRounds: 2,
      attempt: { agent: "coder", brief: "Fix. {{ loop.feedback }}" },
      check: [
        { command: npmTest },
        {
          agent: "reviewer",
          brief: "Review {{ loop.text }}.",
          dispatch: { response: { $ref: "responses.review" } },
        },
      ],
    }),
    {
      sandbox: recorded(sandbox, requests),
      agents: {
        coder: createScriptedAgent({ turns: [{ text: "A" }, { text: "B" }] }),
        reviewer: createScriptedAgent({
          name: "reviewer",
          turns: [
            { text: "Looks fine." },
            {
              text: '<review>{"done": false, "feedback": "Add tests", "score": 3}</review>',
            },
            { text: '<review>{"done": true, "feedback": ""}</review>' },
          ],
        }),
      },
    },
    {
      "tasks.implement.loop.check.1.dispatch": {
        deadlineMs: 600_000,
        response: review,
      },
    },
  );
  (await workflow.start()).unwrap();
  const reviews = requests.filter((request) => request.response === review);
  assert.equal(reviews.length, 2);
  assert.ok(reviews.every((request) => request.deadlineMs === 600_000));
  assert.equal(reviews[0]?.brief.text, "Review A.");
  assert.equal(requests.at(-2)?.brief.text, "Fix. Add tests");
});

test("a check agent response without done or feedback fails the task with its step", async (t) => {
  for (const answer of ['{"done": false, "score": 3}', '{"feedback": "x"}']) {
    await using sandbox = await loopSandbox(t, []);
    const workflow = boundLoop(
      stepsRecipe({
        maxRounds: 2,
        attempt: { agent: "coder", brief: "Fix." },
        check: [
          {
            agent: "reviewer",
            brief: "Review.",
            dispatch: { response: { $ref: "responses.review" } },
          },
        ],
      }),
      {
        sandbox,
        agents: {
          coder: createScriptedAgent({ turns: [{ text: "A" }] }),
          reviewer: createScriptedAgent({
            turns: [{ text: `<review>${answer}</review>` }],
          }),
        },
      },
      {
        "tasks.implement.loop.check.0.dispatch": {
          response: reviewResponse(0, { allOf: [reviewSchema] }),
        },
      },
    );
    const result = await workflow.start();
    assert.equal(result.status, "failed");
    assert.match(
      String(result.errors[0]),
      /round 1, check step 1 \(agent reviewer\): Loop check must return/,
    );
  }
});

test("a check agent dispatch deadline fails the task instead of refusing the round", async (t) => {
  await using sandbox = await loopSandbox(t, []);
  const workflow = boundLoop(
    stepsRecipe({
      maxRounds: 2,
      attempt: { agent: "coder", brief: "Fix." },
      check: {
        agent: "reviewer",
        brief: "Review.",
        dispatch: { deadlineMs: 5 },
      },
    }),
    {
      sandbox: {
        ...sandbox,
        async dispatch<T>(options: DispatchOptions<T>) {
          if (options.deadlineMs === 5)
            throw new OutpostError("timeout", "Dispatch exceeded 5 ms");
          return sandbox.dispatch(options);
        },
      },
      agents: {
        coder: createScriptedAgent({ turns: [{ text: "A" }] }),
        reviewer: createScriptedAgent({ turns: [{ text: "unused" }] }),
      },
    },
    { "tasks.implement.loop.check.dispatch": { deadlineMs: 5 } },
  );
  const result = await workflow.start();
  assert.equal(result.status, "failed");
  const [error] = result.errors;
  assert.ok(error instanceof OutpostError);
  assert.equal(error.code, "timeout");
  assert.match(error.message, /check step 1 \(agent reviewer\): Dispatch/);
});

test("a done condition decides from the typed response and sends its feedback back", async (t) => {
  await using sandbox = await loopSandbox(t, []);
  const requests: DispatchOptions<unknown>[] = [];
  const workflow = boundLoop(
    stepsRecipe({
      maxRounds: 2,
      attempt: { agent: "coder", brief: "Fix. {{ loop.feedback }}" },
      check: [
        {
          agent: "reviewer",
          brief: "Score {{ loop.text }}.",
          dispatch: { response: { $ref: "responses.review" } },
          done: {
            all: [
              { gte: [{ $response: ["score"] }, { $input: "threshold" }] },
              { eq: [{ $response: ["issues"] }, []] },
            ],
          },
        },
      ],
    }),
    {
      sandbox: recorded(sandbox, requests),
      agents: {
        coder: createScriptedAgent({ turns: [{ text: "A" }, { text: "B" }] }),
        reviewer: createScriptedAgent({
          turns: [
            {
              text: '<review>{"score": 6, "issues": ["parser"], "done": true, "feedback": "Cover the parser"}</review>',
            },
            {
              text: '<review>{"score": 9, "issues": [], "feedback": ""}</review>',
            },
          ],
        }),
      },
    },
    { "tasks.implement.loop.check.0.dispatch": { response: reviewResponse() } },
  );
  const result = await workflow.start();
  result.unwrap();
  assert.deepEqual(
    requests.map((request) => request.brief.text),
    ["Fix. ", "Score A.", "Fix. Cover the parser", "Score B."],
  );
  const output = result.value(workflow.tasks[0]!);
  assert.ok(recipeObject(output));
  assert.equal(output.rounds, 2);
});

test("a done condition fails the task on a missing field or a refusal without feedback", async (t) => {
  for (const [answer, pattern] of [
    ['{"feedback": "x"}', /Missing recipe field: score/],
    ['{"score": 1}', /requires a feedback string when done is false/],
  ] as const) {
    await using sandbox = await loopSandbox(t, []);
    const workflow = boundLoop(
      stepsRecipe({
        maxRounds: 2,
        attempt: { agent: "coder", brief: "Fix." },
        check: [
          {
            agent: "reviewer",
            brief: "Score.",
            dispatch: { response: { $ref: "responses.review" } },
            done: { gte: [{ $response: ["score"] }, 8] },
          },
        ],
      }),
      {
        sandbox,
        agents: {
          coder: createScriptedAgent({ turns: [{ text: "A" }] }),
          reviewer: createScriptedAgent({
            turns: [{ text: `<review>${answer}</review>` }],
          }),
        },
      },
      {
        "tasks.implement.loop.check.0.dispatch": { response: reviewResponse() },
      },
    );
    const result = await workflow.start();
    assert.equal(result.status, "failed");
    const message = String(result.errors[0]);
    assert.match(message, /round 1, check step 1 \(agent reviewer\)/);
    assert.match(message, pattern);
  }
});

test("loop agents that cannot resume a conversation are refused before the first round", async (t) => {
  await using sandbox = await loopSandbox(t, []);
  const fallback = createFallbackAgent(
    [
      createScriptedAgent({ turns: [{ text: "A" }] }),
      createScriptedAgent({ name: "spare", turns: [{ text: "B" }] }),
    ],
    { on: ["quota"] },
  );
  const coder = createScriptedAgent({ turns: [{ text: "A" }] });
  const refused = (path: string, code = "unsupported-capability") =>
    refusal(code, path);
  assert.throws(
    () =>
      boundLoop(
        stepsRecipe({
          maxRounds: 2,
          attempt: [
            { agent: "coder", brief: "Code." },
            {
              agent: "documenter",
              brief: "Document.",
              conversation: "continue",
            },
          ],
          check: { command: npmTest },
        }),
        { sandbox, agents: { coder, documenter: fallback } },
      ),
    refused("tasks.implement.loop.attempt.1.conversation"),
  );
  const repaired = (reviewer: DispatchAgent) =>
    boundLoop(
      stepsRecipe({
        maxRounds: 2,
        attempt: { agent: "coder", brief: "Code." },
        check: [
          {
            agent: "reviewer",
            brief: "Review.",
            dispatch: { response: { $ref: "responses.review" } },
          },
        ],
      }),
      { sandbox, agents: { coder, reviewer } },
      {
        "tasks.implement.loop.check.0.dispatch": {
          response: reviewResponse(1, {
            ...reviewSchema,
            required: ["done", "feedback"],
          }),
        },
      },
    );
  repaired(fallback);
  const { resumable: _resumable, ...unknown } = createScriptedAgent({
    turns: [{ text: "R" }],
  });
  for (const reviewer of [
    createFallbackAgent(
      [
        coder,
        {
          ...createScriptedAgent({ turns: [{ text: "R" }] }),
          resumable: false,
        },
      ],
      { on: ["quota"] },
    ),
    unknown,
  ])
    assert.throws(
      () => repaired(reviewer),
      refused("tasks.implement.loop.check.0.dispatch.response.repairs"),
    );
  assert.throws(
    () =>
      defineRecipe(
        JSON.stringify(
          stepsRecipe({
            maxRounds: 2,
            attempt: { agent: "coder", brief: "Code." },
            check: [{ agent: "reviewer", brief: "Review.", done: true }],
          }),
        ),
        { sandbox, agents: { coder, reviewer: coder } },
      ),
    refused("tasks.implement.loop.check.0.done", "invalid-configuration"),
  );
  assert.throws(
    () =>
      boundLoop(
        stepsRecipe({
          maxRounds: 2,
          attempt: { agent: "coder", brief: "Code." },
          check: [
            {
              agent: "reviewer",
              brief: "Review.",
              dispatch: { response: { $ref: "responses.review" } },
            },
          ],
        }),
        { sandbox, agents: { coder, reviewer: coder } },
        {
          "tasks.implement.loop.check.0.dispatch": {
            response: defineTextResponse({ tag: "review" }),
          },
        },
      ),
    refused(
      "tasks.implement.loop.check.0.dispatch.response",
      "invalid-configuration",
    ),
  );
});

test("a quota pause in a two-agent phase restarts the phase without sharing a conversation", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-loop-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const checkpoint = {
    store: createWorkflowCheckpointStore({
      transporter: createLocalTransport({ directory }),
    }),
    runId: "quota",
    version: "1",
  };
  await using sandbox = await loopSandbox(t, [npmTest]);
  const coder = createScriptedAgent({ turns: [{ text: "A" }, { text: "B" }] });
  const documenter = createScriptedAgent({
    name: "documenter",
    turns: [{ text: "D" }, { text: "E" }],
  });
  const requests: DispatchOptions<unknown>[] = [];
  let limited = false;
  const source = JSON.stringify(
    stepsRecipe(
      {
        maxRounds: 2,
        attempt: [
          { agent: "coder", brief: "Code.", conversation: "continue" },
          { agent: "documenter", brief: "Document." },
        ],
        check: { command: npmTest },
      },
      { quotaResume: "continue" },
    ),
  );
  const workflow = defineRecipe(source, {
    sandbox: {
      ...recorded(sandbox, requests),
      async dispatch<T>(options: DispatchOptions<T>) {
        requests.push(options);
        const result = await sandbox.dispatch(options);
        if (options.agent !== documenter || limited) return result;
        limited = true;
        const error = new OutpostError("quota", "usage limit reached", {
          conversation: result.conversation,
        });
        recordRecovery(error, { conversation: result.conversation });
        throw error;
      },
    },
    agents: { coder, documenter },
  });
  const paused = await workflow.start({
    checkpoint,
    onQuota: { action: "pause" },
  });
  assert.equal(paused.status, "paused");
  (await workflow.start({ checkpoint })).unwrap();
  assert.deepEqual(
    requests.map((request) => request.brief.text),
    ["Code.", "Document.", "Code.", "Document."],
  );
  assert.ok(requests.every((request) => request.continuation === undefined));
});

test("an interrupted two-agent attempt replays both agents under retry-incomplete", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-loop-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const checkpoint = {
    store: createWorkflowCheckpointStore({
      transporter: createLocalTransport({ directory }),
    }),
    runId: "replay",
    version: "1",
  };
  await using sandbox = await loopSandbox(t, [npmTest]);
  const agents = {
    coder: createScriptedAgent({ turns: [{ text: "A" }, { text: "B" }] }),
    documenter: createScriptedAgent({
      name: "documenter",
      turns: [{ text: "D" }],
    }),
  };
  const source = JSON.stringify(
    stepsRecipe({
      maxRounds: 2,
      attempt: [
        { agent: "coder", brief: "Code." },
        { agent: "documenter", brief: "Document." },
      ],
      check: { command: npmTest },
    }),
  );
  const run = async (resume?: "retry-incomplete") => {
    const requests: DispatchOptions<unknown>[] = [];
    const stop = new AbortController();
    const workflow = defineRecipe(source, {
      sandbox: {
        ...recorded(sandbox, requests),
        async dispatch<T>(options: DispatchOptions<T>) {
          requests.push(options);
          const result = await sandbox.dispatch(options);
          if (!resume) stop.abort();
          return result;
        },
      },
      agents,
    });
    const result = await workflow.start({
      signal: stop.signal,
      checkpoint: { ...checkpoint, ...(resume ? { resume } : {}) },
    });
    return { result, requests };
  };
  const interrupted = await run();
  assert.equal(interrupted.result.status, "cancelled");
  assert.equal(interrupted.requests.length, 1);
  await assert.rejects(run(), /retry/i);
  const replayed = await run("retry-incomplete");
  replayed.result.unwrap();
  assert.deepEqual(
    replayed.requests.map((request) => request.brief.text),
    ["Code.", "Document."],
  );
});

test("cancellation and the round deadline stop a phase between its steps", async (t) => {
  for (const stopBy of ["signal", "timeout"] as const) {
    await using sandbox = await loopSandbox(t, []);
    const requests: DispatchOptions<unknown>[] = [];
    const stop = new AbortController();
    const workflow = defineRecipe(
      JSON.stringify(
        stepsRecipe(
          {
            maxRounds: 2,
            attempt: [
              { agent: "coder", brief: "Code." },
              { agent: "documenter", brief: "Document." },
            ],
            check: { command: npmTest },
          },
          stopBy === "timeout" ? { timeoutMs: 20 } : {},
        ),
      ),
      {
        sandbox: {
          ...recorded(sandbox, requests),
          async dispatch<T>(options: DispatchOptions<T>) {
            requests.push(options);
            const result = await sandbox.dispatch(options);
            if (stopBy === "signal") stop.abort();
            else await new Promise((settle) => setTimeout(settle, 60));
            return result;
          },
        },
        agents: {
          coder: createScriptedAgent({ turns: [{ text: "A" }] }),
          documenter: createScriptedAgent({ turns: [{ text: "D" }] }),
        },
      },
    );
    const result = await workflow.start({ signal: stop.signal });
    assert.equal(requests.length, 1, stopBy);
    if (stopBy === "signal") {
      assert.equal(result.status, "cancelled");
      continue;
    }
    assert.equal(result.status, "failed");
    const [error] = result.errors;
    assert.ok(error instanceof OutpostError);
    assert.equal(error.code, "timeout");
  }
});

test("agent text reinjected through loop values stays literal", async (t) => {
  await using sandbox = await loopSandbox(t, [
    { ...npmTest, status: 1, stdout: "{{ inputs.secret }} $(rm -rf /)" },
    npmTest,
  ]);
  const requests: DispatchOptions<unknown>[] = [];
  const workflow = defineRecipe(
    JSON.stringify({
      ...stepsRecipe({
        maxRounds: 2,
        attempt: { agent: "coder", brief: "Fix. {{ loop.feedback }}" },
        check: [
          { command: npmTest },
          { agent: "reviewer", brief: "Review {{ loop.text }}" },
        ],
      }),
      inputs: { secret: { type: "string", description: "Secret" } },
    }),
    {
      sandbox: recorded(sandbox, requests),
      inputs: { secret: "hidden" },
      agents: {
        coder: createScriptedAgent({
          turns: [{ text: "A" }, { text: "{{ inputs.secret }} `id`" }],
        }),
        reviewer: createScriptedAgent({
          turns: [
            { text: '<loop-check>{"done": true, "feedback": ""}</loop-check>' },
          ],
        }),
      },
    },
  );
  (await workflow.start()).unwrap();
  assert.deepEqual(
    requests.map((request) => request.brief.text),
    [
      "Fix. ",
      "Fix. npm exited with status 1.\n\nstdout:\n{{ inputs.secret }} $(rm -rf /)",
      "Review {{ inputs.secret }} `id`",
    ],
  );
});

test("two attempt agents in one round each count their usage once", async (t) => {
  await using sandbox = await loopSandbox(t, [npmTest]);
  const usage = { input: 3, cached: 1, output: 2 };
  const workflow = defineRecipe(
    JSON.stringify(
      stepsRecipe({
        maxRounds: 2,
        attempt: [
          { agent: "coder", brief: "Code." },
          { agent: "documenter", brief: "Document." },
        ],
        check: { command: npmTest },
      }),
    ),
    {
      sandbox,
      agents: {
        coder: createScriptedAgent({ turns: [{ text: "A", usage }] }),
        documenter: createScriptedAgent({ turns: [{ text: "D", usage }] }),
      },
    },
  );
  const result = await workflow.start();
  result.unwrap();
  assert.equal(result.usage.attempts, 1);
  assert.equal(result.usage.tokens.input, 6);
  assert.equal(result.usage.tokens.output, 4);
});

test("validateRecipeProject locates every loop step refusal with its code, path and line", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-loop-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml");
  const config = join(directory, "outpost.yaml");
  await writeFile(
    config,
    [
      "version: 3",
      "workspace: { kind: ephemeral }",
      "sandbox: { provider: local }",
      "agents:",
      "  coder: { harness: codex, authentication: account }",
      "  reviewer: { harness: codex, authentication: account }",
      "responses:",
      "  verdict:",
      "    type: json",
      "    tag: verdict",
      "    jsonSchema:",
      "      type: object",
      "      properties: { done: { type: boolean }, feedback: { type: string } }",
      "      required: [done, feedback]",
      "  scored:",
      "    type: json",
      "    tag: scored",
      "    jsonSchema:",
      "      type: object",
      "      properties: { score: { type: number } }",
      "      required: [score]",
      "  prose: { type: text, tag: prose }",
      "",
    ].join("\n"),
  );
  const recipe = (
    attempt: string[],
    check: string[],
    extra: string[] = [],
    trailing: string[] = [],
  ) =>
    [
      "version: 3",
      "name: steps",
      "tasks:",
      "  - key: implement",
      ...extra,
      "    loop:",
      "      maxRounds: 2",
      "      attempt:",
      ...attempt,
      "      check:",
      ...check,
      ...trailing,
      "",
    ].join("\n");
  const shared = (dispatch: string) => [
    "  - key: shared",
    "    after: [implement]",
    "    agent: coder",
    "    brief: Share.",
    `    dispatch: ${dispatch}`,
  ];
  const coder = ["        - agent: coder", "          brief: Code."];
  const reviewer = ["        - agent: reviewer", "          brief: Review."];
  const command = ["        - command: { executable: npm }"];
  const cases: readonly (readonly [string, string, string, string, number])[] =
    [
      [
        recipe(["        []"], command),
        "invalid-configuration",
        "tasks.0.loop.attempt",
        "empty",
        8,
      ],
      [
        recipe(command, command),
        "missing-loop-agent",
        "tasks.0.loop.attempt",
        "no agent",
        8,
      ],
      [
        recipe(coder, [...reviewer, "          conversation: continue"]),
        "unknown-field",
        "tasks.0.loop.check.0.conversation",
        "phase field",
        13,
      ],
      [
        recipe([...coder, "          done: true"], command),
        "unknown-field",
        "tasks.0.loop.attempt.0.done",
        "done on attempt",
        10,
      ],
      [
        recipe(coder, [
          "        - command: { executable: npm }",
          "          done: true",
        ]),
        "unknown-field",
        "tasks.0.loop.check.0.done",
        "done on command",
        12,
      ],
      [
        recipe(coder, [...reviewer, "          done: true"]),
        "invalid-configuration",
        "tasks.0.loop.check.0.done",
        "done without response",
        13,
      ],
      [
        recipe(
          [...coder, "          dispatch: { continuation: { id: x } }"],
          command,
        ),
        "invalid-configuration",
        "tasks.0.loop.attempt.0.dispatch.continuation",
        "continuation",
        10,
      ],
      [
        recipe(coder, [...reviewer, "          dispatch: { passes: 2 }"]),
        "invalid-configuration",
        "tasks.0.loop.check.0.dispatch.passes",
        "passes",
        13,
      ],
      [
        recipe(
          coder,
          [...reviewer, "          dispatch: { $ref: tasks.shared.dispatch }"],
          [],
          shared("{ passes: 2 }"),
        ),
        "invalid-configuration",
        "tasks.0.loop.check.0.dispatch.passes",
        "referenced passes",
        13,
      ],
      [
        recipe(
          [...coder, "          dispatch: { $ref: tasks.shared.dispatch }"],
          command,
          [],
          shared("{ continuation: { id: previous } }"),
        ),
        "invalid-configuration",
        "tasks.0.loop.attempt.0.dispatch.continuation",
        "referenced continuation",
        10,
      ],
      [
        recipe(coder, [
          ...reviewer,
          "          dispatch: { response: { $ref: responses.prose } }",
        ]),
        "invalid-configuration",
        "tasks.0.loop.check.0.dispatch.response",
        "text response",
        13,
      ],
      [
        recipe(coder, [
          ...reviewer,
          "          dispatch: { response: { $ref: responses.scored } }",
          "          done: { gte: [{ $response: [score] }, 8] }",
        ]),
        "invalid-configuration",
        "tasks.0.loop.check.0.dispatch.response",
        "done without feedback",
        13,
      ],
      [
        recipe(coder, [
          ...reviewer,
          "          dispatch: { response: { $ref: responses.scored } }",
        ]),
        "invalid-configuration",
        "tasks.0.loop.check.0.dispatch.response",
        "verdict without done",
        13,
      ],
      [
        recipe(coder, command, [
          "    when: { eq: [{ $response: [score] }, 1] }",
        ]),
        "invalid-configuration",
        "tasks.0.when.eq.0",
        "$response outside done",
        5,
      ],
    ];
  for (const [source, code, path, label, line] of cases) {
    await writeFile(file, source);
    await assert.rejects(validateRecipeProject({ file, config }), (error) => {
      assert.ok(error instanceof ConfigurationError, label);
      assert.equal(error.diagnostic.code, code, label);
      assert.equal(error.diagnostic.path.join("."), path, label);
      assert.equal(error.diagnostic.line, line, label);
      return true;
    });
  }
  await writeFile(
    file,
    recipe(coder, [
      ...command,
      ...reviewer,
      "          dispatch: { response: { $ref: responses.verdict }, deadlineMs: 600000 }",
    ]),
  );
  assert.deepEqual((await validateRecipeProject({ file, config })).agents, [
    "coder",
    "reviewer",
  ]);
});

test("a file workspace requires conversation capture for each continued attempt agent", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-loop-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml");
  const config = join(directory, "outpost.yaml");
  await writeFile(
    file,
    [
      "version: 3",
      "name: steps",
      "tasks:",
      "  - key: implement",
      "    loop:",
      "      maxRounds: 2",
      "      attempt:",
      "        - { agent: coder, brief: Code., conversation: continue }",
      "        - { agent: documenter, brief: Document., conversation: continue }",
      "      check: { command: { executable: npm } }",
      "",
    ].join("\n"),
  );
  const configuration = (documenter: string) =>
    [
      "version: 3",
      "workspace: { kind: ephemeral }",
      "sandbox: { provider: local }",
      "agents:",
      "  coder: { harness: codex, authentication: account }",
      `  documenter: { harness: ${documenter}, authentication: account }`,
      "",
    ].join("\n");
  await writeFile(config, configuration("codex"));
  await validateRecipeProject({ file, config });
  await writeFile(config, configuration("agy"));
  await assert.rejects(
    validateRecipeProject({ file, config }),
    (error) =>
      error instanceof ConfigurationError &&
      error.diagnostic.code === "unsupported-capability" &&
      error.diagnostic.path.join(".") === "agents.documenter.harness" &&
      /implement/.test(error.diagnostic.hint ?? ""),
  );
});

test("createRecipeRuntime decides a done condition with a referenced response", async (t) => {
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
        coder: scripted([{ text: "First" }, { text: "Second" }]),
        reviewer: scripted([
          {
            text: '<review>{"score": 5, "feedback": "Cover the parser"}</review>',
          },
          { text: '<review>{"score": 9, "feedback": ""}</review>' },
        ]),
      },
      agents: {
        coder: { $ref: "extensions.coder" },
        reviewer: { $ref: "extensions.reviewer" },
      },
      responses: {
        review: {
          type: "json",
          tag: "review",
          jsonSchema: {
            type: "object",
            properties: {
              score: { type: "number" },
              feedback: { type: "string" },
            },
            required: ["score", "feedback"],
            additionalProperties: false,
          },
        },
      },
    }),
  );
  await writeFile(
    file,
    JSON.stringify(
      stepsRecipe({
        maxRounds: 2,
        attempt: [{ agent: "coder", brief: "Code. {{ loop.feedback }}" }],
        check: [
          {
            agent: "reviewer",
            brief: "Score {{ loop.text }}.",
            dispatch: {
              deadlineMs: 600_000,
              response: { $ref: "responses.review" },
            },
            done: { gte: [{ $response: ["score"] }, { $input: "threshold" }] },
          },
        ],
      }),
    ),
  );
  await using runtime = await createRecipeRuntime({ file, config });
  const report = await runtime.run();
  assert.equal(report.status, "done", JSON.stringify(report.errors));
  assert.equal(report.outputs.implement?.text, "Second");
  const rounds = report.tasks.find((task) => task.key === "implement")?.rounds;
  assert.deepEqual(
    rounds?.map((round) => round.check),
    [{ done: false, feedback: "Cover the parser" }, { done: true }],
  );
});

test("a checkpoint saved by 14.1.0 during a check resumes unchanged", async (t) => {
  const fixture = resolve("test/fixtures/recipe-loop-14.1.0");
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-loop-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await cp(join(fixture, "objects"), join(directory, "objects"), {
    recursive: true,
  });
  await using sandbox = await loopSandbox(t, [
    { ...npmTest, status: 1, stdout: "not ok" },
    npmTest,
  ]);
  const requests: DispatchOptions<unknown>[] = [];
  const workflow = defineRecipe(
    await readFile(join(fixture, "recipe.json"), "utf8"),
    {
      sandbox: {
        ...sandbox,
        // The saved conversation belongs to the 14.1.0 process; the scripted agent starts a new one.
        dispatch<T>(options: DispatchOptions<T>) {
          requests.push(options);
          const { continuation: _saved, ...request } = options;
          return sandbox.dispatch(request);
        },
      },
      agents: {
        coder: createScriptedAgent({
          turns: [
            {
              text: "Second",
              commit: { message: "second", files: { "a.txt": "2" } },
            },
          ],
        }),
      },
    },
  );
  const result = await workflow.start({
    checkpoint: {
      store: createWorkflowCheckpointStore({
        transporter: createLocalTransport({ directory }),
      }),
      runId: "loop-14.1.0",
      version: "1",
      resume: "retry-incomplete",
    },
  });
  result.unwrap();
  assert.equal(requests.length, 1, "round 1 is not attempted again");
  assert.equal(
    requests[0]?.continuation?.id,
    "fdc80274-1a50-4c34-a9dd-ba35ae6146ba",
  );
  assert.match(
    requests[0]?.brief.text ?? "",
    /^The check rejected[\s\S]*not ok/,
  );
  const output = result.value(workflow.tasks[0]!);
  assert.ok(recipeObject(output));
  assert.equal(output.text, "Second");
  assert.equal(output.rounds, 2);
  assert.ok(Array.isArray(output.commits));
  assert.deepEqual(
    output.commits.map((commit) => recipeObject(commit) && commit.subject),
    ["first", "second"],
  );
});

test("a failing step keeps its error, recovery details and class while naming the step", async (t) => {
  class StepFailure extends Error {
    readonly marker = "kept";
  }
  await using sandbox = await loopSandbox(t, []);
  const failure = new StepFailure("worktree preserved");
  recordRecovery(failure, { branch: "outpost/preserved" });
  const workflow = defineRecipe(
    JSON.stringify(
      stepsRecipe({
        maxRounds: 2,
        attempt: [
          { agent: "coder", brief: "Code." },
          { agent: "documenter", brief: "Document." },
        ],
        check: { command: npmTest },
      }),
    ),
    {
      sandbox: {
        ...sandbox,
        async dispatch<T>(options: DispatchOptions<T>) {
          if (options.brief.text === "Document.") throw failure;
          return sandbox.dispatch(options);
        },
      },
      agents: {
        coder: createScriptedAgent({ turns: [{ text: "A" }] }),
        documenter: createScriptedAgent({ turns: [{ text: "D" }] }),
      },
    },
  );
  const result = await workflow.start();
  assert.equal(result.status, "failed");
  const [error] = result.errors;
  assert.equal(error, failure);
  assert.equal(failure.marker, "kept");
  assert.equal(
    failure.message,
    "Loop task implement, round 1, attempt step 2 (agent documenter): worktree preserved",
  );
  assert.deepEqual(recoveryDetails(failure), { branch: "outpost/preserved" });
});

test("unknown loop fields get a placement hint only for known step fields", () => {
  const hint = (loop: Record<string, unknown>) => {
    try {
      validateRecipe(loopRecipe(loop));
    } catch (error) {
      assert.ok(error instanceof ConfigurationError);
      assert.equal(error.diagnostic.code, "unknown-field");
      return error.diagnostic.hint;
    }
    assert.fail("the field is refused");
  };
  const check = { command: npmTest };
  assert.equal(
    hint({
      maxRounds: 2,
      attempt: { agent: "coder", brief: "Code.", constructor: 1 },
      check,
    }),
    undefined,
  );
  assert.equal(
    hint({
      maxRounds: 2,
      attempt: { agent: "coder", brief: "Code." },
      check,
      dispatch: { deadlineMs: 5 },
    }),
    undefined,
  );
  assert.match(
    hint({
      maxRounds: 2,
      attempt: { agent: "coder", brief: "Code." },
      check: [{ command: npmTest, done: true }],
    }) ?? "",
    /done applies to check agents/,
  );
});
