import { invariant } from "../domain/errors.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import type { ProviderDefinition } from "./factories.types.ts";

function provider(
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

export const mountedProvider = (
  definition: ProviderDefinition,
): SandboxProvider => provider("mounted", definition);

export const remoteProvider = (
  definition: ProviderDefinition,
): SandboxProvider => provider("remote", definition);
