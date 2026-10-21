import { observedOperation } from "../domain/observed-operation.ts";
import { authenticateAgent } from "./agent-authentication.ts";
import type {
  AgentPreparation,
  PreparedAgentExecution,
} from "./agent-preparation.types.ts";

export async function prepareAgentExecution({
  agent,
  lease,
  placement,
  variables,
  signal,
  observation,
  credentials: cached,
}: AgentPreparation): Promise<PreparedAgentExecution> {
  let credentials = cached ?? {};
  if (agent.kind === "cli" && cached === undefined)
    credentials = await observedOperation(
      observation,
      "sandbox",
      "agent.authenticate",
      () => authenticateAgent(agent, variables, lease, placement, signal),
    );
  return {
    credentials,
    executionLease: {
      ...lease,
      invoke(command) {
        return lease.invoke({
          ...command,
          variables: { ...variables, ...credentials, ...command.variables },
        });
      },
    },
  };
}
