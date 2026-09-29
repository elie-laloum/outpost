import { validId } from "../../infrastructure/conversations/identity.ts";
import type { AgentInput } from "../../domain/agent.types.ts";
import type { Command } from "../../domain/command.types.ts";
import { invariant } from "../../domain/errors.ts";
import { copilotMcpArguments } from "./copilot-mcp.ts";
import type { CopilotSettings } from "./copilot.types.ts";
import type { Bound } from "./settings.types.ts";

export function copilotRequest(
  settings: Bound<CopilotSettings>,
  input: AgentInput,
): Command {
  invariant(
    !input.continuation?.fork,
    "GitHub Copilot CLI does not support automated fork in Outpost",
  );
  const args: string[] = [...copilotMcpArguments(settings.mcpServers)];
  if (input.continuation) {
    validId(input.continuation.id);
    args.push("--resume", input.continuation.id);
  }
  if (settings.model) args.push("--model", settings.model.name);
  if (input.interactive)
    return {
      executable: "copilot",
      arguments: [
        ...args,
        ...(input.text === undefined ? [] : ["--interactive", input.text]),
      ],
      interactive: true,
    };
  args.push("--output-format", "json", "--allow-all", "--no-ask-user");
  return { executable: "copilot", arguments: args, stdin: input.text ?? "" };
}
