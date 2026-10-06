import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import { once } from "node:events";
import {
  decide,
  defineDecision,
  createSystemOneDecisionProvider,
  OutpostError,
  quotaFault,
  unavailableFault,
  createObservationHub,
} from "../../src/index.ts";
import type { Observation } from "../../src/index.ts";

test("System One accepts Laya's rounded score response without normalizing it", async (t) => {
  const payload = {
    model: "laya-rl-agent",
    answers: {
      difficulty: {
        type: "score",
        score: 0.8136,
        probabilities: { "0": 0.3396, "1": 0.5073, "2": 0.1532 },
        confidence: 0.0912,
        answer_confidence: 0.5073,
        legend: { "0": "Routine", "1": "Moderate", "2": "Complex" },
      },
    },
    usage: { input_tokens: 193, output_tokens: 0, truncated: false },
    routing: { model: "english" },
  };
  const server = createServer((_request, response) => {
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(payload));
  });
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const result = await decide({
    provider: createSystemOneDecisionProvider({
      baseUrl: `http://127.0.0.1:${address.port}/v1`,
      apiKey: false,
    }),
    model: "english",
    decision: defineDecision({
      questions: {
        difficulty: {
          type: "score",
          instructions: "Assess difficulty",
          criteria: ["Routine", "Moderate", "Complex"],
        },
      },
    }),
    state: "Fix a documentation typo",
  });
  assert.deepEqual(
    result.answers.difficulty.probabilities,
    payload.answers.difficulty.probabilities,
  );
  assert.equal(
    result.answers.difficulty.score,
    payload.answers.difficulty.score,
  );
  assert.equal(
    result.answers.difficulty.confidence,
    payload.answers.difficulty.confidence,
  );
  assert.deepEqual(result.metadata, payload);
  assert.deepEqual(result.usage, { input: 193, cached: 0, output: 0 });
});

