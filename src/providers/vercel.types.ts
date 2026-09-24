import type { EgressPolicy } from "../domain/egress.types.ts";
import type { Sandbox, Sandbox as VercelSandbox } from "@vercel/sandbox";
import type { Variables } from "../domain/command.types.ts";
import type { SandboxContext } from "../domain/sandbox.types.ts";

export interface VercelOptions {
  readonly egress?: EgressPolicy;
  readonly create?: NonNullable<Parameters<typeof Sandbox.create>[0]>;
  readonly variables?: Variables;
  readonly root?: string;
  readonly retain?: number;
}

export interface VercelRuntime {
  readonly sandbox: VercelSandbox;
  readonly root: string;
  readonly options: VercelOptions;
  readonly context: SandboxContext;
  readonly isClosed: () => boolean;
}
