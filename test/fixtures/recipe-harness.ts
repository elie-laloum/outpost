import { OutpostError } from "../../src/index.ts";
import type {
  HarnessHookInput,
  HarnessToolContext,
  ModelProvider,
  ModelRequest,
  ModelResult,
  Observation,
} from "../../src/index.ts";
import type { DecisionProvider } from "../../src/index.ts";

export const requests: ModelRequest[] = [];
export const observations: Observation[] = [];
export const sink = {
  observe(event: Observation) {
    observations.push(event);
  },
};
export const router: DecisionProvider = {
  name: "router",
  async request(request) {
    return {
      model: request.model,
      answers: {
        route: {
          type: "choice",
          choice: "fast",
          confidence: 1,
          probabilities: { fast: 1, deep: 0 },
        },
      },
      usage: { input: 2, cached: 0, output: 1 },
    };
  },
};
export function hook(_input: HarnessHookInput<"session-start">) {
  return { instructions: "Hook instructions" };
}
export async function execute(_input: unknown, context: HarnessToolContext) {
  const result = await context.sandbox.invoke({
    executable: process.execPath,
    arguments: [
      "-e",
      "console.log(require('fs').readFileSync('initial', 'utf8'))",
    ],
  });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout;
}

export function model(): ModelProvider {
  let parent = 0,
    child = 0;
  const usage = { input: 3, cached: 0, output: 2 };
  const call = (name: string, input: unknown): ModelResult => ({
    text: "",
    stopReason: "tool-calls",
    content: [
      { type: "tool-call", id: `call-${parent}-${child}`, name, input },
    ],
    usage,
  });
  return {
    name: "fixture",
    async request(request) {
      requests.push(request);
      if (request.model === "unavailable")
        throw new OutpostError("provider", "Fixture unavailable", {
          unavailable: "Fixture unavailable",
        });
      if (request.model === "child") {
        child++;
        if (child === 1) return call("read_fixture", {});
        return { text: "Child inspected the fixture", usage };
      }
      parent++;
      if (parent === 1)
        return call("delegate", { prompt: "Inspect the fixture" });
      return { text: '<answer>{"ok":true}</answer>', usage };
    },
  };
}
