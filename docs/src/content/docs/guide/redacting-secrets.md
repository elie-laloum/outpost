---
title: "Mask secrets in traces"
description: "Apply explicit masking rules before Outpost saves or delivers sensitive strings."
---

Save the following files together and run `node redact.ts`. The observer prints `[REDACTED]` instead of the sample credential; no model call is needed.

## Apply a masking rule

Create an observer to inspect the command output.

```ts title="events.ts"
import { createObservationHub } from "@elie-laloum/outpost";

export const observation = createObservationHub({
  sinks: [
    {
      observe({ event }) {
        if (event.kind === "command-output") console.log(event.text);
      },
    },
  ],
});
```

Pass `redact` to the workflow. Matching strings are masked before every local or inherited receiver, including journals and older observation callbacks. `dispatch()` and `createObservationHub()` accept the same policy.

```ts title="redact.ts"
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";
import { observation } from "./events.ts";
const task = defineTask({
  key: "record",
  perform(context) {
    context.observation?.emit("sandbox", {
      kind: "command-output",
      channel: "stdout",
      text: "sk-exampleSecret123456789012345",
    });
  },
});
await defineWorkflow("private", [task]).start({
  observation,
  redact: [/sk-[A-Za-z0-9]{20,}/g],
});
await observation.close();
```

<!-- check:run -->

## Protect captures and reports

The rules also mask supported harness/CLI transcripts, sidecars and decoded Copilot/Kimi conversation bundles before archival. Binary bundle entries are refused when masking is enabled. `result.report()` masks its snapshot.

:::caution
Resume reads the masked conversation. Hidden values and signed reasoning data may no longer be replayable.
:::

## Know what stays unmasked

- Prompts sent to the agent and returned task values keep their original content.
- Repository files, checkpoints, old archives, application logs, native CLI sandbox files and temporary transfer staging are not rewritten.
- Rules match individual strings. They neither join streamed fragments nor discover unknown keys or arbitrary encodings.

Choose patterns for your credentials, avoid emitting secrets in fragments and prefer a private ephemeral agent home. Keep credentials out of prompts.

API : [ObservationHubOptions](../../reference/observationhuboptions/) · [DispatchOptions](../../reference/dispatchoptions/) · [WorkflowOptions](../../reference/workflowoptions/).
