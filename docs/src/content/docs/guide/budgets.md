---
title: "Limit attempts, tokens and cost"
description: "Set a workflow budget and understand how usage is counted across retries and resumes."
---

## Set a workflow budget

Pass a `budget` to the workflow’s `start()` method to limit attempts, reported tokens or both. These limits apply across the workflow’s tasks, rather than to each task separately.

```ts
import { reportValue } from "./reporter.ts";
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";

const meter = defineTask({
  key: "meter",
  perform(context) {
    context.reportUsage({ input: 10, cached: 0, output: 5 });
    return "recorded";
  },
});
const result = await defineWorkflow("bounded", [meter]).start({
  budget: { attempts: 5, usage: { input: 50_000, output: 10_000 } },
});
reportValue(result.usage);
// Example output: { attempts: 1, tokens: { input: 10, cached: 0, output: 5 } }
```

<!-- check:run -->

It prints `{ attempts: 1, tokens: { input: 10, cached: 0, output: 5 } }`.

API reference: [WorkflowBudget](../../reference/workflowbudget/).

`speculate()` requires the same `budget`, shared by its candidates: see [Competing candidates](../speculation/).

## Understand attempt counts

Each attempt is admitted against `budget.attempts` before it starts.

<!-- features -->

- [Task attempt](../concurrency-and-retries/): Each run of a task, including every retry.
- [Loop round](../verification-loops/): Each round of a loop task.
- [Speculative candidate](../speculation/): Each candidate that `speculate()` starts.

One agent turn counts as one attempt, even if it makes many model requests. A skipped task or a result restored from the [cache](../task-cache/) uses no attempt.

## Report usage

Agent task helpers report the tokens of their agent automatically: `defineAgentTask()`, `defineIsolatedTask()`, `defineInteractiveAgentTask()` and `defineQueuedTask()`. A custom task that calls a model reports what it spent.

```ts
import { defineTask } from "@elie-laloum/outpost";
import type { Usage } from "@elie-laloum/outpost";

declare function summarize(
  text: string,
): Promise<{ id: string; text: string; usage: Usage }>;

const summary = defineTask({
  key: "summary",
  async perform(context) {
    const reply = await summarize("Summarize the release notes.");
    context.reportUsageOnce?.(`summary:${reply.id}`, reply.usage);
    return reply.text;
  },
});
```

`reportUsage(usage)` adds to the totals. `reportUsageOnce(receipt, usage)` ignores a receipt the task already recorded, even after a checkpoint resume, so a result read twice is counted once. Both work only during the running attempt.

## Understand budget limits

Outpost checks the reported usage before allowing more work to start. The budget applies to these recorded totals; it cannot predict the tokens an in-progress model request will consume.

| Limit                                         | When it is checked                           | What happens                                                                            |
| --------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| `attempts`                                    | Before each attempt                          | No new attempt starts; running ones finish. `WorkflowBudgetExceeded` with `"attempts"`. |
| `usage.input`, `usage.output`, …              | Before each attempt and at each usage report | Running attempts are cancelled; nothing else starts. `WorkflowBudgetExceeded`.          |
| Token limits, no `attempts`, incomplete usage | Before each attempt and at each usage report | Running attempts are cancelled; nothing else starts. `WorkflowUsageUnavailable`.        |

A limit stops the run once the total reaches it. The run then ends with `status: "failed"`, the stopped tasks are `cancelled`, and `result.errors` holds the error with its `dimension`, `limit` and `observed` values.

:::caution
A running agent turn can spend tokens before it reports them, so the total can exceed a limit. A budget is not a billing cap: keep spending limits with your provider.
:::

## Handle incomplete usage

`result.usage.tokens.complete === false` means some tokens could not be measured: the counters are a lower bound. The marker stays through retries, aggregation and checkpoints.

With token limits and no `attempts`, incomplete usage stops the run with `WorkflowUsageUnavailable`. With `attempts`, the run continues under the attempt limit and Outpost emits a warning.

[Copilot CLI](../copilot-cli/) and [Kimi Code](../kimi-code/) read their final counters from the session after the CLI exits. For them especially, bound each run by attempts and time.

<!-- tabs -->

```ts title="fix-task.ts"
import { defineIsolatedTask } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export const fix = defineIsolatedTask({
  key: "fix",
  timeoutMs: 30 * 60_000,
  retry: { attempts: 2 },
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-tests" },
    brief: { text: "Fix the failing tests and commit the fix." },
    deadlineMs: 20 * 60_000,
  }),
});
```

```ts title="run-fix.ts"
import { reportValue } from "./reporter.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
import { fix } from "./fix-task.ts";

export const result = await defineWorkflow("fix-tests", [fix]).start({
  budget: { attempts: 3, usage: { input: 2_000_000 } },
});
reportValue(result.status, result.usage);
// Example output: done { attempts: 1, tokens: { input: 1200, cached: 0, output: 320 } }
```

`timeoutMs` bounds each task attempt and `deadlineMs` each agent turn: see [Limits and cancellation](../limits-and-cancellation/). [Choose an agent](../choose-an-agent/) shows when each agent reports usage.

## Keep totals across resumes

