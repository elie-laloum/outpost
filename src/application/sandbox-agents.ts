import { observedOperation } from "../domain/observed-operation.ts";
import { invariant } from "../domain/errors.ts";
import { resolveVariables } from "../infrastructure/settings.ts";
import { prepareAdapter } from "./agent-bootstrap.ts";
import { createAgentSessions } from "./agent-sessions.ts";
import type {
  ProvisionedSandbox,
  SandboxAgents,
} from "./sandbox-session.types.ts";

export function sandboxAgents(context: ProvisionedSandbox): SandboxAgents {
  const { options, sandboxProvider, workspace, runtime, prepared, staging } =
    context;
  const sessions = createAgentSessions({
    lease: runtime,
    placement: sandboxProvider.placement,
    authentication: "warm",
    conversation: {
      repository: workspace.repository,
      staging,
      local: sandboxProvider.placement === "host",
      ...(options.conversationHome ? { home: options.conversationHome } : {}),
    },
    variables: (agent) =>
      resolveVariables(
        workspace.repository,
        agent.variables,
        sandboxProvider.variables,
      ),
    async adapter(agent, signal, observation) {
      if (!prepared.has(agent))
        prepared.set(
          agent,
          sandboxProvider.placement === "remote" && options.bootstrap !== false
            ? await observedOperation(
                observation,
                "sandbox",
                "agent.bootstrap",
                async () => prepareAdapter(agent, runtime, signal),
              )
            : agent,
        );
      return prepared.get(agent)!;
    },
  });
  return {
    selectAgent(selected, signal, observation = options.observation) {
      invariant(selected, "Provide an agent on the sandbox or this operation");
      return sessions.prepare(selected, signal, observation);
    },
    restore: sessions.restore,
    remember: sessions.remember,
    conversationContext: sessions.conversationContext,
  };
}
