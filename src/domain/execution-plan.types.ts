import type { Agent, AgentFeatures } from "./agent.types.ts";
import type { FileWorkspaceBinding, SandboxProvider } from "./sandbox.types.ts";

/** A file workspace feature an agent must have demonstrated before Outpost runs it there. */
export type FileAgentCapability = keyof NonNullable<
  AgentFeatures["fileWorkspaces"]
>;

/** One capability the execution needs: a workspace binding from the sandbox, or a feature from an agent. */
export type ExecutionRequirement =
  | { readonly kind: "binding"; readonly binding: FileWorkspaceBinding }
  | {
      readonly kind: "agent";
      readonly agent: string;
      readonly capability: FileAgentCapability;
    };

/** An incompatibility found before allocation; execution refuses it with the same message. */
export interface ExecutionDiagnostic {
  readonly code: string;
  readonly message: string;
}

/** What an execution needs and what its sandbox and agents offer, known without allocating. */
export interface ExecutionPlan {
  readonly workspace: {
    readonly kind: "git" | "directory" | "ephemeral";
    readonly binding?: FileWorkspaceBinding;
  };
  readonly sandbox: {
    readonly provider: string;
    readonly placement: SandboxProvider["placement"];
    readonly bindings: readonly FileWorkspaceBinding[];
  };
  readonly agents: readonly {
    readonly name: string;
    readonly kind: Agent["kind"];
    readonly fileWorkspaces?: AgentFeatures["fileWorkspaces"];
  }[];
  readonly requirements: readonly ExecutionRequirement[];
  readonly diagnostics: readonly ExecutionDiagnostic[];
}
