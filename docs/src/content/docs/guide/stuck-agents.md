---
title: "Detect an agent repeating itself"
description: "Stop, warn or redirect an agent when decoded tools or file changes repeat."
---

## Stop repeated activity

An agent can keep producing output while repeating the same commands or edits. Enable the activity watchdog alongside [time limits](../limits-and-cancellation/) to detect these repetitions. Use your agent and sandbox configuration from [setup](../setup/).

This dispatch stops when the same decoded tool call or file-change payload occurs three times among the last twenty activity events. The occurrences can have other calls between them.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/guarded-fix" },
  brief: { text: "Fix the failing tests and commit the change." },
  watchdog: {
    repetition: { window: 20, maxRepeats: 3 },
    onStuck: "stop",
  },
});
```

Outpost emits `stuck`, stops the agent and rejects with an `OutpostError` whose code is `stuck`. A `stopped` event gives the same reason. Cold dispatch releases its sandbox and retains work for [recovery](../recovery/); a warm session remains usable. Files and commits already written stay in place.

## Redirect the agent

Give the watchdog a concrete new instruction when one change of approach is preferable to stopping immediately. This uses [steering](../steering/): the built-in loop receives a message, while a CLI receives live input or resumes its conversation in the same sandbox. A detected built-in subagent receives its own instruction.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Investigate the failing parser test." },
  watchdog: {
    repetition: { window: 20, maxRepeats: 3 },
    onStuck: {
      instruction:
        "Stop repeating this action. Inspect the failing assertion and try another approach.",
      maxInterventions: 1,
    },
  },
});
```

After this instruction, another repetition alert stops the agent. Resumed turns and response repairs share the allowance of this execution; a later dispatch starts fresh. A CLI must support live input or resume, and an instruction that cannot be delivered fails with code `steering`. Final-answer instructions for typed responses remain appended after the new instruction.

## Observe without interrupting

Use `onStuck: "warn"` to keep the agent running and receive a warning through `warn` or observation sinks. The window resets after every alert, so the next episode needs enough new occurrences to reach the threshold again.

The `stuck` event carries the repeated activity category, tool name when available, count and selected action. It omits tool inputs and file contents. Events also reach journals and custom reporters through the normal observation path; policy enforcement happens independently of bounded observer delivery.

## Interpret an alert

This is an exact repetition heuristic, not a proof that the agent has made no progress. Polling, retrying a flaky service or checking the same test can be legitimate. Choose a suitable window and threshold, or begin with warnings.

Object key order is ignored; strings and array order remain significant. Call IDs identify protocol duplicates but do not distinguish otherwise identical actions. Subagent and parent-call scopes do distinguish actions. Text, tool output and tool results do not count toward the window. Detection compares decoded activity before redaction and retains fingerprints rather than full inputs.

File-change events expose only what the adapter reports: identical paths and change kinds may match even when the file contents differ. The watchdog does not read files or compare Git diffs. A missing payload matches other missing payloads, separately from `null`. Other non-JSON payloads advance the window without matching. Agents that expose no tool or file-change events cannot trigger this detector. Replay agents refuse the option.

The offline repository example in `examples/59-repetition-watchdog/` exercises stopping, warning and steering with a simulated model and real local commands, without credentials or paid requests. Native CLI and cloud runs remain to be validated live.

API: [WatchdogOptions](../../reference/watchdogoptions/) · [RepetitionPolicy](../../reference/repetitionpolicy/) · [StuckInstruction](../../reference/stuckinstruction/) · [StuckEvent](../../reference/stuckevent/).
