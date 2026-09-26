import type { AgentAuthentication } from "../../domain/agent.types.ts";
import type { Variables } from "../../domain/command.types.ts";

export interface AntigravitySettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly mode?: "accept-edits" | "plan";
}
