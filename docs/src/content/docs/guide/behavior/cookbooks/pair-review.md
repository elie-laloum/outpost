---
title: "Codex implements, Claude reviews"
description: "Codex implements, Claude reviews — Outpost"
sidebar:
  order: 3
---

Reuse one sandbox across implementation and review. Declare **OPENAI_API_KEY=** and **ANTHROPIC_API_KEY=** in **.outpost/.env**, and supply both values through your environment. With `usage` authentication, Outpost runs `codex login --with-api-key` once in the sandbox, with the key on standard input, and gives Claude Code its API key; `"account"` copies host logins instead (see [Codex](../../../agents/connect-codex/) and [Claude Code](../../../agents/connect-claude/)).

```ts
import {
  agent as composeAgent,
  createSandbox,
  codexHarness,
  claudeHarness,
} from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: composeAgent({ harness: codexHarness({ authentication: "usage" }) }),
  branch: { mode: "named", name: "feature/parser-review" },
  hooks: {
    sandboxReady: [
      { executable: "npm", arguments: ["ci"], deadlineMs: 180_000 },
    ],
  },
});
const implementation = await sandbox.dispatch({
  brief: { text: "Add parser boundary tests, run the suite and commit." },
  deadlineMs: 600_000,
});
const review = await sandbox.dispatch({
  agent: composeAgent({ harness: claudeHarness({ authentication: "usage" }) }),
  brief: {
    text:
      "Review the diff against " +
      sandbox.workspace.baseline +
      ". Do not edit. List defects with file paths and missing test cases.",
  },
  deadlineMs: 300_000,
});
console.log(implementation.commits, review.text);
const tests = await sandbox.command({ executable: "npm", arguments: ["test"] });
if (tests.status !== 0) throw new Error(tests.stderr || tests.stdout);
```

## Agent handoff

Both agents see the same files and Git history, but have separate native conversations. Explicitly supply the diff baseline. The second agent does not inherit the first agent's hidden conversation. Operations are sequential.

## Review before delivery

The test command supplies a real exit status. The review is advisory; nothing merges automatically. Inspect the named branch or use the [delivery gate](../../../cookbook/delivery-gate/). Scope exit closes the sandbox even when a test fails.
