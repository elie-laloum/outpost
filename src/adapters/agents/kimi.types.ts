import type { AgentAuthentication } from "../../domain/agent.types.ts";
import type { Variables } from "../../domain/command.types.ts";

export interface KimiSettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
}
