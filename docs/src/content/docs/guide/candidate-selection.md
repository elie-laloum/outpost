---
title: "Candidate selection"
description: "Validate competing agent results before choosing a winner."
---

:::note[Experimental]
`speculate()` is an opt-in helper for bounded competing executions.
:::

Provide a repository, sandbox provider, up to eight candidates, a shared budget and a `validate` callback. Each candidate runs on a separate branch. `concurrency` defaults to two.

```ts
import { speculate } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await speculate({
  repository,
  sandboxProvider,
  budget: { attempts: 2, usage: { output: 20_000 } },
  candidates: ["minimal", "refactor"].map((key) => ({
    key,
    agent: coder,
    request: {
      brief: {
        text: `Fix the parser using a ${key} approach. Test and commit.`,
      },
    },
  })),
  async validate({ sandbox }) {
    const test = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
    });
    return test.status === 0;
  },
});
console.log(result.status, result.winner?.branch);
```

## Validate actual behavior

The callback receives the candidate’s live sandbox and output. Run the required checks there and return true only when the candidate is acceptable. An agent’s claim that it passed is not enough to select it.

## Budget and cleanup

The shared budget governs attempts and observed token usage. Already-running candidates can consume additional usage before their results arrive. Losing candidates are cancelled and resources are closed according to ownership rules; recoverable work remains subject to preservation.

Review the selected result and host state before integration. Candidate racing does not authorize publication or resolve every possible host conflict. See the exact `SpeculationResult` and the [roadmap](../../project/roadmap/) before relying on this research path.

API: [speculate](../../reference/speculate/) · [SpeculationResult](../../reference/speculationresult/).
