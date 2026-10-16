import type { Variables } from "./command.types.ts";

export interface HookCommand {
  readonly executable: string;
  readonly arguments?: readonly string[];
  readonly directory?: string;
  readonly variables?: Variables;
}
