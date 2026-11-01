import assert from "node:assert/strict";
import { test } from "node:test";
import { dispatch, type Usage } from "../../src/core.ts";
import {
  calculateUsageCost,
  defineIsolatedTask,
  defineWorkflow,
  type ModelPriceTable,
  type WorkflowEvent,
} from "../../src/workflows.ts";
import type { AgentObservation } from "../../src/integrations.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository, scripted, emit } from "../helpers.ts";

const uncachedTokens = { input: 4, cached: 10, cacheCreated: 2, output: 3 };
const inclusiveTokens = { input: 12, cached: 8, output: 5 };
const prices: ModelPriceTable = {
  currency: "USD",
  models: {
    opus: { input: 5, output: 25, cached: 0.5, cacheCreated: 6.25 },
    gpt: { input: 2, output: 8, cached: 0.2 },
  },
};

function fixture(tokens: Usage, model?: string, uncached = false) {
  return {
    ...scripted(
      `console.log(JSON.stringify({kind:"usage",tokens:${JSON.stringify(tokens)}})); ${emit("<outpost>done</outpost>")}`,
    ),
    ...(model ? { model: { name: model } } : {}),
    ...(uncached ? { usageInput: "uncached" as const } : {}),
  };
}

async function run(
  root: string,
  agent: ReturnType<typeof fixture>,
  options: { readonly prices?: ModelPriceTable } = {},
) {
  const events: AgentObservation[] = [];
  const result = await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent,
    brief: { text: "work" },
    logging: false,
    observe: (event) => events.push(event),
    ...options,
  });
  const usage = events.flatMap((event) =>
    event.kind === "usage" ? [event.tokens] : [],
  );
  return { result, usage };
}

test("usage without prices keeps the cache convention of each model", async (t) => {
  const root = await repository(t);
  const uncached = await run(root, fixture(uncachedTokens, "opus", true));
  const inclusive = await run(root, fixture(inclusiveTokens, "gpt"));
  const opus = { ...uncachedTokens, inputIncludesCache: false };
  assert.deepEqual(uncached.result.usage, {
    ...uncachedTokens,
    models: { opus },
  });
  assert.deepEqual(uncached.usage, [{ ...uncachedTokens, models: { opus } }]);
  assert.deepEqual(inclusive.result.usage, {
    ...inclusiveTokens,
    models: { gpt: inclusiveTokens },
  });
  assert.deepEqual(inclusive.usage, [
    { ...inclusiveTokens, models: { gpt: inclusiveTokens } },
  ]);
});

test("usage of an agent without a configured model is filed under its default model", async (t) => {
  const root = await repository(t);
  const { result, usage } = await run(
    root,
    fixture(uncachedTokens, undefined, true),
  );
  const expected = {
    ...uncachedTokens,
    models: {
      "fixture:default": { ...uncachedTokens, inputIncludesCache: false },
    },
  };
  assert.deepEqual(result.usage, expected);
  assert.deepEqual(usage, [expected]);
  assert.deepEqual(calculateUsageCost(result.usage, prices), {
    currency: "USD",
    amount: 0,
    complete: false,
  });
});

test("a workflow mixing cache conventions keeps each model separate", async (t) => {
  const root = await repository(t);
  const task = (key: string, agent: ReturnType<typeof fixture>) =>
    defineIsolatedTask({
      key,
      request: () => ({
        repository: root,
        sandboxProvider: createLocalSandboxProvider(),
        agent,
        brief: { text: key },
        logging: false,
      }),
    });
  const events: WorkflowEvent[] = [];
  const result = await defineWorkflow("mixed", [
    task("claude", fixture(uncachedTokens, "opus", true)),
    task("codex", fixture(inclusiveTokens, "gpt")),
    task("unnamed", fixture(inclusiveTokens)),
  ]).start({ observe: (event) => events.push(event) });
  result.unwrap();
  assert.deepEqual(result.usage.tokens, {
    input: 28,
    cached: 26,
    cacheCreated: 2,
    output: 13,
    models: {
      opus: { ...uncachedTokens, inputIncludesCache: false },
      gpt: inclusiveTokens,
      "fixture:default": inclusiveTokens,
    },
  });
  const byTask = Object.fromEntries(
    events.flatMap((event) =>
      event.type === "usage" ? [[event.key, event.usage?.models]] : [],
    ),
  );
  assert.deepEqual(byTask, {
    claude: { opus: { ...uncachedTokens, inputIncludesCache: false } },
    codex: { gpt: inclusiveTokens },
    unnamed: { "fixture:default": inclusiveTokens },
  });
});

test("prices keep their usage and cost when attribution no longer depends on them", async (t) => {
  const root = await repository(t);
  const agent = fixture(uncachedTokens, "opus", true);
  const unpriced = await run(root, agent);
  const priced = await run(root, agent, { prices });
  assert.deepEqual(priced.result.usage, unpriced.result.usage);
  assert.deepEqual(priced.usage, unpriced.usage);
  const cost = calculateUsageCost(unpriced.result.usage, prices);
  assert.deepEqual(cost, {
    currency: "USD",
    amount: (4 * 5 + 10 * 0.5 + 2 * 6.25 + 3 * 25) / 1_000_000,
    complete: true,
  });
  assert.deepEqual(priced.result.reportData?.cost, cost);
});
