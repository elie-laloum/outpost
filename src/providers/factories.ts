import type {
  SandboxContext,
  SandboxLease,
  SandboxProvider,
  Variables,
} from "../domain/ports.ts";
import { invariant } from "../domain/errors.ts";

interface ProviderDefinition {
  readonly name: string;
  readonly variables?: Variables;
  acquire(context: SandboxContext): Promise<SandboxLease>;
}

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
