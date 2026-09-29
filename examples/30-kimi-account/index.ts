// Kimi Code with your account — your Moonshot login runs the agent in the sandbox.
// At the end of each dispatch, Outpost captures the native Kimi session: it can be
// resumed later in a brand-new sandbox (cold resume), or forked with `kimi fork`.
// Tokens are read from the session files once Kimi exits, sub-agents included.

import { join } from "node:path";
import {
  createAgent,
  createKimiHarness,
  defineTask,
  defineWorkflow,
  dispatch,
  WorkflowUsageUnavailable,
  type Usage,
} from "@elie-laloum/outpost";
import { sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

const repository = demoRepository(import.meta.dirname);
const brief = (name: string) => ({ file: join(import.meta.dirname, name) });

// Input excludes the cache; "incomplete" means the counters are only a lower bound.
const tokens = (usage: Usage) =>
  `${usage.input} entrée · ${usage.cached} cache lu · ${usage.cacheCreated ?? 0} cache écrit · ${usage.output} sortie` +
  (usage.complete === false ? " (incomplet)" : "");

// "account" copies the region's OAuth file and the device ID from ~/.kimi-code into
// the sandbox, then runs `kimi login` there. The region defaults to "global" (kimi.ai);
// a kimi.com account needs `region: "mainland-cn"`.
// Log in once on the host with `kimi login --region global`.
// Without a model, Kimi Code uses the default one of your account.
const coder = createAgent({
  harness: createKimiHarness({ authentication: "account" }),
});

// 1. First session: the agent explains the bug without touching anything.
const first = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "demo/kimi" },
  brief: brief("1-explain.md"),
  warn: (message) => console.log("⚠", message), // announces that tokens are counted after exit
});

console.log(first.text);
console.log("session :", first.conversation, "→", first.transcript);
console.log("tokens :", tokens(first.usage));

// 2. Cold resume: a new sandbox; the captured session is restored before Kimi starts.
//    Only this turn's tokens are counted, not the history's.
const fixed = await first.resume({
  repository,
  sandboxProvider,
  branch: { mode: "named", name: "demo/kimi" },
  brief: brief("2-fix.md"),
});

console.log("commits :", fixed.commits);
console.log("tokens :", tokens(fixed.usage));

// 3. Native fork: a copy of the first session, on another branch.
//    The original session stays intact; the fork gets its own ID.
//    Its own tokens can't be told apart from the copied history: rather than charging
//    the parent's history again, Outpost marks this usage incomplete (a lower bound).
const alternative = await first.fork({
  repository,
  sandboxProvider,
  branch: { mode: "named", name: "demo/kimi-alternative" },
  brief: brief("3-alternative.md"),
});

console.log("nouvelle session :", alternative.conversation);
console.log(alternative.text);
console.log("tokens :", tokens(alternative.usage));

// 4. A workflow budget on tokens alone can't be checked against a lower bound:
//    the workflow stops with WorkflowUsageUnavailable. Add `attempts` and a `timeoutMs`
//    for a bound that doesn't depend on the counters.
const forked = defineTask({
  key: "fork",
  perform: async (context) => {
    const result = await first.fork({
      repository,
      sandboxProvider,
      brief: brief("3-alternative.md"),
      signal: context.signal,
    });
    context.reportUsage(result.usage);
    return result.text;
  },
});

const budgeted = await defineWorkflow("kimi-budget", [forked]).start({
  budget: { usage: { output: 50_000 } },
});
const [error] = budgeted.errors;

console.log("\nbudget en jetons seul :", budgeted.status);
if (error instanceof WorkflowUsageUnavailable)
  console.log("  usage incomplet, budget invérifiable :", error.message);
