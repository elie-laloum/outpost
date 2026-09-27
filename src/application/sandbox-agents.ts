import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { Agent } from "../domain/agent.types.ts";
import type { Command } from "../domain/command.types.ts";
import { invariant } from "../domain/errors.ts";
import { resolveVariables } from "../infrastructure/settings.ts";
import { authenticateAgent } from "./agent-authentication.ts";
import { prepareAdapter } from "./agent-bootstrap.ts";
import { storageFor } from "./agent-storage.ts";
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
  ) => {
    invariant(selected, "Provide an agent on the sandbox or this operation");
    if (!prepared.has(selected))
      prepared.set(
        selected,
        sandboxProvider.placement === "remote" && options.bootstrap !== false
          ? await prepareAdapter(selected, runtime, signal)
          : selected,
      );
    const variables = await resolveVariables(
      workspace.repository,
      selected.variables,
      sandboxProvider.variables,
    );
    const adapter = prepared.get(selected)!;
    if (
      adapter.kind === "cli" &&
      authenticated.get(adapter.name)?.adapter !== adapter
    )
      authenticated.set(adapter.name, {
        adapter,
        variables: await authenticateAgent(
          adapter,
          variables,
          runtime,
          sandboxProvider.placement,
          signal,
        ),
      });
    const credentials =
      adapter.kind === "cli" ? authenticated.get(adapter.name)?.variables : {};
    return {
      selected,
      adapter,
      executionLease: {
        ...runtime,
        invoke(command: Command) {
          return runtime.invoke({
            ...command,
            variables: { ...variables, ...credentials, ...command.variables },
          });
        },
      },
    };
  };
  const conversationKey = (agent: Agent, id: string) =>
    `${agent.storage?.name ?? agent.conversations ?? agent.name}:${id}`;
  const restore = async (
    id: string,
    agent: Agent,
    executionLease: SandboxLease,
  ) => {
    if (known.has(conversationKey(agent, id))) return;
    const storage = storageFor(agent);
    invariant(storage, "This adapter does not support native conversations");
    const found = await storage.locate(
      id,
      workspace.repository,
      options.conversationHome,
    );
    await storage.restore(found, {
      repository: workspace.repository,
      sandbox: executionLease,
      staging,
      local: sandboxProvider.placement === "host",
    });
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
