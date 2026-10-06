import assert from "node:assert/strict";
import { test } from "node:test";
import {
  defineDecision,
  decide,
  defineHarnessModelRouting,
  createHarness,
  OutpostError,
  createSystemOneDecisionProvider,
} from "../../src/index.ts";
import type {
  DecisionProvider,
  DecisionState,
  ChoiceAnswer,
  ModelProvider,
} from "../../src/index.ts";

const decision = defineDecision({
  questions: {
    route: {
      type: "choice",
      instructions: "Choose",
      criteria: { fast: "Simple", deep: "Difficult" },
    },
    risk: {
      type: "score",
      instructions: "Rate",
      criteria: ["Low", "Medium", "High"],
    },
    needed: {
      type: "noul",
      instructions: "Needed?",
      criteria: { true: "Required", false: "Optional" },
    },
  },
});
const response = () => ({
  model: "fixture",
  answers: {
    route: {
      type: "choice",
      choice: "fast",
      probabilities: { fast: 0.9, deep: 0.1 },
      confidence: 0.8,
    },
    risk: {
      type: "score",
      score: 1.5,
      probabilities: { "1": 0.5, "2": 0.5 },
      confidence: 0.5,
      legend: { "0": "Low", "1": "Medium", "2": "High" },
    },
    needed: { type: "noul", noul: 0.75 },
  },
  usage: { input: 10, cached: 0, output: 2 },
});
const invalid = (error: unknown) =>
  error instanceof OutpostError && error.code === "configuration";
const malformed = (error: unknown) =>
  error instanceof OutpostError && error.code === "response";

test("numeric choice keys infer the string values sent by JSON", async () => {
  const decision = defineDecision({
    questions: {
      route: {
        type: "choice",
        instructions: "Choose",
        criteria: { 0: "Routine", 1: "Complex" },
      },
    },
  });
  const provider: DecisionProvider = {
    name: "fixture",
    request: async () => ({
      model: "fixture",
      answers: {
        route: {
          type: "choice",
          choice: "1",
          confidence: 0.9,
          probabilities: { 0: 0.1, 1: 0.9 },
        },
      },
    }),
  };
  const result = await decide({
    provider,
    model: "fixture",
    decision,
    state: "work",
  });
  const choice: "0" | "1" = result.answers.route.choice;
  assert.equal(choice, "1");
  const routing = defineHarnessModelRouting({
    provider,
    model: "fixture",
    decision,
    question: "route",
    models: { 0: "small", 1: "large" },
    fallback: "1",
  });
  assert.equal(routing.models[choice]?.name, "large");
});

test("decision declarations snapshot questions and infer answers", async () => {
  const criteria = { a: "Alpha", b: "Beta" };
  const declared = defineDecision({
    questions: { q: { type: "choice", instructions: "Pick", criteria } },
  });
  criteria.a = "Changed";
  assert.equal(declared.questions.q.criteria.a, "Alpha");
  assert.ok(Object.isFrozen(declared.questions.q.criteria));
  const provider: DecisionProvider = {
    name: "fixture",
    request: async () => response(),
  };
  const result = await decide({
    provider,
    model: "fixture",
    decision,
    state: { task: "hello" },
  });
  const answer: ChoiceAnswer<"fast" | "deep"> = result.answers.route;
  assert.equal(answer.choice, "fast");
  assert.equal(result.answers.risk.score, 1.5);
  assert.equal(result.answers.needed.noul, 0.75);
  assert.equal("truncated" in result, false);
  const settings = defineHarnessModelRouting({
    provider,
    model: "fixture",
    decision,
    question: "route",
    models: { fast: "small", deep: "large" },
    fallback: "deep",
  });
  assert.equal(settings.minConfidence, 0.85);
  assert.equal(settings.onError, "fallback");
  assert.ok(Object.isFrozen(settings.models));
});

test("decisions retain independently rounded native probabilities and scores", async () => {
  const native = {
    ...response(),
    answers: {
      ...response().answers,
      risk: {
        type: "score",
        score: 0.8136,
        probabilities: { "0": 0.3396, "1": 0.5073, "2": 0.1532 },
        confidence: 0.0912,
        legend: { "0": "Low", "1": "Medium", "2": "High" },
      },
    },
  };
  const result = await decide({
    provider: { name: "fixture", request: async () => native },
    model: "fixture",
    decision,
    state: "state",
  });
  assert.deepEqual(result.answers, native.answers);
});

