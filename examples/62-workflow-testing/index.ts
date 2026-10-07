// Test a workflow with scripted commits, retries and verification commands.
// Run with Node.js 24+ and Git; no account, network or container is required.

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import {
  createSandbox,
  defineAgentTask,
  defineCommandTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import {
  createMemorySandboxProvider,
  scriptedAgent,
} from "@elie-laloum/outpost/testing";

test("parser workflow succeeds after one failed attempt", async (t) => {
  const repository = await mkdtemp(join(tmpdir(), "outpost-workflow-demo-"));
  t.after(() => rm(repository, { recursive: true, force: true }));
  const git = (...args: string[]) =>
    promisify(execFile)("git", args, { cwd: repository });
  await git("init", "-b", "main");
  await git("config", "user.name", "Outpost demo");
  await git("config", "user.email", "demo@example.invalid");
  await writeFile(join(repository, "base.txt"), "base\n");
  await git("add", ".");
  await git("commit", "-m", "Initial");

  const agent = scriptedAgent({
    turns: [
      { status: 7, stderr: "Simulated transient failure\n" },
      {
        text: "Done",
        usage: { input: 10, cached: 0, output: 5 },
        commit: {
          message: "fix: parser",
          files: { "src/p.ts": "export const parse = () => true;\n" },
        },
      },
    ],
  });
  await using sandbox = await createSandbox({
    repository,
    sandboxProvider: createMemorySandboxProvider({
      commands: [
        { executable: "npm", arguments: ["test"], stdout: "Tests passed\n" },
      ],
    }),
    logging: false,
  });
  const coder = defineAgentTask({
    key: "coder",
    sandbox,
    retry: { attempts: 2 },
    request: () => ({ agent, brief: { text: "Fix the parser." } }),
  });
  const verify = defineCommandTask({
    key: "verify",
    after: [coder],
    sandbox,
    command: { executable: "npm", arguments: ["test"] },
  });
  const run = await defineWorkflow("parser-ci", [coder, verify]).start();
  run.unwrap();
  assert.equal(run.value(coder).commits.length, 1);
  assert.equal(run.value(verify).stdout, "Tests passed\n");
  assert.equal(run.tasks[0]?.attempts, 2);
  assert.equal(run.usage.tokens.input, 10);
});
