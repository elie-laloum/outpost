// Retries and delays — capped exponential backoff, full jitter, HTTP Retry-After
// respected as a minimum wait, and a deadline for the whole workflow.

import {
  createOpenAIModelProvider,
  defineTask,
  defineWorkflow,
  OutpostError,
  type Retry,
  type WorkflowEvent,
} from "@elie-laloum/outpost";
import { model } from "../shared/model.ts";
import { flakyProxy } from "./flaky-proxy.ts";

// Prints the delay chosen before each new attempt.
const observe = (event: WorkflowEvent) => {
  if (event.type === "retry")
    console.log(
      `  ↻ ${event.key} : tentative ${event.attempt} ratée, nouvel essai dans ${event.delayMs} ms`,
    );
};

// A task that fails a given number of times before succeeding.
function flaky(key: string, failures: number, retry: Retry) {
  return defineTask({
    key,
    retry,
    perform: (context) => {
      if (context.attempt <= failures)
        throw new Error(`échec n°${context.attempt}`);
      return `réussi à la tentative ${context.attempt}`;
    },
  });
}

// 1. Exponential backoff: 200, 400, 800 ms… capped at 1 s.
console.log("1. backoff exponentiel plafonné");

const exponential = flaky("exponential", 4, {
  attempts: 5,
  delayMs: 200,
  backoff: "exponential",
  maxDelayMs: 1_000,
});

(await defineWorkflow("backoff", [exponential]).start({ observe })).unwrap();

// 2. Same policy with full jitter: each delay is drawn between 0 and that ceiling,
//    so a crowd of clients don't all come back at the same moment.
console.log("\n2. avec aléa complet (jitter)");

const jittered = flaky("jittered", 4, {
  attempts: 5,
  delayMs: 200,
  backoff: "exponential",
  maxDelayMs: 1_000,
  jitter: "full",
});

(await defineWorkflow("jitter", [jittered]).start({ observe })).unwrap();

// 3. A rate-limited model: the service answers 429 with "Retry-After: 2".
//    Outpost waits at least those 2 s, even above maxDelayMs, and never less.
//    A 429 has code "quota" (not "provider"): see demo 39 to pause instead of retrying.
console.log("\n3. modèle limité en débit (429 + Retry-After)");

const proxy = await flakyProxy(process.env.OPENAPI_URL!, 2, 2);
const limitedProvider = createOpenAIModelProvider({
  baseUrl: proxy.url,
  apiKey: process.env.OPENAPI_KEY!,
});

const ask = defineTask({
  key: "ask",
  retry: {
    attempts: 4,
    delayMs: 100,
    backoff: "exponential",
    maxDelayMs: 500,
    jitter: "full",
    // Only retry what makes sense to retry: rate limits and unavailability.
    accepts: (error) => {
      if (!(error instanceof OutpostError)) return false;
      console.log(
        `  ✗ ${error.code} · HTTP ${error.details.status}, Retry-After → ${error.details.retryAfterMs} ms`,
      );
      return [429, 503].includes(Number(error.details.status));
    },
  },
  perform: async ({ signal }) => {
    const answer = await limitedProvider.request({
      model: model.name,
      reasoning: model.reasoning,
      prompt: "Give one tip to write a good retry policy, in one sentence.",
      signal,
    });
    return answer.text.trim();
  },
});

try {
  const result = await defineWorkflow("rate-limited", [ask]).start({ observe });
  result.unwrap();
  console.log("  →", result.value(ask));
} finally {
  await proxy.close();
}

// 4. A deadline for the whole workflow: it covers every attempt and every wait.
//    When it expires, active tasks are cancelled through their signal.
console.log("\n4. délai global du workflow");

const hopeless = flaky("hopeless", Infinity, { attempts: 10, delayMs: 1_000 });
const bounded = await defineWorkflow("deadline", [hopeless]).start({
  observe,
  timeoutMs: 2_500,
});

const [error] = bounded.errors;
console.log("  statut :", bounded.status);
console.log("  erreur :", error instanceof OutpostError ? error.code : error);
console.log("  tentatives :", bounded.tasks[0]?.attempts);
