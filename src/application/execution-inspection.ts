import type { Agent } from "../domain/agent.types.ts";
import type {
  ExecutionPlan,
  ExecutionRequirement,
  FileAgentCapability,
} from "../domain/execution-plan.types.ts";
import { dispatchCandidates } from "../domain/fallback-agent.ts";
import { fileAgentDiagnostics } from "../domain/file-agent-capabilities.ts";
import { fileWorkspaceBinding } from "../domain/file-workspace-binding.ts";
import { nativeSandboxCapabilities } from "../providers/sandbox-capabilities.ts";
import type { ExecutionInspectionSettings } from "./execution-inspection.types.ts";
import { isFileSandboxOptions } from "./file-sandbox-options.ts";
import type { FileSandboxOptions } from "./file-sandbox.types.ts";
import type { SandboxOptions } from "./outpost.types.ts";

/** File workspace capabilities an agent needs for one dispatch with these settings. */
export function fileDispatchRequirements(
  agent: Agent,
  settings: ExecutionInspectionSettings = {},
): FileAgentCapability[] {
  return [
    "dispatch",
    ...(settings.continuation ? (["continuation"] as const) : []),
    ...(settings.response?.repairs ? (["repairs"] as const) : []),
    ...(settings.steering && agent.kind === "cli" && agent.liveInput
      ? (["liveInput"] as const)
      : []),
  ];
}

/** Plans an execution without allocating; sandbox creation and dispatch refuse its diagnostics. */
export function inspectExecution(
  options: SandboxOptions | FileSandboxOptions,
  settings: ExecutionInspectionSettings = {},
): ExecutionPlan {
  const selected = settings.agent ?? options.agent;
  const candidates = selected ? dispatchCandidates(selected) : [];
  const agents = candidates.map((agent) => ({
    name: agent.name,
    kind: agent.kind,
    ...(agent.kind === "cli" && agent.fileWorkspaces
      ? { fileWorkspaces: agent.fileWorkspaces }
      : {}),
  }));
  if (!isFileSandboxOptions(options)) {
    const provider = options.sandboxProvider;
    const defaults = nativeSandboxCapabilities("docker", {})!;
    return {
      workspace: { kind: "git" },
      sandbox: {
        provider: provider?.name ?? "docker",
        placement: provider?.placement ?? defaults.placement,
        bindings: provider ? (provider.workspaces?.bindings ?? []) : [],
      },
      agents,
      requirements: [],
      diagnostics: [],
    };
  }
  const provider = options.sandboxProvider;
  const bindings = provider.workspaces?.bindings ?? [];
  const source = options.workspace?.source ?? options.workspaceSource;
  const binding = source && fileWorkspaceBinding(source);
  const requirements: ExecutionRequirement[] = [
    ...(binding ? [{ kind: "binding", binding } as const] : []),
    ...candidates.flatMap((agent) =>
      fileDispatchRequirements(agent, settings).map((capability) => ({
        kind: "agent" as const,
        agent: agent.name,
        capability,
      })),
    ),
  ];
  return {
    workspace: {
      kind: source?.kind ?? "ephemeral",
      ...(binding ? { binding } : {}),
    },
    sandbox: {
      provider: provider.name,
      placement: provider.placement,
      bindings,
    },
    agents,
    requirements,
    diagnostics: [
      ...(provider.workspaces
        ? []
        : [
            {
              code: "unsupported-provider",
              message: "Sandbox provider does not support file workspaces",
            },
          ]),
      ...(source
        ? []
        : [
            {
              code: "missing-source",
              message: "Provide a file workspace source",
            },
          ]),
      ...(binding && provider.workspaces && !bindings.includes(binding)
        ? [
            {
              code: "unsupported-binding",
              message: `Sandbox provider does not support ${binding} workspaces`,
            },
          ]
        : []),
      ...candidates.flatMap((agent) =>
        fileAgentDiagnostics(agent, fileDispatchRequirements(agent, settings)),
      ),
    ],
  };
}
