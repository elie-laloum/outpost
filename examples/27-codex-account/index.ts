// Codex with your account — your ChatGPT login runs the agent in the sandbox.
// Codex saves its conversations natively, so Outpost can resume and fork them.

import { join } from "node:path";
import {
  createAgent,
  createCodexHarness,
  dispatch,
} from "@elie-laloum/outpost";
import { sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

const repository = demoRepository(import.meta.dirname);
const brief = (name: string) => ({ file: join(import.meta.dirname, name) });

// "account" copies ~/.codex/auth.json into the private sandbox home.
// Log in once on the host with `codex login`, after setting
// `cli_auth_credentials_store = "file"` in ~/.codex/config.toml.
// Without a model, Codex uses the default one of your account.
const coder = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});

// 1. First session: the agent explains the bug without touching anything.
const first = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "demo/codex" },
  brief: brief("1-explain.md"),
});

console.log("conversation :", first.conversation);
console.log(first.text);

// 2. Resume: Codex reloads its session and fixes what it explained.
const fixed = await first.resume({
  repository,
  sandboxProvider,
  branch: { mode: "named", name: "demo/codex" },
  brief: brief("2-fix.md"),
});

console.log("commits :", fixed.commits);

// 3. Fork: a copy of the first session, on another branch.
//    The original conversation stays untouched.
const alternative = await first.fork({
  repository,
  sandboxProvider,
  branch: { mode: "named", name: "demo/codex-alternative" },
  brief: brief("3-alternative.md"),
});

console.log("nouvelle conversation :", alternative.conversation);
console.log(alternative.text);
