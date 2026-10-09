import assert from "node:assert/strict";
import test from "node:test";
import type { TestContext } from "node:test";
import { spawn } from "node:child_process";
import type {
  ChildProcessWithoutNullStreams,
  SpawnSyncReturns,
} from "node:child_process";
import {
  mkdtemp,
  cp,
  readFile,
  writeFile,
  rm,
  readdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parse, stringify } from "yaml";
import { validateRecipeProject } from "../../src/recipes.ts";
import type { TaskRecord } from "../../src/index.ts";

async function project(t: TestContext, prompt = false) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-linear-workflow-"));
  t.after(() => rm(directory, { recursive: true, force: true, maxRetries: 5 }));
  await cp(
    resolve("test-recipe-linear-development/repo"),
    join(directory, "repo"),
    { recursive: true },
  );
  const file = resolve("test-recipe-linear-development/recipe.yaml");
  const config = join(directory, "outpost.yaml");
  const source = parse(
    await readFile(
      resolve("test-recipe-linear-development/outpost.yaml"),
      "utf8",
    ),
  );
  source.sandbox = { provider: "local" };
  source.extensions.linear.module = resolve(
    "test/fixtures/linear-development.ts",
  );
  source.extensions.linear.export = prompt
    ? "createPromptedFixtureIssue"
    : "createFixtureIssue";
  source.extensions.progress.module = resolve(
    "test-recipe-linear-development/observer.ts",
  );
  source.extensions.model = {
    module: resolve("test/fixtures/linear-development.ts"),
    export: "createFixtureModel",
    kind: "modelProvider",
    factory: true,
    version: "1",
    schema: { type: "object", properties: {}, additionalProperties: false },
  };
  for (const name of Object.keys(source.agents))
    source.agents[name] = {
      type: "composed",
      model: "fixture",
      harness: {
        type: "outpost",
        modelProvider: { $ref: "extensions.model" },
      },
    };
  await writeFile(config, stringify(source));
  return {
    directory,
    file,
    config,
    args: ["--file", file, "--config", config],
  };
}

async function cli(
  args: string[],
  input?: (stderr: string, child: ChildProcessWithoutNullStreams) => void,
) {
  const child = spawn(
    process.execPath,
    [resolve("test/fixtures/recipe-cli-terminal.ts"), "recipe", ...args],
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
      child.once("error", reject);
      child.once("close", (status) => resolve({ status, stdout, stderr }));
    });
  } finally {
    clearTimeout(timer);
  }
}

function dialogue(approval: "approve" | "reject" | "pending") {
  const selections = {
    pending: "\r",
    approve: "\x1b[B\r",
    reject: "\x1b[B\x1b[B\r",
  };
  const turns: [string, string][] = [
    ["Linear issue identifier, UUID, URL or number?", "123\r"],
    ["Team key for issue 123", "ENG\r"],
    ["Approve this plan before implementation?", selections[approval]],
    ["Reason for this decision", "Reviewed offline\r"],
  ];
  return (stderr: string, child: ChildProcessWithoutNullStreams) => {
    const turn = turns[0];
    if (!turn || !stderr.includes(turn[0])) return;
    turns.shift();
    child.stdin.write(turn[1]);
  };
}

test("the shipped Linear recipe validates without credentials, imports, a Git repository or allocation", async () => {
  await validateRecipeProject({
    file: resolve("test-recipe-linear-development/recipe.yaml"),
    config: resolve("test-recipe-linear-development/outpost.yaml"),
  });
});

