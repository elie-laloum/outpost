import { agentModel } from "./agent-model.ts";
import { invariant } from "./errors.ts";
import type {
  Agent,
  AgentOptions,
  CliAgentOptions,
  CustomAgentOptions,
  CliAgent,
  CustomAgent,
} from "./agent.types.ts";

export function agent(options: CliAgentOptions): CliAgent;
export function agent(options: CustomAgentOptions): CustomAgent;
export function agent(options: AgentOptions): Agent;
export function agent(options: AgentOptions): Agent {
  invariant(
    options && typeof options === "object",
    "Agent options must be an object",
  );
  const { harness } = options;
  invariant(
    harness && (harness.kind === "cli" || harness.kind === "custom"),
    "Provide a supported harness",
  );
  const model =
    options.model === undefined ? undefined : agentModel(options.model);
  if (harness.kind === "cli") {
    invariant(
      typeof harness.bind === "function",
      "CLI harness requires a binding",
    );
    return Object.freeze({
      ...harness.bind(model),
      kind: "cli",
      harness,
      ...(model === undefined ? {} : { model }),
    });
  }
  invariant(model, "Custom harness requires a model name");
  invariant(
    typeof harness.modelProvider?.request === "function" &&
      Array.isArray(harness.tools),
    "Create custom harnesses with harness()",
  );
  harness.modelProvider.validate?.(model);
  const persisted = harness.conversations !== false;
  return Object.freeze({
    kind: "custom",
    name: "custom",
    harness,
    model,
    capture: persisted,
    resumable: persisted,
    ...(harness.conversations ? { storage: harness.conversations } : {}),
  });
}
