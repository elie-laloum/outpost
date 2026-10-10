---
title: "Route the model at each step"
description: "Choose among models of one model provider using a System One decision."
---

First connect a [model provider](../model-providers/) and a [decision service](../decisions/). Routing chooses among that model provider’s candidates at each step; it does not switch sandbox providers or authenticate additional CLI agents.

## Declare a route

Attach `defineHarnessModelRouting()` to the built-in harness when each step should choose its own conversational model. The route names must exactly match the selected `choice` question; all candidates use the harness's existing `ModelProvider`. CLI harness presets keep their configured model.

<!-- tabs -->

```ts title="routing-decision.ts"
import { defineDecision } from "@elie-laloum/outpost";

export const nextModel = defineDecision({
  questions: {
    route: {
      type: "choice",
      instructions: "Choose the model depth for the next step.",
      criteria: { fast: "Routine tools", deep: "Reasoning or repairs" },
    },
  },
});
```

```ts title="router.ts"
import { createSystemOneDecisionProvider } from "@elie-laloum/outpost";

export const laya = createSystemOneDecisionProvider({
  baseUrl: "http://127.0.0.1:8000/v1",
  apiKey: false,
});
```

```ts title="routing.ts"
import { defineHarnessModelRouting } from "@elie-laloum/outpost";
import { nextModel } from "./routing-decision.ts";
import { laya } from "./router.ts";

export const routing = defineHarnessModelRouting({
  provider: laya,
  model: "auto",
  decision: nextModel,
  question: "route",
  models: {
    fast: { name: process.env.FAST_MODEL ?? "", maxOutputTokens: 2_000 },
    deep: { name: process.env.DEEP_MODEL ?? "", maxOutputTokens: 8_000 },
  },
  minConfidence: 0.85,
  fallback: "deep",
  onError: "fallback",
});
```

Set `FAST_MODEL` and `DEEP_MODEL` to names supported by your conversational model service. The candidate's `reasoning` and `maxOutputTokens` apply only when it is selected; settings from the previous model do not carry over.

## Compose the agent

The harness validates every candidate during composition, before allocating a sandbox. The agent's declared model supplies the initial model, including any compaction before the first selection.

```ts title="routed-agent.ts"
import {
  createAgent,
  createHarness,
  createOpenAIModelProvider,
} from "@elie-laloum/outpost";
import { routing } from "./routing.ts";

export const agent = createAgent({
  model: process.env.DEEP_MODEL ?? "",
  harness: createHarness({
    modelProvider: createOpenAIModelProvider({
      baseUrl: "https://api.openai.com/v1",
      api: "responses",
      apiKey: process.env.OPENAI_API_KEY ?? "",
    }),
    routing,
  }),
});
```

Pass this agent to your [dispatch](../first-request/) with the configured sandbox provider. These API keys remain on the host; tools use the dispatch sandbox. A subagent can declare its own routed harness, using its separate history and cumulative ancestor budgets.

## Supply useful state

The route is evaluated once per step, after compaction and before `before-model`. The default state includes session instructions, visible messages, available tools, step number and active model. Opaque reasoning blocks are excluded. Tool results and structured-response repair messages therefore affect the next decision.

Session instructions are resolved once. Compaction uses the active model before the next route is chosen. Hooks and tools receive the newly selected model. Selection preserves the sandbox, history and tool calls; incompatible replayable reasoning is filtered by the existing model-provider rules.

```ts title="focused-routing.ts"
import { defineHarnessModelRouting } from "@elie-laloum/outpost";
import { routing } from "./routing.ts";

const { kind: _kind, ...options } = routing;
export const focusedRouting = defineHarnessModelRouting({
  ...options,
  state: ({ step, model, messages }) => ({
    step,
    activeModel: model.name,
    recentText: messages
      .slice(-4)
      .flatMap((message) =>
        message.content.flatMap((block) =>
          block.type === "text" ? [block.text] : [],
        ),
      ),
  }),
});
```

Your callback can be asynchronous and receives the cancellation signal. Outpost never silently truncates the resulting state. Choose any explicit reduction according to your application's needs.

## Choose a fallback policy

The default confidence threshold is `0.85`; a smaller confidence selects `fallback`. With the default `onError: "fallback"`, timeouts and explicitly classified service unavailability also select it. `onError: "fail"` propagates those failures.

Quota, cancellation, configuration faults, invalid responses and truncation always propagate. A successful decision without usage, or an unavailable request without a usage receipt, marks consumption incomplete; a strict token budget can stop the turn rather than continue with unknown consumption.

## Observe and resume

`decision` observations summarize router requests; `model-route` agent events identify each selection and its reason. Detailed request state and responses require verbose observation. Usage is accounted once independently of sinks, adding routing to harness, ancestor and workflow budgets.

Routed transcripts use version 2 while retaining the `harness` storage format. Version 1 remains readable. Capture, resume and fork preserve messages; the next step makes a fresh decision without replaying completed calls. Journal replay restores recorded selections and decision observations without contacting the router; detailed payloads still require a verbose hub. See [observability](../observability/) and [conversations](../conversations/).

API: [defineHarnessModelRouting](../../reference/defineharnessmodelrouting/) · [HarnessModelRoutingOptions](../../reference/harnessmodelroutingoptions/).
