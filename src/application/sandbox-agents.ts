import type { SandboxLease } from "../domain/sandbox.types.ts";
import { observedOperation } from "../domain/observed-operation.ts";
import type { Agent } from "../domain/agent.types.ts";
import { invariant } from "../domain/errors.ts";
import { resolveVariables } from "../infrastructure/settings.ts";
import { prepareAgentExecution } from "./agent-preparation.ts";
import { configureAgent } from "./agent-configuration.ts";
import { prepareAdapter } from "./agent-bootstrap.ts";
import { storageFor } from "./agent-storage.ts";
import { restoreConversation } from "./agent-conversations.ts";
import type {
  AuthenticatedAgent,
  ProvisionedSandbox,
  SandboxAgents,
} from "./sandbox-session.types.ts";

export function sandboxAgents(context: ProvisionedSandbox): SandboxAgents {
  const { options, sandboxProvider, workspace, runtime, prepared, staging } =
    context;
  const known = new Set<string>();
  const authenticated = new Map<string, AuthenticatedAgent>();
  const selectAgent = async (
    selected: Agent | undefined,
    signal: AbortSignal,
    observation = options.observation,
  ) => {
    invariant(selected, "Provide an agent on the sandbox or this operation");
    if (!prepared.has(selected))
      prepared.set(
        selected,
        sandboxProvider.placement === "remote" && options.bootstrap !== false
          ? await observedOperation(
              observation,
              "sandbox",
              "agent.bootstrap",
              async () => prepareAdapter(selected, runtime, signal),
            )
          : selected,
      );
    const variables = await resolveVariables(
      workspace.repository,
      selected.variables,
      sandboxProvider.variables,
    );
    const adapter = prepared.get(selected)!;
    const cached = authenticated.get(adapter.name);
    const { credentials, executionLease } = await prepareAgentExecution({
      agent: adapter,
      lease: runtime,
      placement: sandboxProvider.placement,
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
              runtime,
              sandboxProvider.placement,
              signal,
            ),
        );
      authenticated.set(adapter.name, { adapter, variables: credentials });
    }
    return {
      selected,
      adapter,
      executionLease,
    };
  };
  const conversationKey = (agent: Agent, id: string) =>
    `${agent.storage?.name ?? agent.name}:${id}`;
  const restore = async (
    id: string,
    agent: Agent,
    executionLease: SandboxLease,
  ) => {
    if (known.has(conversationKey(agent, id))) return;
    const storage = storageFor(agent);
    invariant(storage, "This adapter does not support native conversations");
    await restoreConversation(
      storage,
      id,
      {
        repository: workspace.repository,
        sandbox: executionLease,
        staging,
        local: sandboxProvider.placement === "host",
      },
      options.conversationHome,
    );
    known.add(conversationKey(agent, id));
  };

  return {
    selectAgent,
    restore,
    remember: (agent, id) => {
      known.add(conversationKey(agent, id));
    },
  };
}
