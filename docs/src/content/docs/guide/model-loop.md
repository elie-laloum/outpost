---
title: "Model loop"
description: "Let Outpost drive model requests and tools."
---

:::note[Experimental]
The built-in harness engine is experimental. Its contract can evolve independently of CLI harnesses.
:::

`harness()` configures Outpost’s own loop: request a model response, validate tool calls, execute tools in the borrowed sandbox, then request the next step.

```ts
import {
  agent,
  harness,
  harnessFileTools,
  openaiModelProvider,
} from "@elie-laloum/outpost";

const coder = agent({
  model: process.env.MODEL_NAME ?? "",
  harness: harness({
    modelProvider: openaiModelProvider({
      baseUrl: "https://api.openai.com/v1",
      api: "responses",
      apiKey: process.env.OPENAI_API_KEY ?? "",
    }),
    instructions: "Inspect the repository and answer with evidence.",
    tools: [harnessFileTools()],
    limits: { maxSteps: 12, maxToolCalls: 30 },
  }),
});
```

Set `MODEL_NAME` to a model available on your service, then pass this agent to a dispatch with your repository and sandbox provider. The model provider does not allocate a sandbox or inherit a CLI account login.

## Limits and errors

`limits` bounds steps, tool calls and observed usage. Hitting a bound fails with code `limit`. `toolExecution` controls concurrency, per-call deadlines and whether tool errors return to the model or fail the turn. Tool callbacks execute in the Outpost process and must use the supplied sandbox for repository operations.

The loop supports [tool policies](../tool-policies/), [context management](../history-management/) and [loadable skills](../loadable-skills/). These settings configure the built-in loop, not Codex or Claude CLI internals.

API: [harness](../../reference/function-harness/) · [HarnessOptions](../../reference/customharnessoptions/).

## Observe the loop

The [observation hub](../live-events/) receives instruction/skill loading, hook decisions, tool output correlated by `callId`, readable reasoning and model errors. Providers may report reasoning and retry stream events; Outpost does not infer retries hidden inside an HTTP client or add retry behavior. Replay blocks can remain opaque even when no readable reasoning is available.

Full `model-request` and `model-response` events require an explicitly verbose hub. Their payloads may contain private conversation content; they are excluded from the normal journal. `tool-result` keeps its bounded preview while `tool-output` exposes command output as it arrives.
