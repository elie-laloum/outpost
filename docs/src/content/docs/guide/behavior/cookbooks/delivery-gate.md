---
title: "Test and review before integration"
description: "Test and review before integration — Outpost"
sidebar:
  order: 5
---

This recipe explicitly permits integration into the host branch after validation. Start from a clean attached branch with the [shared setup](../../../cookbook/). Adapt tests to your actual project.

```ts
import {
  createSandbox,
  claude,
  agentTask,
  commandTask,
  task,
  workflow,
  response,
} from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: claude(),
  branch: { mode: "integrate" },
  hooks: {
    sandboxReady: [
      { executable: "npm", arguments: ["ci"], deadlineMs: 180_000 },
    ],
  },
});
const implement = agentTask({
  key: "implement",
  sandbox,
  request: () => ({
    brief: { text: "Fix parser edge cases, add tests and commit." },
    deadlineMs: 600_000,
  }),
});
const verify = commandTask({
  key: "verify",
  after: [implement],
  sandbox,
  command: { executable: "npm", arguments: ["test"], deadlineMs: 180_000 },
});
const review = agentTask({
  key: "review",
  after: [verify],
  sandbox,
  request: () => ({
    brief: {
      text:
        "Review the diff against " +
        sandbox.workspace.baseline +
        '. Do not edit. Return <review>{"approved":true}</review> only without blocking defects; otherwise use false.',
    },
    deadlineMs: 300_000,
    response: response.json({
      tag: "review",
      schema(value) {
        if (
          !value ||
          typeof value !== "object" ||
          !("approved" in value) ||
          typeof value.approved !== "boolean"
        )
          throw new Error("Expected approved boolean");
        return { approved: value.approved };
      },
    }),
  }),
});
const integrate = task({
  key: "integrate",
  after: [review],
  async perform(context) {
    if (!context.value(review).value.approved)
      throw new Error("Review declined integration");
    const clean = await sandbox.command({
      executable: "git",
      arguments: ["status", "--porcelain"],
      signal: context.signal,
    });
    if (clean.status !== 0 || clean.stdout.trim())
      throw new Error("Expected committed, clean changes");
    await sandbox.workspace.integrate();
    return { integrated: true };
  },
});
const result = await workflow("validated-delivery", [
  implement,
  verify,
  review,
  integrate,
]).start({ signal: AbortSignal.timeout(1_200_000) });
result.unwrap();
console.log(result.value(integrate));
```

## Gate behavior

Dependencies serialize shared-sandbox work. A nonzero test status prevents review/integration. Invalid review output fails parsing; a negative review throws before merging. No retries repeat commits or merges.

Success represents passing tests and an agent review, not human approval. Use a separate human-controlled merge when required. A conflict can retain recovery workspaces. Integration merges committed changes locally; it does not push.

## Extend carefully

Add lint/typecheck after implementation. If reviewers may edit, rerun tests after review. Use separate sandboxes for parallel work. See [recovery](../../../operations/recovery/) when a gate fails.
