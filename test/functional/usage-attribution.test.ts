import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createAgent,
  createFallbackAgent,
  dispatch,
  type Agent,
  type CliAgent,
  type Usage,
} from "../../src/core.ts";
import { createHarness } from "../../src/harness.ts";
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
const harnessTokens = { input: 20, cached: 5, output: 7 };
const shared = "claude-sonnet-4-5";
const prices: ModelPriceTable = {
  currency: "USD",
  models: {
    opus: { input: 5, output: 25, cached: 0.5, cacheCreated: 6.25 },
    gpt: { input: 2, output: 8, cached: 0.2 },
    [shared]: { input: 3, output: 15, cached: 0.3 },
  },
};
const usageLine = (tokens: Usage) =>
  `console.log(JSON.stringify({kind:"usage",tokens:${JSON.stringify(tokens)}}));`;
const quota = `console.log(JSON.stringify({kind:"failure",message:"usage limit reached"})); process.exit(1);`;

function fixture(
  name: string,
  tokens: Usage,
  options: { model?: string; uncached?: boolean; quota?: boolean } = {},
): CliAgent {
  return {
    ...scripted(
      `${usageLine(tokens)} ${options.quota ? quota : emit("<outpost>done</outpost>")}`,
    ),
    name,
    quota: (text) => /usage limit/.test(text),
    ...(options.model ? { model: { name: options.model } } : {}),
    ...(options.uncached ? { usageInput: "uncached" as const } : {}),
  };
}

const claude = (model = shared, failing = false) =>
  fixture("claude", uncachedTokens, { model, uncached: true, quota: failing });
const codex = (model = shared) => fixture("codex", inclusiveTokens, { model });
const harness = () =>
  createAgent({
    model: shared,
    harness: createHarness({
      modelProvider: {
        name: "fixture",
        request: async () => ({
          text: "<outpost>done</outpost>",
          usage: harnessTokens,
        }),
      },
    }),
  });

async function run(
  root: string,
  agent: Parameters<typeof dispatch>[0]["agent"],
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

test("unpriced CLI usage is filed under its agent and model with its cache convention", async (t) => {
  const root = await repository(t);
  const uncached = await run(root, claude("opus"));
  const inclusive = await run(root, codex("gpt"));
  const models = {
    "claude:opus": { ...uncachedTokens, inputIncludesCache: false },
  };
  assert.deepEqual(uncached.result.usage, { ...uncachedTokens, models });
  assert.deepEqual(uncached.usage, [{ ...uncachedTokens, models }]);
  assert.deepEqual(inclusive.result.usage, {
    ...inclusiveTokens,
    models: { "codex:gpt": inclusiveTokens },
  });
  assert.deepEqual(inclusive.usage, [
    { ...inclusiveTokens, models: { "codex:gpt": inclusiveTokens } },
  ]);
});

test("unpriced usage of an agent without a configured model is filed under the agent name", async (t) => {
  const root = await repository(t);
  const { result, usage } = await run(
    root,
    fixture("claude", uncachedTokens, { uncached: true }),
  );
  const expected = {
    ...uncachedTokens,
    models: { claude: { ...uncachedTokens, inputIncludesCache: false } },
  };
  assert.deepEqual(result.usage, expected);
  assert.deepEqual(usage, [expected]);
});

test("an unpriced workflow sharing one model name across conventions keeps separate keys", async (t) => {
  const root = await repository(t);
  const task = (key: string, agent: Agent) =>
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
    task("claude", claude()),
    task("codex", codex()),
    task("harness", harness()),
  ]).start({ observe: (event) => events.push(event) });
  result.unwrap();
  const attributed = {
    [`claude:${shared}`]: { ...uncachedTokens, inputIncludesCache: false },
    [`codex:${shared}`]: inclusiveTokens,
  };
  assert.deepEqual(result.usage.tokens, {
    input: 36,
    cached: 23,
    cacheCreated: 2,
    output: 15,
    models: attributed,
  });
  const byTask = Object.fromEntries(
    events.flatMap((event) =>
      event.type === "usage" ? [[event.key, event.usage?.models]] : [],
    ),
  );
  assert.deepEqual(byTask, {
    claude: { [`claude:${shared}`]: attributed[`claude:${shared}`] },
    codex: { [`codex:${shared}`]: inclusiveTokens },
    harness: undefined,
  });
});

test("an unpriced fallback across conventions on one model name keeps both usages", async (t) => {
  const root = await repository(t);
  const agent = createFallbackAgent([claude(shared, true), codex()], {
    on: ["quota"],
  });
  const { result } = await run(root, agent);
  assert.equal(result.fallback?.selected.name, "codex");
  assert.deepEqual(result.usage.models, {
    [`claude:${shared}`]: { ...uncachedTokens, inputIncludesCache: false },
    [`codex:${shared}`]: inclusiveTokens,
  });
});

test("priced usage keeps model-name keys, costs and the convention conflict", async (t) => {
  const root = await repository(t);
  const unknown = await run(
    root,
    fixture("claude", uncachedTokens, { uncached: true }),
    { prices },
  );
  assert.deepEqual(unknown.result.usage, uncachedTokens);
  const priced = await run(root, claude("opus"), { prices });
  const opus = { ...uncachedTokens, inputIncludesCache: false };
  assert.deepEqual(priced.result.usage, {
    ...uncachedTokens,
    models: { opus },
  });
  assert.deepEqual(priced.usage, [{ ...uncachedTokens, models: { opus } }]);
  const cost = {
    currency: "USD",
    amount: (4 * 5 + 10 * 0.5 + 2 * 6.25 + 3 * 25) / 1_000_000,
    complete: true,
  };
  assert.deepEqual(calculateUsageCost(priced.result.usage, prices), cost);
  assert.deepEqual(priced.result.reportData?.cost, cost);
  await assert.rejects(
    run(
      root,
      createFallbackAgent([claude(shared, true), codex()], { on: ["quota"] }),
      { prices },
    ),
    /Cannot combine different cache conventions for one model/,
  );
});
