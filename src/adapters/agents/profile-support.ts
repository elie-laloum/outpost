import { invariant } from "../../domain/errors.ts";
import type { AgentProfile } from "../../domain/agent-profile.types.ts";

export function rejectProfileTools(
  agent: string,
  profile: AgentProfile | undefined,
): void {
  invariant(
    profile?.allowedTools === undefined,
    `${agent} does not support agent profile allowedTools; use the Outpost harness or Claude Code`,
  );
}

export function profileText(
  profile: AgentProfile | undefined,
  text: string | undefined,
): string | undefined {
  if (profile?.instructions === undefined) return text;
  return `${profile.instructions}\n\n${text ?? ""}`;
}
