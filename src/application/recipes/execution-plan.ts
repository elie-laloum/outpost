import { fileWorkspaceBinding } from "../../domain/file-workspace-binding.ts";
import type { FileWorkspaceSource } from "../../domain/file-workspace.types.ts";
import { nativeSandboxCapabilities } from "../../providers/sandbox-capabilities.ts";
import type { RecipeFileWorkspacePlan } from "./file-configuration.types.ts";

/** Plans a file workspace against the declared sandbox without allocating or importing extensions. */
export function planFileWorkspace(
  source: FileWorkspaceSource | undefined,
  sandbox: Readonly<Record<string, unknown>>,
): RecipeFileWorkspacePlan {
  const type = sandbox.provider ?? sandbox.type;
  const capabilities =
    typeof type === "string"
      ? nativeSandboxCapabilities(type, sandbox)
      : undefined;
  const provider = String(typeof type === "string" ? type : sandbox.$ref);
  const binding = source && fileWorkspaceBinding(source);
  const diagnostics: string[] = [];
  if (
    source &&
    capabilities?.requiresImage &&
    (typeof sandbox.image !== "string" || !sandbox.image)
  )
    diagnostics.push("File workspaces require an explicit container image");
  if (binding && capabilities && !capabilities.bindings.includes(binding))
    diagnostics.push(
      binding.startsWith("mount")
        ? "Sandbox provider cannot mount workspace sources"
        : `Sandbox provider does not support ${binding} workspaces`,
    );
  return {
    ...(binding ? { binding } : {}),
    sandbox: {
      provider,
      ...(capabilities
        ? {
            placement: capabilities.placement,
            bindings: capabilities.bindings,
          }
        : {}),
    },
    diagnostics,
  };
}
