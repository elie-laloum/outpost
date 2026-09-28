import { invariant } from "../domain/errors.ts";
import type { AgentAdapter, AgentInput } from "../domain/agent.types.ts";
import type { Command, CommandResult } from "../domain/command.types.ts";

export async function agentRequest(
  agent: AgentAdapter,
  input: AgentInput,
  invoke: (command: Command) => Promise<CommandResult>,
  forked?: (id: string) => void,
): Promise<Command> {
  if (input.continuation?.fork && agent.fork) {
    const id = await agent.fork(input.continuation.id, invoke);
    invariant(
      id && id !== input.continuation.id,
      "Native fork must return a distinct conversation identifier",
    );
    forked?.(id);
    return agent.request({ ...input, continuation: { id } });
  }
  return agent.request(input);
}
