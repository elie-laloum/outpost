import { builtInAgentRecord } from "../adapters/agents/catalog.ts";

export const agentVersions = builtInAgentRecord((agent) => agent.version);