test("rounded choice distributions account for the number of reported options", async () => {
  for (const count of [3, 7, 255]) {
    const entries = Array.from({ length: count }, (_, i) => [
      `option-${i}`,
      `Option ${i}`,
    ]);
    const declaration = defineDecision({
      questions: {
        route: {
          type: "choice",
          instructions: "Choose",
          criteria: Object.fromEntries(entries),
        },
      },
    });
    const probabilities = Object.fromEntries(
      entries.map(([key]) => [key, Number((1 / count).toFixed(4))]),
    );
    const result = await decide({
      provider: {
        name: "fixture",
        request: async () => ({
          model: "fixture",
          answers: {
            route: {
              type: "choice",
              choice: "option-0",
              probabilities,
              confidence: 0,
            },
          },
        }),
      },
      model: "fixture",
      decision: declaration,
      state: "state",
    });
    assert.deepEqual(result.answers.route.probabilities, probabilities);
  }
});

test("rounding tolerance still rejects incoherent probability totals and scores", async () => {
  for (const risk of [
    {
      ...response().answers.risk,
      score: 0.814,
      probabilities: { "0": 0.3396, "1": 0.5073, "2": 0.1532 },
    },
    {
      ...response().answers.risk,
      score: 0.8137,
      probabilities: { "0": 0.34, "1": 0.5073, "2": 0.1532 },
    },
  ]) {
    await assert.rejects(
      decide({
        provider: {
          name: "fixture",
          request: async () => ({
            ...response(),
            answers: { ...response().answers, risk },
          }),
        },
        model: "fixture",
        decision,
        state: "state",
      }),
      malformed,
    );
  }
});

for (const questions of [
  {},
  { q: { type: "invalid", instructions: "x" } },
  { q: { type: "noul", instructions: "" } },
  { q: { type: "noul", instructions: "x", extra: true } },
  { q: { type: "noul", instructions: "x", criteria: { true: "yes" } } },
  { q: { type: "choice", instructions: "x", criteria: { one: "only" } } },
  { q: { type: "choice", instructions: "x", criteria: { a: "", b: "b" } } },
  { q: { type: "score", instructions: "x", criteria: ["one"] } },
  {
    q: { type: "score", instructions: "x", criteria: Array(11).fill("level") },
  },
]) {
  test(`invalid decision declaration ${JSON.stringify(questions)}`, () => {
    assert.throws(
      () => defineDecision(JSON.parse(JSON.stringify({ questions }))),
      invalid,
    );
  });
}

test("decisions reject lossy states before requesting a model", async () => {
  let calls = 0;
  const provider: DecisionProvider = {
    name: "fixture",
    request: async () => {
      calls++;
      return response();
    },
  };
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  for (const state of [
    cycle,
    new Date(),
    { missing: undefined },
    { value: NaN },
    { value: -0 },
    [, "hole"],
    Object.defineProperty({}, "field", {
      get: () => "value",
      enumerable: true,
    }),
  ]) {
    await assert.rejects(
      decide({
        provider,
        model: "fixture",
        decision,
        state: state as DecisionState,
      }),
      invalid,
    );
  }
  assert.equal(calls, 0);
});

test("decision result validation rejects invalid distributions and primitives", async () => {
  const bodies = [
    { ...response(), answers: {} },
    { ...response(), answers: { ...response().answers, extra: {} } },
    {
      ...response(),
      answers: {
        ...response().answers,
        route: { ...response().answers.route, choice: "undeclared" },
      },
    },
    {
      ...response(),
      answers: {
        ...response().answers,
        route: {
          ...response().answers.route,
          probabilities: { fast: 0.1, deep: 0.9 },
        },
      },
    },
    {
      ...response(),
      answers: {
        ...response().answers,
        route: {
          ...response().answers.route,
          probabilities: { fast: 1, deep: 1 },
        },
      },
    },
    {
      ...response(),
      answers: {
        ...response().answers,
        route: { ...response().answers.route, confidence: 2 },
      },
    },
    {
      ...response(),
      answers: { ...response().answers, needed: { type: "noul", noul: -1 } },
    },
    {
      ...response(),
      answers: {
        ...response().answers,
        risk: { ...response().answers.risk, score: 0 },
      },
    },
    {
      ...response(),
      answers: {
        ...response().answers,
        risk: { ...response().answers.risk, legend: { "0": "Low" } },
      },
    },
    { ...response(), usage: { input: 1, cached: 2, output: 0 } },
    { ...response(), model: "" },
    { ...response(), truncated: "yes" },
  ];
  for (const body of bodies) {
    const provider: DecisionProvider = {
      name: "fixture",
      request: async () => JSON.parse(JSON.stringify(body)),
    };
    await assert.rejects(
      decide({ provider, model: "fixture", decision, state: "state" }),
      malformed,
    );
  }
});

