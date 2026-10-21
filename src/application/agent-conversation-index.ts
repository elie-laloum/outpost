import type { Agent } from "../domain/agent.types.ts";

export function createAgentConversationIndex() {
  const known = new Set<string>();
  const key = (agent: Pick<Agent, "name" | "storage">, id: string) =>
    JSON.stringify([agent.storage?.name ?? agent.name, id]);
  return {
    has(agent: Pick<Agent, "name" | "storage">, id: string): boolean {
      return known.has(key(agent, id));
    },
    remember(agent: Pick<Agent, "name" | "storage">, id: string): void {
      known.add(key(agent, id));
    },
  };
}
