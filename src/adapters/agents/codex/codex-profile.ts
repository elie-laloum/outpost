import type { AgentProfile } from "../../../domain/agent-profile.types.ts";

export function codexProfileArguments(
  profile: AgentProfile | undefined,
): readonly string[] {
  if (profile?.instructions === undefined) return [];
  return [
    "-c",
    `developer_instructions=${JSON.stringify(profile.instructions)}`,
  ];
}
