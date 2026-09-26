import type { AgentAuthentication } from "../../domain/agent.types.ts";
import type { Variables } from "../../domain/command.types.ts";

export interface CopilotSettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
}
