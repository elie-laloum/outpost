import type { Variables } from "../domain/command.types.ts";
import type { SandboxContext, SandboxLease } from "../domain/sandbox.types.ts";

export interface ProviderDefinition {
  readonly name: string;
  readonly variables?: Variables;
  acquire(context: SandboxContext): Promise<SandboxLease>;
}
