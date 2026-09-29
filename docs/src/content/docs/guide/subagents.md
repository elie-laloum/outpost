---
title: "Subagents"
description: "Delegate part of a turn to a child agent that shares the sandbox."
---

`defineHarnessSubagent()` exposes a built-in agent as a tool. Compose the child explicitly; each call starts a fresh history containing the supplied `prompt` and the child’s instructions.

```ts
import {
  createAgent,
  defineHarnessSubagent,
  createHarness,
  createHarnessFileTools,
  createOpenAIModelProvider,
} from "@elie-laloum/outpost";

const modelProvider = createOpenAIModelProvider({
  baseUrl: "https://api.openai.com/v1",
  api: "responses",
  apiKey: process.env.OPENAI_API_KEY ?? "",
});
const model = process.env.MODEL_NAME ?? "";
const reviewer = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    instructions:
      "Inspect files and report findings. Do not modify the repository.",
    tools: [createHarnessFileTools()],
    limits: { maxSteps: 6, usage: { output: 2_000 } },
  }),
});
const coordinator = createAgent({
  model,
  harness: createHarness({
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

HTTP failures preserve valid `Retry-After` headers for explicit [task retries](../concurrency-and-retries/).
