import type { SandboxCapabilities } from "./sandbox-capabilities.types.ts";

export const transferredWorkspaceBindings = ["copy", "ephemeral"] as const;

export const hostSandboxCapabilities: SandboxCapabilities = {
  placement: "host",
  bindings: transferredWorkspaceBindings,
};

export const remoteSandboxCapabilities: SandboxCapabilities = {
  placement: "remote",
  bindings: transferredWorkspaceBindings,
};
