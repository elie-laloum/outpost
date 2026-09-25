import { requireSuccess } from "../infrastructure/process.ts";
import type { Agent } from "../domain/agent.types.ts";
import type { Command } from "../domain/command.types.ts";
import { invariant } from "../domain/errors.ts";
import { resolveVariables } from "../infrastructure/settings.ts";
import { prepareAdapter } from "./agent-bootstrap.ts";
import { storageFor } from "./agent-storage.ts";
import type {
  ProvisionedSandbox,
  SandboxAgents,
} from "./sandbox-session.types.ts";

export function sandboxAgents(context: ProvisionedSandbox): SandboxAgents {
  const { options, sandboxProvider, workspace, runtime, prepared, staging } =
    context;
  const known = new Set<string>();
  const authenticated = new Map<string, Agent>();
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
    if (adapter.kind === "cli" && authenticated.get(adapter.name) !== adapter) {
      const command = adapter.authenticate?.(variables);
      if (command)
        await requireSuccess(
          { ...command, variables, signal },
          runtime.invoke.bind(runtime),
        );
      authenticated.set(adapter.name, adapter);
    }
    return {
      selected,
      adapter,
      executionLease: {
        ...runtime,
        invoke(command: Command) {
          return runtime.invoke({
            ...command,
            variables: { ...variables, ...command.variables },
          });
        },
      },
    };
  };
  const conversationKey = (agent: Agent, id: string) =>
    `${agent.storage?.name ?? agent.conversations ?? agent.name}:${id}`;
  const restore = async (id: string, agent: Agent) => {
    if (known.has(conversationKey(agent, id))) return;
    const storage = storageFor(agent);
    invariant(storage, "This adapter does not support native conversations");
    const found = await storage.locate(
      id,
      workspace.repository,
      options.conversationHome,
    );
    if (
      found.reference !== undefined ||
      sandboxProvider.placement !== "host" ||
      workspace.directory !== workspace.repository
    )
      await storage.restore(found, {
        repository: workspace.repository,
        sandbox: runtime,
        staging,
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
