import type { AgentEvent } from "../domain/agent.types.ts";

export type Logging =
  false | "stdout" | { readonly file?: string; readonly verbose?: boolean };

export type Journal = {
  file?: string;
  record(event: AgentEvent): void;
  close(): Promise<void>;
};
