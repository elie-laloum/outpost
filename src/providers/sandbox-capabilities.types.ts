import type {
  FileWorkspaceBinding,
  SandboxProvider,
} from "../domain/sandbox.types.ts";

/** What a provider offers file workspaces, known from its options before allocation. */
export interface SandboxCapabilities {
  readonly placement: SandboxProvider["placement"];
  readonly bindings: readonly FileWorkspaceBinding[];
  /** File workspaces require an explicit image. */
  readonly requiresImage?: boolean;
}

/** The declared provider options that change its capabilities. */
export interface SandboxCapabilityOptions {
  readonly repositoryMode?: unknown;
}

export type SandboxCapabilityReader = (
  options: SandboxCapabilityOptions,
) => SandboxCapabilities;