test("System One HTTP provider uses the common Jev/Laya wire contract and bounds failures", async (t) => {
  const requests: {
    path: string | undefined;
    auth: string | undefined;
    body: unknown;
  }[] = [];
  let mode = "ok";
  const payload = {
    model: "actual-checkpoint",
    answers: {
      route: {
        type: "choice",
        choice: "fast",
        probabilities: { fast: 0.95, deep: 0.05 },
        confidence: 0.9,
        action: "accept",
      },
      risk: {
        type: "score",
        score: 1,
        probabilities: { "1": 1 },
        confidence: 1,
        legend: { "0": "Low", "1": "High" },
      },
      flag: { type: "noul", noul: 0.8, confidence: 0.6 },
    },
    usage: {
      input_tokens: 12,
      output_tokens: 3,
      truncated: false,
      state_tokens_dropped: 0,
    },
    routing: { model: "multilingual" },
  };
  const server = createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    requests.push({
      path: request.url,
      auth: request.headers.authorization,
      body: JSON.parse(body),
    });
    if (mode === "hang") return;
    if (mode === "partial") {
      response.write('{"model":');
      return;
    }
    if (mode === "disconnect") {
      response.destroy();
      return;
    }
    if (mode === "redirect") {
      response.writeHead(307, { Location: "/stolen" });
      response.end();
      return;
    }
    if (mode === "bad") {
      response.end("not-json secret-key");
      return;
    }
    if (/^\d+$/.test(mode)) {
      response.writeHead(Number(mode), { "Retry-After": "2" });
      response.end("secret-key sensitive state");
      return;
    }
    response.end(
      JSON.stringify({
        ...payload,
        ...(mode === "truncated"
          ? { usage: { ...payload.usage, truncated: true } }
          : {}),
        ...(mode === "conflicting" ? { truncated: true } : {}),
        ...(mode === "invalid-answer" ? { answers: {} } : {}),
        ...(mode === "invalid-usage"
          ? { usage: { input_tokens: -1, output_tokens: 0 } }
          : {}),
        ...(mode === "missing-usage" ? { usage: undefined } : {}),
      }),
    );
  });
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const baseUrl = `http://127.0.0.1:${address.port}/prefix/v1/`;
  const provider = createSystemOneDecisionProvider({
    baseUrl,
    apiKey: "secret-key",
    timeoutMs: 200,
  });
  const decision = defineDecision({
    questions: {
      route: {
        type: "choice",
        instructions: "Route",
        criteria: { fast: "Simple", deep: "Complex" },
      },
      risk: { type: "score", instructions: "Rate", criteria: ["Low", "High"] },
      flag: { type: "noul", instructions: "True?" },
    },
  });
  const observations: Observation[] = [];
  const observation = createObservationHub({
    sinks: [
      {
        observe: (event) => {
          observations.push(event);
          throw new Error("sink down");
        },
      },
    ],
  });
  const options = {
    provider,
    model: "requested-model",
    decision,
    state: { request: "Bonjour" },
    observation,
  };
  const result = await decide(options);
  assert.deepEqual(requests[0], {
    path: "/prefix/v1/systemone",
    auth: "Bearer secret-key",
    body: {
      model: options.model,
      state: options.state,
      questions: decision.questions,
    },
  });
  assert.equal(result.model, "actual-checkpoint");
  assert.deepEqual(result.usage, { input: 12, cached: 0, output: 3 });
  assert.deepEqual(result.metadata, payload);
  assert.equal(result.answers.flag.noul, 0.8);
  assert.equal(
    observations.some((event) => event.event.kind === "decision-request"),
    false,
  );
  assert.ok(observation.errors.length);
  const anonymous = createSystemOneDecisionProvider({ baseUrl, apiKey: false });
  await decide({ ...options, provider: anonymous });
  assert.equal(requests.at(-1)?.auth, undefined);
  const verbose = createObservationHub({
    verbose: true,
    sinks: [
      {
        observe: (event) => {
          observations.push(event);
        },
      },
    ],
  });
  await decide({ ...options, observation: verbose });
  assert.ok(
    observations.some((event) => event.event.kind === "decision-request"),
  );
  assert.ok(
    observations.some((event) => event.event.kind === "decision-response"),
  );
  for (const status of [401, 422, 429, 503, 529]) {
    mode = String(status);
    const before = requests.length;
    await assert.rejects(decide(options), (error: unknown) => {
      assert.ok(error instanceof OutpostError);
      assert.equal(error.message.includes("secret-key"), false);
      assert.equal(error.details.status, status);
      assert.equal(Boolean(quotaFault(error)), status === 429);
      assert.equal(Boolean(unavailableFault(error)), status >= 500);
      return true;
    });
    assert.equal(requests.length, before + 1);
  }
  mode = "bad";
  await assert.rejects(
    decide(options),
    (error: unknown) =>
      error instanceof OutpostError && error.code === "response",
  );
  for (const next of ["invalid-answer", "invalid-usage", "conflicting"]) {
    mode = next;
    await assert.rejects(
      decide(options),
      (error: unknown) =>
        error instanceof OutpostError && error.code === "response",
    );
  }
  mode = "missing-usage";
  const incomplete = await decide(options);
  assert.equal(incomplete.usage.complete, false);
  assert.equal("truncated" in incomplete, false);
  mode = "truncated";
  await assert.rejects(
    decide(options),
    (error: unknown) =>
      error instanceof OutpostError && error.details.truncated === true,
  );
  assert.equal(
    (await decide({ ...options, allowTruncated: true })).truncated,
    true,
  );
  mode = "ok";
  await assert.rejects(
    decide({
      ...options,
      provider: createSystemOneDecisionProvider({
        baseUrl,
        apiKey: false,
        maxResponseBytes: 10,
      }),
    }),
    /maxResponseBytes/,
  );
  for (const next of ["hang", "partial"]) {
    mode = next;
    await assert.rejects(
      decide(options),
      (error: unknown) =>
        error instanceof OutpostError && error.code === "timeout",
    );
  }
  for (const next of ["disconnect", "redirect"]) {
    mode = next;
    await assert.rejects(decide(options), (error: unknown) =>
      Boolean(unavailableFault(error)),
    );
  }
  mode = "hang";
  const signal = AbortSignal.timeout(20);
  await assert.rejects(
    decide({ ...options, signal }),
    (error: unknown) =>
      error instanceof OutpostError && error.code === "aborted",
  );
  const controller = new AbortController();
  controller.abort();
  const before = requests.length;
  await assert.rejects(decide({ ...options, signal: controller.signal }));
  assert.equal(requests.length, before);
  await observation.close();
  await verbose.close();
});
