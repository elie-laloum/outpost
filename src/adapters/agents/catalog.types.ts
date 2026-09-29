import type { builtInAgents } from "./catalog.ts";

export type BuiltInAgentName = (typeof builtInAgents)[number]["name"];
