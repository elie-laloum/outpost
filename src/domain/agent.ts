import { agentModel } from "./agent-model.ts";
import { invariant } from "./errors.ts";
import type {
  Agent,
  AgentOptions,
  CliAgentOptions,
  CustomAgentOptions,
  CliAgent,
  CustomAgent,
  CustomHarness,
  CustomHarnessOptions,
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
    typeof harness.run === "function" &&
      typeof harness.modelProvider?.request === "function",
    "Custom harness requires a model provider and run function",
  );
  harness.modelProvider.validate?.(model);
  return Object.freeze({
    kind: "custom",
    name: "custom",
    harness,
    model,
    capture: false,
    resumable: false,
  });
}

export function harness(options: CustomHarnessOptions): CustomHarness {
  invariant(
    options && typeof options.run === "function",
    "Custom harness requires a run function",
  );
  invariant(
    typeof options.modelProvider?.request === "function",
    "Custom harness requires a model provider",
  );
  invariant(
    options.modelProvider.validate === undefined ||
      typeof options.modelProvider.validate === "function",
    "Model provider validate must be a function",
  );
  return Object.freeze({
    kind: "custom",
    modelProvider: options.modelProvider,
    run: options.run,
  });
}
