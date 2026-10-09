import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { spawn } from "node:child_process";
import type {
  ChildProcessWithoutNullStreams,
  SpawnSyncReturns,
} from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { repository } from "../helpers.ts";
import { createRecipeRuntime } from "../../src/recipes.ts";
import type { RecipeReport } from "../../src/application/recipe-report.types.ts";

async function project(t: TestContext, choices = false, actors = ["owner"]) {
  const checkout = await repository(t);
  const directory = await mkdtemp(join(tmpdir(), "outpost-cli-dialogue-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  await writeFile(
    config,
    JSON.stringify({
      version: 2,
      repository: checkout,
      sandbox: { provider: "local" },
      transports: { state: { type: "local", directory: "./state" } },
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
      reports: [{ type: "json" }],
    }),
  );
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "dialogue",
      workflow: {
        checkpoint: {
          store: { $ref: "stores.state" },
          runId: "dialogue",
          version: "1",
        },
      },
      tasks: [
        { key: "before", value: "finished before the question" },
        {
          key: "interview",
          after: ["before"],
          interactive: {
            repository: checkout,
            sandboxProvider: { type: "local" },
            agent: { $ref: "agents.interviewer" },
            actors,
            brief: choices ? "Offer choices" : "Choose a size",
            bootstrap: false,
          },
        },
        {
          key: "after",
          after: ["interview"],
          value: { $step: "interview", path: ["value", "output", "size"] },
        },
      ],
    }),
  );
  return { file, config, args: ["--file", file, "--config", config] };
}

async function execute(
  args: readonly string[],
  terminal: boolean,
  input?: (stderr: string, child: ChildProcessWithoutNullStreams) => void,
) {
  const child = spawn(
    process.execPath,
    [
      resolve(
        terminal ? "test/fixtures/recipe-cli-terminal.ts" : "src/cli/main.ts",
      ),
      ...args,
    ],
    {
      env: { ...process.env, FORCE_COLOR: "0", CI: "" },
    },
  );
  let stdout = "",
    stderr = "";
  const timer = setTimeout(() => child.kill("SIGKILL"), 60_000);
  try {
    return await new Promise<
      Pick<SpawnSyncReturns<string>, "status" | "stdout" | "stderr">
    >((resolve, reject) => {
      child.stdout.on("data", (chunk) => {
        stdout += chunk;
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
        input?.(stderr, child);
      });
      child.on("error", reject);
      child.on("close", (status) => resolve({ status, stdout, stderr }));
    });
  } finally {
    clearTimeout(timer);
  }
}

function answerOnce(value: string | null) {
  let answered = false;
  return (stderr: string, child: ChildProcessWithoutNullStreams) => {
    if (answered || !stderr.includes("Which size?")) return;
    answered = true;
    if (value === null) child.stdin.end();
    else child.stdin.write(value);
  };
}

test("recipe run automatically completes a terminal dialogue and prints only one final report", async (t) => {
  const fixture = await project(t);
  const result = await execute(
    ["recipe", "run", ...fixture.args],
    true,
    answerOnce("medium\r"),
  );
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "done");
  assert.equal(report.outputs.after.value, "medium");
  assert.equal(report.usage.tokens.input, 8);
  assert.ok(
    report.tasks.every(
      (task: RecipeReport["tasks"][number]) => task.status === "done",
    ),
  );
  assert.match(result.stderr, /Which size/);
});

test("JSON and explicit opt-out leave questions pending; resume can explicitly combine terminal input with JSON", async (t) => {
  for (const flags of [["--json"], ["--no-interactive"]]) {
    const fixture = await project(t);
    const paused = await execute(
      ["recipe", "run", ...fixture.args, ...flags],
      true,
    );
    assert.equal(paused.status, 1, paused.stderr);
    const pending = JSON.parse(paused.stdout);
    assert.equal(pending.status, "waiting-input");
    assert.doesNotMatch(paused.stderr, /Which size/);
    const resumed = await execute(
      [
        "recipe",
        "resume",
        ...fixture.args,
        "--run-id",
        "dialogue",
        "--interactive",
        "--actor",
        "owner",
        "--json",
      ],
      true,
      answerOnce("medium\r"),
    );
    assert.equal(resumed.status, 0, resumed.stderr);
    const done = JSON.parse(resumed.stdout);
    assert.equal(done.status, "done");
    assert.equal(done.usage.tokens.input, 8);
    assert.equal(done.tasks[0].startedAt, pending.tasks[0].startedAt);
  }
});

test("terminal choices submit the selected value", async (t) => {
  const fixture = await project(t, true);
  const result = await execute(
    ["recipe", "run", ...fixture.args],
    true,
    answerOnce("\x1b[B\r"),
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).outputs.after.value, "medium");
});

test("nonterminal runs remain headless and explicit interactive mode fails before allocation", async (t) => {
  const fixture = await project(t);
  const invalid = await execute(
    ["recipe", "run", ...fixture.args, "--interactive"],
    false,
  );
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /requires a terminal/);
  const paused = await execute(["recipe", "run", ...fixture.args], false);
  assert.equal(paused.status, 1, paused.stderr);
  assert.equal(JSON.parse(paused.stdout).status, "waiting-input");
  assert.match(paused.stderr, /outpost recipe resume/);
});

test("actor selection releases terminal input for the following question", async (t) => {
  const fixture = await project(t, false, ["owner", "reviewer"]);
  let selected = false;
  const answer = answerOnce("medium\r");
  const result = await execute(
    ["recipe", "run", ...fixture.args],
    true,
    (stderr, child) => {
      if (!selected && stderr.includes("Answer interview as")) {
        selected = true;
        child.stdin.write("\x1b[B\r");
        return;
      }
      answer(stderr, child);
    },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    JSON.parse(result.stdout).tasks[1].interaction.answer.actor,
    "reviewer",
  );
});

test("Ctrl+C and input closure preserve the question and release checkpoint ownership", async (t) => {
  for (const input of ["\x03", null]) {
    const fixture = await project(t);
    const cancelled = await execute(
      ["recipe", "run", ...fixture.args, "--interactive", "--json"],
      true,
      answerOnce(input),
    );
    assert.equal(cancelled.status, 130, cancelled.stderr);
    assert.equal(JSON.parse(cancelled.stdout).status, "waiting-input");
    await using runtime = await createRecipeRuntime(fixture);
    const state = await runtime.status("dialogue");
    assert.equal(state?.owned, false);
    assert.equal(state?.report?.inputRequests?.[0]?.question, "Which size?");
    const resumed = await execute(
      [
        "recipe",
        "resume",
        ...fixture.args,
        "--run-id",
        "dialogue",
        "--json",
        "--interactive",
      ],
      true,
      answerOnce("medium\r"),
    );
    assert.equal(resumed.status, 0, resumed.stderr);
    assert.equal(JSON.parse(resumed.stdout).usage.tokens.input, 8);
  }
});
