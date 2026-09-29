import type { AgentDescriptor } from "./agent-descriptor.types.ts";
import { antigravityAgent } from "./antigravity/antigravity-descriptor.ts";
import type { BuiltInAgentCatalog, BuiltInAgentName } from "./catalog.types.ts";
import { claudeAgent } from "./claude/claude-descriptor.ts";
import { codexAgent } from "./codex/codex-descriptor.ts";
import { copilotAgent } from "./copilot/copilot-descriptor.ts";
import { kimiAgent } from "./kimi/kimi-descriptor.ts";

const catalog = {
  codex: codexAgent,
  claude: claudeAgent,
  antigravity: antigravityAgent,
  copilot: copilotAgent,
  kimi: kimiAgent,
} as const satisfies BuiltInAgentCatalog;

/** Built-in CLI agents, in the order the CLI offers them. */
export const builtInAgents = Object.freeze(Object.values(catalog));

export function builtInAgent(name: string): AgentDescriptor | undefined {
  return builtInAgents.find((agent) => agent.name === name);
}

export function isBuiltInAgent(name: string): name is BuiltInAgentName {
  return builtInAgent(name) !== undefined;
}

/** Lists the built-in agent names for messages, e.g. "codex, claude or kimi". */
export function builtInAgentList(): string {
  const names = builtInAgents.map((agent) => agent.name);
  return `${names.slice(0, -1).join(", ")} or ${names.at(-1)}`;
}

export function builtInAgentRecord<Value>(
  select: (agent: AgentDescriptor) => Value,
): Readonly<Record<BuiltInAgentName, Value>> {
  // Every key comes from the catalog, so the record is complete by construction.
  return Object.freeze(
    Object.fromEntries(
      builtInAgents.map((agent) => [agent.name, select(agent)]),
    ) as Record<BuiltInAgentName, Value>,
  );
}