A [checkpoint](../durable-runs/) saves `result.usage`. A resumed run starts from the saved totals, so the budget covers the whole run, not the current process.

To continue a run its budget stopped, start it again with a larger budget and authorize the replay of its cancelled tasks: see [Durable runs](../durable-runs/). A durable speculative race must resume with the budget it started with.

## Set other limits

<!-- features -->

- [Limits and cancellation](../limits-and-cancellation/): Bound one agent turn in time or silence.
- [Concurrency, retries and timeouts](../concurrency-and-retries/): Bound each task attempt and a whole run in time.
- [Built-in harness](../harness/): Bound model requests, tool calls and tokens within one turn.

API: [WorkflowBudget](../../reference/workflowbudget/) · [WorkflowUsage](../../reference/workflowusage/) · [Usage](../../reference/usage/) · [TaskContext](../../reference/taskcontext/) · [WorkflowBudgetExceeded](../../reference/workflowbudgetexceeded/) · [WorkflowUsageUnavailable](../../reference/workflowusageunavailable/).

## Include decision usage

[Decision tasks](../decisions/) contribute their normalized usage to workflow budgets. [Model routing](../model-routing/) also counts against harness, ancestor and workflow budgets, exactly once per router request. Valid usage still counts when truncation rejects the result. A missing receipt is incomplete usage, and strict token budgets reject continuation with unknown consumption.

## Estimate and limit monetary cost

Supply rates per million tokens in one currency. The table below is illustrative, not a current vendor quote. Cache rates can differ from ordinary input rates. Built-in agent task helpers attach the configured CLI model or each harness request’s model, including subagents and routing decisions.

```ts title="prices.ts"
import type { ModelPriceTable } from "@elie-laloum/outpost";
export const prices: ModelPriceTable = {
  currency: "EUR",
  models: {
    "my-model": { input: 2, cached: 0.5, cacheCreated: 3, output: 8 },
  },
};
```

Custom tasks report their model counters explicitly. This workflow estimates €0.60 from 100000 input tokens and 50000 output tokens, and shares its €20 limit across all tasks and retries.

```ts title="monetary-budget.ts"
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";
import { prices } from "./prices.ts";
const task = defineTask({
  key: "meter",
  perform(context) {
    const tokens = { input: 100_000, cached: 0, output: 50_000 };
    context.reportUsage({ ...tokens, models: { "my-model": tokens } });
    return "recorded";
  },
});
export const result = await defineWorkflow("cost", [task]).start({
  budget: { prices, cost: { currency: "EUR", limit: 20 } },
});
```

Read `result.usage.cost` for the currency, amount and completeness. Supplying `prices` alone displays cost without enforcing a monetary limit. A strict cost budget stops with `WorkflowCostUnavailable` when any reported tokens lack a model, price or complete usage, even with an attempt limit. Reaching the limit emits `WorkflowBudgetExceeded` with dimension `cost` and cancels running attempts. Requests already in flight can overshoot; this is not a provider billing cap.

Configured CLI model names must match the table exactly; configure an explicit model rather than relying on a CLI default. Custom dispatches pass `prices: context.prices` to collect attribution. Queue workers must return model-attributed usage themselves. Decisions use the configured decision model. Use distinct model aliases for different service prices or cache conventions. Account/subscription runs show a token-price estimate, not the subscription’s actual invoice.

Checkpoints retain model counters. Resuming recomputes the cumulative estimate using the supplied table; persist and reuse the table if historical estimates must stay stable. Legacy checkpoints without model counters cannot satisfy a strict cost budget. Durable speculation includes its price table in checkpoint identity.

API: [ModelPriceTable](../../reference/modelpricetable/) · [calculateUsageCost](../../reference/calculateusagecost/) · [UsageCost](../../reference/usagecost/) · [WorkflowCostUnavailable](../../reference/workflowcostunavailable/).

## Load a public pricing catalog

`loadModelPrices()` fetches only when called, then returns an immutable table. [Models.dev](https://github.com/anomalyco/models.dev#api) publishes USD rates per million tokens. Select its provider and map Outpost names to catalog IDs. EUR requires your own exchange rate; the rate below is illustrative.

```ts
import { loadModelPrices } from "@elie-laloum/outpost";
export const prices = await loadModelPrices({
  provider: "openai",
  models: { "gpt-5": "gpt-5" },
  currency: "EUR",
  usdExchangeRate: 0.9,
});
```

[OpenRouter’s models endpoint](https://openrouter.ai/docs/api/api-reference/models/get-models) uses per-token USD prices. The adapter normalizes their units. Catalogs can change; inspect and save your table before starting durable work. Unsupported tiers, modality charges or nonzero extra fees are refused so you can supply an explicit rate table.

```ts
import { loadModelPrices } from "@elie-laloum/outpost";
export const prices = await loadModelPrices({
  source: "openrouter",
  models: { "openai/gpt-4o-mini": "openai/gpt-4o-mini" },
});
```

No catalogue call happens during accounting. The HTTP request has a size limit, a timeout and optional cancellation. This adapter estimates token charges; taxes, discounts, tools, images and other billing dimensions remain outside the calculation.

API: [loadModelPrices](../../reference/loadmodelprices/) · [ModelPricesOptions](../../reference/modelpricesoptions/).
