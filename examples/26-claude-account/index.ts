// Claude Code with your account — your host login runs the agent in the sandbox.
// Claude Code saves its conversations natively, so Outpost can resume and fork them.
// Here they are archived in a transport (a local folder; S3 in production) instead of the repository's .outpost.

import { join } from "node:path";
import {
  createAgent,
  createClaudeConversations,
  createClaudeHarness,
  createLocalTransport,
  createTransportConversations,
  dispatch,
} from "@elie-laloum/outpost";
import { sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


const repository = demoRepository(import.meta.dirname);
const brief = (name: string) => ({ file: join(import.meta.dirname, name) });

// Claude's native store, wrapped in a transport: resume and fork read the sessions from there.
const transporter = createLocalTransport({ directory: join(import.meta.dirname, "state") });
const conversations = createTransportConversations(createClaudeConversations(), { transporter, namespace: "claude" });

// "account" copies ~/.claude/.credentials.json into the private sandbox home.
// Log in once on the host: run `claude`, then `/login`.
const coder = createAgent({
  model: { name: "sonnet", reasoning: "low" },
  harness: createClaudeHarness({ authentication: "account", conversations }),
});


// 1. First session: the agent explains the bug without touching anything.
const first = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "demo/claude" },
  brief: brief("1-explain.md"),
});

console.log("conversation :", first.conversation);
console.log(first.text);


// 2. Resume: Claude Code reloads its session and fixes what it explained.
const fixed = await first.resume({
  repository,
  sandboxProvider,
  branch: { mode: "named", name: "demo/claude" },
  brief: brief("2-fix.md"),
});

console.log("commits :", fixed.commits);


// 3. Fork: a copy of the first session, on another branch.
//    The original conversation stays untouched.
const alternative = await first.fork({
  repository,
  sandboxProvider,
  branch: { mode: "named", name: "demo/claude-alternative" },
  brief: brief("3-alternative.md"),
});

console.log("nouvelle conversation :", alternative.conversation);
console.log(alternative.text);
