---
title: "Evaluate a typed decision"
description: "Use Jev or a compatible Laya server for typed choices, scores and yes/no probabilities."
---

## Declare the questions

`defineDecision()` validates and freezes questions. A `choice` selects a named option, a `score` evaluates ordered levels, and `noul` returns the probability of yes. This declaration preserves the answer keys and choice literals in TypeScript.

```ts title="decision.ts"
import { defineDecision } from "@elie-laloum/outpost";

export const routing = defineDecision({
  questions: {
    route: {
      type: "choice",
      instructions: "Choose the depth needed for the next step.",
      criteria: { fast: "Routine execution", deep: "Complex reasoning" },
    },
    difficulty: {
      type: "score",
      instructions: "Assess difficulty.",
      criteria: ["Routine", "Moderate", "Complex"],
    },
    safe: { type: "noul", instructions: "Is the next action read-only?" },
  },
});
```

The score levels are indexed from 0 to the number of levels minus one. The returned distributions, confidence values and yes/no probability come from the service; Outpost validates them without recomputing them. Optional `noul.criteria` describes the `true` and `false` outcomes.

Services such as Laya round probabilities and scores to four decimals. Validation allows the accumulated rounding error when checking distribution totals and weighted scores, while preserving every native value without renormalizing it. Incoherent totals and scores remain errors.

## Connect Jev or Laya

One provider implements the System One protocol. Its base URL includes `/v1`; Outpost appends `/systemone`. The address and credentials are used by your Node.js process, independently of the sandbox.

```ts title="decision-provider.ts"
import { createSystemOneDecisionProvider } from "@elie-laloum/outpost";

export const provider = createSystemOneDecisionProvider({
  baseUrl: process.env.SYSTEM_ONE_BASE_URL ?? "http://127.0.0.1:8000/v1",
  apiKey: process.env.SYSTEM_ONE_API_KEY ?? false,
  timeoutMs: 10_000,
});
```

Set the endpoint and a nonempty key for an authenticated service. `apiKey: false` explicitly selects an endpoint without authentication, such as your local Laya server. Providers do not read credentials automatically. See the [Jev API](https://docs.typesafe.ai/api) and [Laya server](https://github.com/NandhaKishorM/laya/blob/main/laya/serve.py) for server setup.

## Evaluate the current state

Pass text, an object or an array containing lossless JSON. Cycles, dates, undefined properties, sparse arrays, nonfinite numbers and serialization hooks are rejected before sending a request.

```ts title="evaluate.ts"
import { decide } from "@elie-laloum/outpost";
import { routing } from "./decision.ts";
import { provider } from "./decision-provider.ts";
import { reportValue } from "./reporter.ts";

const result = await decide({
  provider,
  model: "jev-latest",
  decision: routing,
  state: { goal: "Fix a parser", lastTool: "Two regression tests failed" },
});
const route: "fast" | "deep" = result.answers.route.choice;
reportValue(route, result.answers.difficulty.score, result.answers.safe.noul);
```

Run `node evaluate.ts` with the service available. The result includes the provider, actual response model, normalized usage and available metadata. The HTTP provider retains the native JSON response in `metadata`, including Laya routing and input diagnostics. Decision models are names; generation and reasoning settings belong to conversational models.

## Handle incomplete input and failures

A reported truncation rejects with code `response` and `details.truncated: true`. Set `allowTruncated: true` only when your application accepts evaluating partial input. An absent `truncated` field does not prove that the service processed the complete input.

Requests have no internal retries. HTTP 429 is `quota`; timeouts are `timeout`; connection failures and unavailable HTTP statuses carry an availability classification. Invalid JSON, answers or usage fail with `response`. Caller cancellation propagates. The defaults are a 120-second timeout and an 8 MiB response limit.

## Add a workflow task

`defineDecisionTask()` uses the existing dependency, condition, retry, timeout and cache machinery. It evaluates its state callback with `TaskContext` and allocates no sandbox. Dependent tasks receive typed answers through `context.value(triage)`.

```ts title="triage.ts"
import { defineDecisionTask, defineTask } from "@elie-laloum/outpost";
import { provider } from "./decision-provider.ts";
import { routing } from "./decision.ts";

export const input = defineTask({
  key: "input",
  perform: () => ({ goal: "Fix a parser" }),
});
export const triage = defineDecisionTask({
  key: "triage",
  after: [input],
  provider,
  model: "jev-latest",
  decision: routing,
  state: (context) => context.value(input),
  timeoutMs: 10_000,
});
```

Include both tasks in a [workflow](../task-dependencies/). Completed checkpoints restore the result without another evaluation; an interrupted attempt still needs explicit replay authorization. Cache keys and versions must cover the state and decision configuration: questions, endpoint, model and truncation policy. Cache hits use no attempts or tokens.

Decision usage enters workflow budgets synchronously, including valid usage received with a result later rejected for truncation. Missing usage remains incomplete, so strict token budgets cannot assume zero consumption. See [budgets](../budgets/), [task caches](../task-cache/) and [model routing](../model-routing/).

## Exercise the contract offline

This explicit test provider returns a fixed answer and usage receipt. Run `node offline.ts` to exercise declaration, validation and result handling without a model account. This checks the Outpost contract; it does not validate real Jev or Laya inference.

<!-- tabs -->

```ts title="offline-decision.ts"
import { defineDecision } from "@elie-laloum/outpost";

export const readOnly = defineDecision({
  questions: {
    safe: { type: "noul", instructions: "Is the action read-only?" },
  },
});
```

```ts title="fixture-provider.ts"
import type { DecisionProvider } from "@elie-laloum/outpost";

export const fixture: DecisionProvider = {
  name: "offline-fixture",
  request: async () => ({
    model: "fixture",
    answers: { safe: { type: "noul", noul: 0.9 } },
    usage: { input: 3, cached: 0, output: 1 },
  }),
};
```

```ts title="offline.ts"
import { decide } from "@elie-laloum/outpost";
import { readOnly } from "./offline-decision.ts";
import { fixture } from "./fixture-provider.ts";
import { reportValue } from "./reporter.ts";

const result = await decide({
  provider: fixture,
  model: "fixture",
  decision: readOnly,
  state: "Read the test report.",
});
reportValue(result.answers.safe.noul);
// Example output: 0.9
```

<!-- check:run -->

API: [defineDecision](../../reference/definedecision/) · [decide](../../reference/decide/) · [defineDecisionTask](../../reference/definedecisiontask/) · [DecisionProvider](../../reference/decisionprovider/).
