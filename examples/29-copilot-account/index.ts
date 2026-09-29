// GitHub Copilot CLI with your account — your GitHub login runs the agent in the sandbox.
// At the end of each dispatch, Outpost captures the native Copilot session: it can be
// resumed later, even in a brand-new sandbox (cold resume). Fork is refused.
// Tokens are read from the session files, inside the sandbox, once Copilot exits.

import { join } from "node:path";
import { createAgent, createCopilotHarness, dispatch, type Usage } from "@elie-laloum/outpost";
import { sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


const repository = demoRepository(import.meta.dirname);
const brief = (name: string, values = {}) => ({ file: join(import.meta.dirname, name), values });

// Input excludes the cache; "incomplete" means the counters are only a lower bound.
const tokens = (usage: Usage) =>
  `${usage.input} entrée · ${usage.cached} cache lu · ${usage.output} sortie${usage.complete === false ? " (incomplet)" : ""}`;

// "account" reads the token stored in ~/.copilot/config.json and passes it
// to the sandbox as COPILOT_GITHUB_TOKEN.
// Log in once on the host with `copilot login`.
// Without a model, Copilot uses the default one of your account.
const coder = createAgent({
  harness: createCopilotHarness({ authentication: "account" }),
});


// 1. First session: the agent explains the bug without touching anything.
const first = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "demo/copilot" },
  brief: brief("1-explain.md"),
  warn: (message) => console.log("⚠", message), // announces that tokens are counted after exit
});

console.log(first.text);
console.log("session :", first.conversation, "→", first.transcript);
console.log("tokens :", tokens(first.usage));


// 2. Cold resume: a new sandbox; the captured session is restored before Copilot starts.
//    Only this turn's tokens are counted, not the history's.
const fixed = await first.resume({
  repository,
  sandboxProvider,
  branch: { mode: "named", name: "demo/copilot" },
  brief: brief("2-fix.md"),
});

console.log("commits :", fixed.commits);
console.log("tokens :", tokens(fixed.usage));


// 3. Fork is refused before any sandbox starts.
try {
  await first.fork({ repository, sandboxProvider, brief: brief("3-alternative.md") });
} catch (error) {
  console.log("fork refusé :", (error as Error).message);
}


// 4. "Fork" by hand: a new session, on another branch, receives the explanation.
const alternative = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "demo/copilot-alternative" },
  brief: brief("3-alternative.md", { explanation: first.text }),
});

console.log(alternative.text);
console.log("tokens :", tokens(alternative.usage));
