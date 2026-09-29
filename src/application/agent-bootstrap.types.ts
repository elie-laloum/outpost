import type { AgentInstaller } from "../adapters/agents/agent-descriptor.types.ts";

export interface AgentInstallation {
  readonly target: string;
  readonly install: string;
}

export type AgentInstallations = {
  readonly [Kind in AgentInstaller["kind"]]: (
    installer: Extract<AgentInstaller, { kind: Kind }>,
    executable: string,
    version: string,
    home: string,
  ) => AgentInstallation;
};
