// Antigravity with your account — your Google login runs the agent in the sandbox.
// Antigravity can resume a conversation *warm*: in the sandbox where it was started,
// while that sandbox is still open. Cold resume (in a new sandbox) and fork are refused:
// Antigravity has no portable session format yet, so the fork is done by hand.

import { join } from "node:path";
import {
  agentVersions,
  createAgent,
  createAntigravityHarness,
  createSandbox,
  dispatch,
} from "@elie-laloum/outpost";
import { sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

const repository = demoRepository(import.meta.dirname);
const brief = (name: string, values = {}) => ({
  file: join(import.meta.dirname, name),
  values,
});

// "account" copies ~/.gemini/antigravity-cli/antigravity-oauth-token into the sandbox.
// Log in once on the host: run `agy` and sign in with your Google account.
// The reasoning effort is part of the model name (see `agy models`).
const coder = createAgent({
  model: "gemini-3.6-flash-low",
  harness: createAntigravityHarness({ authentication: "account" }),
});

// A sandbox that stays open for the whole conversation.
await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  branch: { mode: "named", name: "demo/antigravity" },
});

// Outpost pins the Antigravity version it was checked against; an image built earlier
// keeps its own binary (rebuild it from the root Dockerfile to follow).
const installed = await sandbox.command({
  executable: "agy",
  arguments: ["--version"],
});
console.log(
  `agy ${installed.stdout.trim()} dans le sandbox — Outpost attend ${agentVersions.antigravity}`,
);

// 1. First session: the agent explains the bug without touching anything.
const first = await sandbox.dispatch({
  agent: coder,
  brief: brief("1-explain.md"),
});

console.log("conversation :", first.conversation);
console.log(first.text);

// 2. Warm resume: same sandbox, same conversation — the agent remembers its explanation.
const fixed = await first.resume({ brief: brief("2-fix.md") });

console.log("commits :", fixed.commits);

// 3. Fork is refused before anything runs.
try {
  await first.fork({ brief: brief("3-alternative.md") });
} catch (error) {
  console.log("fork refusé :", (error as Error).message);
}

// 4. "Fork" by hand: a new session, on another branch, receives the explanation.
const alternative = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "demo/antigravity-alternative" },
  brief: brief("3-alternative.md", { explanation: first.text }),
});

console.log(alternative.text);
