import type { AgentAdapter } from "../../../domain/agent.types.ts";
import { invariant } from "../../../domain/errors.ts";
import { validId } from "../../../infrastructure/conversations/identity.ts";
import { requireSuccess } from "../../../infrastructure/process.ts";

export const forkKimi: NonNullable<AgentAdapter["fork"]> = async (
  id,
  invoke,
) => {
  validId(id);
  const result = await requireSuccess(
    { executable: "kimi", arguments: ["fork", id, "--yes"] },
    invoke,
  );
  const child = /^Forked to ([A-Za-z0-9_-]+)(?: |$)/m.exec(result.stdout)?.[1];
  invariant(
    child && child !== id,
    "Kimi fork did not return a distinct conversation identifier",
  );
  return child;
};
