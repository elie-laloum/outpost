---
title: "Dispatch and results"
description: "Dispatch and results — Outpost"
sidebar:
  order: 1
---

Use a one-shot dispatch when the library should own provisioning and cleanup.

```ts
import { dispatch, codex } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

const result = await dispatch({
  repository: "/work/backend",
  agent: codex(),
  provider: docker(),
  branch: { mode: "integrate" },
  brief: { text: "Fix the tests, verify the result and commit it." },
});
console.log(result.text, result.branch, result.commits);
```

A top-level `dispatch` requires an agent and brief. Its options combine [sandbox configuration](../../../../reference/sandboxoptions/) and [dispatch configuration](../../../../reference/dispatchoptions/). It closes resources it created; a supplied workspace remains open.

`repository` selects the local Git repository to change. Without it, the library uses `process.cwd()`. For a path independent of the launch directory, use `resolve(import.meta.dirname, "../backend")`; see [choose a repository](../../../environment/repositories/).

## Read the result

| Field                               | Meaning                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `text`                              | Accumulated agent answer; normalized final events take precedence over partial streaming text within a turn. |
| `value`                             | Validated response value, or `undefined` without a response specification.                                   |
| `turns`                             | Per-turn text, process status, duration, usage and available conversation/transcript.                        |
| `usage`                             | Aggregate raw token counts; no estimated currency cost.                                                      |
| `completed`, `completion`           | Whether a configured completion marker matched, and which one.                                               |
| `branch`, `directory`, `commits`    | Workspace identity and collected commits (`oid`, `subject`).                                                 |
| `conversation`, `transcript`, `log` | Available native conversation ID and host artifact paths.                                                    |
| `retainedDirectory`                 | Workspace kept after disposal, when applicable.                                                              |
| `resume`, `fork`                    | Start another turn from the captured conversation.                                                           |

An agent process failure throws. Reaching the pass budget without a completion marker returns `completed: false`; that is not a process failure. Check both your expected output and the recorded commits before treating work as delivered.

`label` appears in journal records and generated log names. `observe`, `warn` and `diagnostic` add visibility; see [observability](../../../agents/observability/). [Multi-pass execution](../../../agents/iteration/) explains environment reuse.
