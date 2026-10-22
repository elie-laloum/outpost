import type { Agent, AgentFeatures } from "./agent.types.ts";
import type {
  ExecutionDiagnostic,
  FileAgentCapability,
} from "./execution-plan.types.ts";
import { fileAgentCapabilityRefusals } from "./file-agent-capabilities.constants.ts";

/** Refuses each required capability a CLI agent has not declared for file workspaces. */
export function fileCapabilityDiagnostics(
  name: string,
  declared: AgentFeatures["fileWorkspaces"],
  required: readonly FileAgentCapability[],
): ExecutionDiagnostic[] {
  return required
    .filter((capability) => !declared?.[capability])
    .map((capability) => ({
      code: "unsupported-capability",
      message:
        capability === "dispatch"
          ? `${name} has not declared validated support for file workspaces`
          : fileAgentCapabilityRefusals[capability],
    }));
}

/** Everything that keeps an agent out of a file workspace for the given capabilities. */
export function fileAgentDiagnostics(
  agent: Agent,
  required: readonly FileAgentCapability[],
): ExecutionDiagnostic[] {
  switch (agent.kind) {
    case "custom":
      return agent.harness.tools.some((tool) => tool.workspace === "git")
        ? [
            {
              code: "git-workspace-only",
              message:
                "Git harness tools cannot run in file workspaces; select filesystem tools explicitly",
            },
          ]
        : [];
    case "replay":
      return agent.turns.some((turn) => turn.changes)
        ? [
            {
              code: "git-workspace-only",
              message: "Git replay effects cannot run in file workspaces",
            },
          ]
        : [];
    case "cli":
      return fileCapabilityDiagnostics(
        agent.name,
        agent.fileWorkspaces,
        required,
      );
  }
}
