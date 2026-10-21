import {
  hostSandboxCapabilities,
  remoteSandboxCapabilities,
  transferredWorkspaceBindings,
} from "./sandbox-capabilities.constants.ts";
import type {
  SandboxCapabilities,
  SandboxCapabilityOptions,
  SandboxCapabilityReader,
} from "./sandbox-capabilities.types.ts";

export function containerSandboxCapabilities(
  options: SandboxCapabilityOptions,
): SandboxCapabilities {
  return options.repositoryMode === "isolated"
    ? {
        placement: "remote",
        bindings: transferredWorkspaceBindings,
        requiresImage: true,
      }
    : {
        placement: "mounted",
        bindings: ["copy", "ephemeral", "mount-readonly", "mount-write"],
        requiresImage: true,
      };
}

const native: Readonly<Record<string, SandboxCapabilityReader>> = {
  docker: containerSandboxCapabilities,
  podman: containerSandboxCapabilities,
  local: () => hostSandboxCapabilities,
  vercel: () => remoteSandboxCapabilities,
  daytona: () => remoteSandboxCapabilities,
  firecracker: () => remoteSandboxCapabilities,
};

/** Static capabilities of a built-in provider type; extensions are only known once created. */
export function nativeSandboxCapabilities(
  type: string,
  options: SandboxCapabilityOptions,
): SandboxCapabilities | undefined {
  return Object.hasOwn(native, type) ? native[type]!(options) : undefined;
}
