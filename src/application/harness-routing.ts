import { OutpostError } from "../domain/errors.ts";
import { unavailableFault } from "../domain/unavailable.ts";
import type { AgentModel, ModelToolSpec } from "../domain/model.types.ts";
import type { DecisionState } from "../domain/decision.types.ts";
import type { ModelRouteEvent } from "../domain/harness-routing.types.ts";
import type { HarnessHistory, HarnessRuntime } from "./harness.types.ts";
import { executeDecision } from "./decision.ts";
import { checkpointValue } from "../domain/workflow/checkpoint-value.ts";
import { invariant } from "../domain/errors.ts";
import type { HarnessModelRoutingContext } from "../domain/harness-routing.types.ts";

function routingState(context: HarnessModelRoutingContext): DecisionState {
  const state = checkpointValue({
    system: context.system,
    step: context.step,
    model: context.model,
    tools: context.tools,
    messages: context.messages.map((message) => ({
      role: message.role,
      content: message.content.filter((block) => block.type !== "reasoning"),
    })),
  });
  invariant(
    state.kind === "json" &&
      state.value !== null &&
      typeof state.value === "object",
    "Routing state must be a JSON object",
  );
  return state.value;
}

export async function routeHarnessModel(
  runtime: HarnessRuntime,
  history: HarnessHistory,
  system: string,
  tools: readonly ModelToolSpec[],
  step: number,
): Promise<AgentModel> {
  const routing = runtime.agent.harness.routing;
  if (!routing) return runtime.agent.model;
  const context = {
    system,
    tools,
    messages: history.messages,
    step,
    model: runtime.agent.model,
    signal: runtime.signal,
  };
  const state = routing.state
    ? await routing.state(context)
    : routingState(context);
  runtime.signal.throwIfAborted();
  runtime.budget.check();
  let choice = routing.fallback;
  let reason: ModelRouteEvent["reason"] = "unavailable";
  let confidence: number | undefined;
  try {
    const result = await runtime.modelScope.track(
      executeDecision(
        {
          provider: routing.provider,
          model: routing.model,
          decision: routing.decision,
          state,
          signal: runtime.signal,
          ...(runtime.observation ? { observation: runtime.observation } : {}),
        },
        {
          account(usage) {
            const receipt = { text: "", usage };
            runtime.modelScope.account(receipt, runtime.subagentId);
            runtime.budget.account(receipt);
          },
        },
      ),
    );
    const answer = result.answers[routing.question];
    if (!answer || answer.type !== "choice")
      throw new OutpostError(
        "response",
        "Routing response must contain a choice",
      );
    confidence = answer.confidence;
    reason = confidence < routing.minConfidence ? "confidence" : "selected";
    choice = reason === "confidence" ? routing.fallback : answer.choice;
  } catch (error) {
    runtime.signal.throwIfAborted();
    const recoverable =
      error instanceof OutpostError &&
      (error.code === "timeout" ||
        (error.code === "provider" && unavailableFault(error) !== undefined));
    if (routing.onError === "fail" || !recoverable) throw error;
  }
  runtime.budget.check();
  const model = routing.models[choice];
  if (!model)
    throw new OutpostError("response", "Routing selected an undeclared model");
  const event: ModelRouteEvent = {
    kind: "model-route",
    step,
    choice,
    model,
    reason,
    ...(confidence === undefined ? {} : { confidence }),
  };
  await history.recordRoute?.(event);
  runtime.emit(event);
  return model;
}
