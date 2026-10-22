import { fileWorkspaceBinding } from "../../domain/file-workspace-binding.ts";
import type { ConfigurationDiagnostic } from "../../domain/configuration-diagnostic.types.ts";
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
  const diagnostics: ConfigurationDiagnostic[] = [];
  if (
    source &&
    capabilities?.requiresImage &&
    (typeof sandbox.image !== "string" || !sandbox.image)
  )
    diagnostics.push({
      code: "missing-field",
      path: ["sandbox", "image"],
      message: "File workspaces require an explicit container image",
      hint: "Declare sandbox.image with the container image to run.",
    });
  if (binding && capabilities && !capabilities.bindings.includes(binding))
    diagnostics.push({
      code: "unsupported-binding",
      path: ["sandbox"],
      message: binding.startsWith("mount")
        ? "Sandbox provider cannot mount workspace sources"
        : `Sandbox provider does not support ${binding} workspaces`,
      hint: `${provider} supports ${capabilities.bindings.join(", ")}; change workspace.access or the sandbox provider.`,
    });
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
