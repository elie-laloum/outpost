---
title: "Model loop"
description: "Let Outpost drive model requests and tools."
---

The built-in engine and its public contracts are stabilized for the next release. This change is implemented and not yet published.

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

## Delegate to a child

`defineHarnessSubagent()` exposes a built-in agent as a tool. Compose the child explicitly; each call starts a fresh history containing the supplied `prompt` and the child’s instructions.

```ts
import {
  agent,
  defineHarnessSubagent,
  harness,
  harnessFileTools,
  openaiModelProvider,
} from "@elie-laloum/outpost";

const modelProvider = openaiModelProvider({
  baseUrl: "https://api.openai.com/v1",
  api: "responses",
  apiKey: process.env.OPENAI_API_KEY ?? "",
});
const model = process.env.MODEL_NAME ?? "";
const reviewer = agent({
  model,
  harness: harness({
    modelProvider,
    instructions:
      "Inspect files and report findings. Do not modify the repository.",
    tools: [harnessFileTools()],
    limits: { maxSteps: 6, usage: { output: 2_000 } },
  }),
});
const coordinator = agent({
  model,
  harness: harness({
    modelProvider,
    tools: [
      defineHarnessSubagent({
        name: "review",
        description: "Ask a reviewer to inspect repository files.",
        agent: reviewer,
      }),
    ],
    limits: { maxSteps: 8, maxDelegationDepth: 1, usage: { output: 5_000 } },
  }),
});
```

Pass `coordinator` to your dispatch. The parent calls `review` with `{ "prompt": "Inspect the validation code" }` and receives JSON text with `text` and, when enabled, `conversation`. Children use the same sandbox and filesystem; they do not create a workspace or allocate a provider. Delegations run sequentially, including children whose tools are read-only. Parent and child declarative permissions both apply to every child tool call, including rewritten inputs. Child hooks remain scoped to the child. Custom callbacks remain trusted application code.

Step and tool-call limits apply to each loop independently. Token limits include model summaries and all descendants; child usage is included once in dispatch/workflow totals. A child limit can return a tool error according to the parent’s `toolExecution.onError`; exhausting an ancestor token budget fails that ancestor. These limits use reported usage: an in-flight response can incur tokens before a breach is detected. They are not prepaid monetary limits.

`maxDelegationDepth` defaults to 3; 0 disables delegation. A child can tighten the remaining depth but cannot increase an ancestor’s bound. Parent cancellation and tool deadlines reach child model calls and sandbox commands. A child cannot release the shared sandbox.

When enabled, child transcripts use the child’s conversation store, record `parentConversation` and `parentCallId`, and are captured even after failure. Parent continuation reuses recorded tool results; it does not automatically resume or re-run a child. Interrupted calls remain explicit errors. Use the child conversation identifier with an explicit dispatch to resume it. Child lifecycle events link a unique execution `id`, the delegation `callId` and the optional conversation; other child events and their observation scopes carry `subagentId`. Interactive terminal attachment remains unsupported for built-in harnesses.

API: [defineHarnessSubagent](../../reference/defineharnesssubagent/) · [HarnessSubagentOptions](../../reference/harnesssubagentoptions/).