test("truncated responses require explicit acceptance and missing usage stays incomplete", async () => {
  const provider: DecisionProvider = {
    name: "fixture",
    request: async () => ({ ...response(), truncated: true }),
  };
  await assert.rejects(
    decide({ provider, model: "fixture", decision, state: "state" }),
    (error: unknown) =>
      error instanceof OutpostError && error.details.truncated === true,
  );
  assert.equal(
    (
      await decide({
        provider,
        model: "fixture",
        decision,
        state: "state",
        allowTruncated: true,
      })
    ).truncated,
    true,
  );
  const { usage: _usage, ...without } = response();
  assert.equal(
    (
      await decide({
        provider: { name: "fixture", request: async () => without },
        model: "fixture",
        decision,
        state: "state",
      })
    ).usage.complete,
    false,
  );
});

test("normalized decision results cannot contain lossy legends, accessors or negative zero", async () => {
  const values = [
    { ...response(), usage: { input: 1, cached: -0, output: 0 } },
    {
      ...response(),
      answers: { ...response().answers, needed: { type: "noul", noul: -0 } },
    },
    {
      ...response(),
      answers: {
        ...response().answers,
        route: {
          ...response().answers.route,
          probabilities: { fast: 1, deep: -0 },
        },
      },
    },
    {
      ...response(),
      answers: {
        ...response().answers,
        risk: {
          ...response().answers.risk,
          score: -0,
          probabilities: { "0": 1 },
        },
      },
    },
    {
      ...response(),
      answers: {
        ...response().answers,
        risk: {
          ...response().answers.risk,
          legend: Object.assign(new Date(), {
            "0": "Low",
            "1": "Medium",
            "2": "High",
          }),
        },
      },
    },
    {
      ...response(),
      answers: {
        ...response().answers,
        route: Object.defineProperty(
          { ...response().answers.route },
          "confidence",
          { get: () => 0.8, enumerable: true },
        ),
      },
    },
  ];
  for (const value of values) {
    await assert.rejects(
      decide({
        provider: { name: "fixture", request: async () => value },
        model: "fixture",
        decision,
        state: "state",
      }),
      malformed,
    );
  }
});

test("routing rejects invalid mappings and validates every candidate before execution", () => {
  const provider: DecisionProvider = {
    name: "fixture",
    request: async () => response(),
  };
  const options = {
    provider,
    model: "fixture",
    decision,
    question: "route",
    models: { fast: "small", deep: "large" },
    fallback: "deep",
  };
  for (const change of [
    { question: "needed" },
    { models: { fast: "small" } },
    { fallback: "absent" },
    { minConfidence: NaN },
    { onError: "ignore" },
    { state: "state" },
  ]) {
    assert.throws(
      () =>
        defineHarnessModelRouting({ ...options, ...change } as Parameters<
          typeof defineHarnessModelRouting
        >[0]),
      invalid,
    );
  }
  const validated: string[] = [];
  const modelProvider: ModelProvider = {
    name: "fixture",
    request: async () => ({ text: "done" }),
    validate: (model) => {
      validated.push(model.name);
      if (model.name === "large") throw new Error("unsupported");
    },
  };
  assert.throws(
    () =>
      createHarness({
        modelProvider,
        routing: defineHarnessModelRouting({
          ...options,
          question: "route",
          fallback: "deep",
        }),
      }),
    /unsupported/,
  );
  assert.deepEqual(validated, ["small", "large"]);
});

test("System One provider rejects invalid connection settings", () => {
  for (const baseUrl of [
    "invalid",
    "file:///tmp/model",
    "https://key@example.test/v1",
    "https://example.test/v1?key=x",
    "https://example.test/v1?",
    "https://example.test/v1#x",
    "https://example.test/v1#",
  ])
    assert.throws(
      () => createSystemOneDecisionProvider({ baseUrl, apiKey: false }),
      invalid,
    );
  for (const apiKey of ["", "a\nb"])
    assert.throws(
      () =>
        createSystemOneDecisionProvider({
          baseUrl: "https://example.test/v1",
          apiKey,
        }),
      invalid,
    );
  assert.throws(
    () =>
      createSystemOneDecisionProvider({
        baseUrl: "https://example.test/v1",
        apiKey: false,
        timeoutMs: 0,
      }),
    invalid,
  );
});