test("secret entry stays masked, retries rejected keys and never persists them as workflow answers", async (t) => {
  const fixture = await project(t, true);
  const answer = dialogue("pending");
  let first = false,
    replacement = false;
  const result = await cli(
    ["run", ...fixture.args, "--interactive", "--json"],
    (stderr, child) => {
      const prompt = "Linear personal API key (saved only after validation)";
      if (!first && stderr.includes(prompt)) {
        first = true;
        child.stdin.write("wrong-fixture-key\r");
        return;
      }
      const rejected = stderr.lastIndexOf("[Linear] API key rejected");
      if (
        !replacement &&
        rejected >= 0 &&
        stderr.lastIndexOf(prompt) > rejected
      ) {
        replacement = true;
        child.stdin.write("fixture-only-linear-key\r");
        return;
      }
      answer(stderr, child);
    },
  );
  assert.equal(result.status, 1, result.stderr);
  assert.equal(JSON.parse(result.stdout).status, "paused");
  assert.equal(first && replacement, true);
  assert.doesNotMatch(
    result.stdout + result.stderr,
    /wrong-fixture-key|fixture-only-linear-key/,
  );
  assert.equal(
    await readFile(join(fixture.directory, ".private/linear-token"), "utf8"),
    "fixture-only-linear-key",
  );
});

test("cancelling secret entry leaves no credential or initialized repository", async (t) => {
  const fixture = await project(t, true);
  let cancelled = false;
  const result = await cli(
    ["run", ...fixture.args, "--interactive", "--json"],
    (stderr, child) => {
      if (cancelled || !stderr.includes("Linear personal API key")) return;
      cancelled = true;
      child.stdin.write("\x03");
    },
  );
  assert.equal(result.status, 130, result.stderr);
  await assert.rejects(
    readFile(join(fixture.directory, ".private/linear-token")),
    { code: "ENOENT" },
  );
  await assert.rejects(readdir(join(fixture.directory, "repo/.git")), {
    code: "ENOENT",
  });
});

test("the Linear recipe collects the issue, approves the saved plan, verifies the app and summarizes through the CLI", async (t) => {
  const fixture = await project(t);
  const result = await cli(
    ["run", ...fixture.args, "--interactive", "--json"],
    dialogue("approve"),
  );
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "done");
  assert.equal(report.outputs.ticket.value.identifier, "ENG-123");
  assert.equal(report.outputs.approval.action, "approve");
  assert.equal(report.outputs.verification.status, 0);
  assert.equal(report.usage.tokens.input, 9);
  assert.match(result.stderr, /Plan verified from the saved issue/);
  assert.match(result.stderr, /Summary/);
  assert.match(result.stderr, /npm test passed/);
  assert.equal(
    await readFile(join(fixture.directory, ".private/agent-calls"), "utf8"),
    "plan\nimplementation\nsummary\n",
  );
  assert.doesNotMatch(result.stdout + result.stderr, /fixture-only-linear-key/);
  const state = join(fixture.directory, ".outpost/state");
  for (const entry of await readdir(state, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile()) continue;
    assert.ok(
      !(await readFile(join(entry.parentPath, entry.name))).includes(
        "fixture-only-linear-key",
      ),
    );
  }
});

test("leaving the plan pending resumes without replaying planning; rejecting it never starts implementation", async (t) => {
  const fixture = await project(t);
  const paused = await cli(
    ["run", ...fixture.args, "--interactive", "--json"],
    dialogue("pending"),
  );
  assert.equal(paused.status, 1, paused.stderr);
  assert.equal(JSON.parse(paused.stdout).status, "paused");
  assert.equal(
    await readFile(join(fixture.directory, ".private/agent-calls"), "utf8"),
    "plan\n",
  );
  const responses: [string, string][] = [
    ["Approve this plan before implementation?", "\x1b[B\x1b[B\r"],
    ["Reason for this decision", "Plan needs revision\r"],
  ];
  const rejected = await cli(
    [
      "resume",
      ...fixture.args,
      "--run-id",
      "linear-development",
      "--interactive",
      "--json",
    ],
    (stderr, child) => {
      if (!responses[0] || !stderr.includes(responses[0][0])) return;
      child.stdin.write(responses.shift()![1]);
    },
  );
  assert.equal(rejected.status, 1, rejected.stderr);
  assert.equal(
    JSON.parse(rejected.stdout).tasks.find(
      (task: TaskRecord) => task.key === "approval",
    ).status,
    "rejected",
  );
  assert.match(rejected.stderr, /Plan verified from the saved issue/);
  assert.equal(
    await readFile(join(fixture.directory, ".private/agent-calls"), "utf8"),
    "plan\n",
  );
});
