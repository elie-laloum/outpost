// Best-of-N speculation waits for admitted candidates and ranks validated changes.
// Run with Node.js 24+, the root .env settings and the outpost:sandbox Docker image.

import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  speculate,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { score } from "./score.ts";
import { validate } from "./validate.ts";

const coder = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools: [
      createHarnessFileTools(),
      createHarnessEditTools(),
      createHarnessShellTools(),
    ],
    limits: { maxSteps: 12 },
  }),
});

const state = join(import.meta.dirname, "state");
await mkdir(state, { recursive: true });
const repository = await mkdtemp(join(state, "run-"));
await cp(join(import.meta.dirname, "repo"), repository, { recursive: true });
const git = (...args: string[]) =>
  execFileSync("git", args, { cwd: repository, encoding: "utf8" }).trim();
git("init", "-b", "main");
git("config", "user.name", "Outpost demo");
git("config", "user.email", "demo@example.invalid");
git("config", "core.autocrlf", "false");
git("add", ".");
git("commit", "-m", "Initial commit");

console.log("Repository:", repository);
const approaches = ["minimal", "regex", "loop"];
const result = await speculate({
  repository,
  sandboxProvider,
  concurrency: 2,
  budget: { attempts: approaches.length, usage: { output: 30_000 } },
  candidates: approaches.map((key) => ({
    key,
    agent: coder,
    request: {
      brief: { file: join(import.meta.dirname, `${key}.md`) },
      deadlineMs: 300_000,
      logging: false,
    },
  })),
  select: "best",
  validate,
  score,
});

console.table(
  result.candidates.map((candidate) => ({
    candidate: candidate.key,
    status: candidate.status,
    score: candidate.score,
    outputTokens: candidate.result?.usage.output,
  })),
);
console.log("Status:", result.status);
console.log("Shared usage:", result.usage);
console.log("Host changed:", result.host.changed);
for (const candidate of result.candidates) {
  console.log(`${candidate.key} branch:`, candidate.branch);
  if (candidate.retainedDirectory)
    console.log("Retained worktree:", candidate.retainedDirectory);
  if (candidate.error !== undefined) console.error(candidate.error);
}

const winner = result.winner;
if (winner) {
  console.log("Winner:", winner.key, "with score", winner.score);
  console.log("Integration preflight:", result.integration?.status);
  console.log(git("show", `${winner.commit}:slug.ts`));
  console.log("Branches remain available for review; no merge was performed.");
}
if (!winner) process.exitCode = 1;
