import {
  scriptedAgent,
  createMemorySandboxProvider,
} from "../../src/testing.ts";
import type { ScriptedAgentOptions } from "../../src/testing.ts";
import type {
  TaskContext,
  LoopTaskContext,
  LoopCheckResult,
  DecisionProvider,
  WorkflowJson,
} from "../../src/index.ts";

export const visits: string[] = [];
export function transform(
  arguments_: WorkflowJson,
  context: TaskContext,
): WorkflowJson {
  visits.push("transform");
  context.reportUsage({ input: 2, output: 1, cached: 0 });
  return { original: arguments_, attempted: context.attempt };
}
export function attempt(
  context: LoopTaskContext,
  feedback: string | undefined,
) {
  visits.push(`attempt:${context.round}:${feedback ?? ""}`);
  context.reportUsage({ input: 1, output: 1, cached: 0 });
  return { round: context.round };
}
export function check(context: LoopTaskContext): LoopCheckResult {
  visits.push(`check:${context.round}`);
  return context.round >= 2
    ? { done: true }
    : { done: false, feedback: "Try again" };
}
export const decider: DecisionProvider = {
  name: "fixture",
  async request(request) {
    visits.push(`decision:${JSON.stringify(request.state)}`);
    return {
      model: request.model,
      answers: { approve: { type: "noul", noul: 0.9 } },
      usage: { input: 3, output: 1, cached: 0 },
    };
  },
};
export function agent(options: ScriptedAgentOptions) {
  return scriptedAgent(options);
}
export const memory = createMemorySandboxProvider();
