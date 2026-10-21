import { invariant } from "../domain/errors.ts";
import { observedOperation } from "../domain/observed-operation.ts";
import { createAgentConversationIndex } from "./agent-conversation-index.ts";
import { configureAgent } from "./agent-configuration.ts";
import { restoreConversation } from "./agent-conversations.ts";
import { prepareAgentExecution } from "./agent-preparation.ts";
import { storageFor } from "./agent-storage.ts";
import type {
  AgentSessionEnvironment,
  AgentSessions,
  AuthenticatedAgent,
} from "./agent-sessions.types.ts";

/** Prepares agents on one lease and configures CLI adapters through their authenticated lease. */
export function createAgentSessions(
  environment: AgentSessionEnvironment,
): AgentSessions {
  const { lease, placement } = environment;
  const known = createAgentConversationIndex();
  const authenticated = new Map<string, AuthenticatedAgent>();
  const sessions: AgentSessions = {
    async prepare(selected, signal, observation) {
      const adapter =
        (await environment.adapter?.(selected, signal, observation)) ??
        selected;
      const variables = await environment.variables(selected);
      const cached =
        environment.authentication === "warm"
          ? authenticated.get(adapter.name)
          : undefined;
      const { credentials, executionLease } = await prepareAgentExecution({
        agent: adapter,
        lease,
        placement,
        variables,
        signal,
        ...(observation ? { observation } : {}),
        ...(adapter.kind === "cli" && cached?.adapter === adapter
          ? { credentials: cached.variables }
          : {}),
      });
      if (adapter.kind === "cli" && cached?.adapter !== adapter) {
        if (adapter.configuration)
          await observedOperation(
            observation,
            "sandbox",
            "agent.configure",
            async () =>
              configureAgent(
                adapter,
                variables,
                executionLease,
                placement,
                signal,
              ),
          );
        authenticated.set(adapter.name, { adapter, variables: credentials });
      }
      return { selected, adapter, executionLease };
    },
    async restore(id, agent, executionLease) {
      if (known.has(agent, id)) return;
      const storage = storageFor(agent);
      invariant(storage, "This adapter does not support native conversations");
      const context = sessions.conversationContext(executionLease);
      await restoreConversation(storage, id, context);
      known.remember(agent, id);
    },
    remember(agent, id) {
      known.remember(agent, id);
    },
    conversationContext(executionLease) {
      return { ...environment.conversation, sandbox: executionLease };
    },
  };
  return sessions;
}
