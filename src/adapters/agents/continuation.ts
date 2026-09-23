import type { AgentInput } from "../../domain/agent.types.ts";
import { invariant } from "../../domain/errors.ts";

export function validateContinuation(input: AgentInput): void {
  if (input.continuation)
    invariant(
      /^[A-Za-z0-9_-]+$/.test(input.continuation.id),
      "Invalid conversation identifier",
    );
}
