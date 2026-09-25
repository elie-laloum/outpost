---
title: "Codex implements, Claude reviews"
description: "Codex implements, Claude reviews — Outpost"
sidebar:
  order: 3
---

Reuse one sandbox across implementation and review. Declare **OPENAI_API_KEY=** and one Claude credential in **.outpost/.env**, and supply both values through your environment. This uses API-key login for Codex; the [account-cache hook](../../../agents/connect-codex/) is an alternative.

```ts
import { createSandbox, codex, claude } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: codex(),
  branch: { mode: "named", name: "feature/parser-review" },
  hooks: {
    sandboxReady: [
      {
        executable: "sh",
        arguments: [
          "-c",
          'test -n "$OPENAI_API_KEY" && printenv OPENAI_API_KEY | codex login --with-api-key && npm ci',
        ],
        deadlineMs: 180_000,
      },
    ],
  },
});
const implementation = await sandbox.dispatch({
  brief: { text: "Add parser boundary tests, run the suite and commit." },
  deadlineMs: 600_000,
});
const review = await sandbox.dispatch({
  agent: claude(),
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
