import { invariant } from "../domain/errors.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import type { ProviderDefinition } from "./factories.types.ts";

function sandboxProvider(
  placement: "mounted" | "remote",
  definition: ProviderDefinition,
): SandboxProvider {
  invariant(definition.name.trim(), "A provider needs a name");
  return Object.freeze({
    ...definition,
    placement,
    variables: Object.freeze({ ...definition.variables }),
  });
}

export const mountedSandboxProvider = (
  definition: ProviderDefinition,
): SandboxProvider => sandboxProvider("mounted", definition);

export const remoteSandboxProvider = (
  definition: ProviderDefinition,
): SandboxProvider => sandboxProvider("remote", definition);
