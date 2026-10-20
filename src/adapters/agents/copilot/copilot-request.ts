import { profileText } from "../profile-support.ts";
import { validId } from "../../../infrastructure/conversations/identity.ts";
import type { AgentInput } from "../../../domain/agent.types.ts";
import type { Command } from "../../../domain/command.types.ts";
import { invariant } from "../../../domain/errors.ts";
import { copilotMcpArguments } from "./copilot-mcp.ts";
import type { CopilotSettings } from "./copilot.types.ts";
import type { Bound } from "../settings.types.ts";
import { copilotRpcBridge } from "./copilot-rpc.constants.ts";
import { copilotRpcInitialize } from "./copilot-rpc.ts";

export function copilotRequest(
  settings: Bound<CopilotSettings>,
  input: AgentInput,
): Command {
  const text = profileText(settings.profile, input.text);
  invariant(
    !input.continuation?.fork,
    "GitHub Copilot CLI does not support automated fork in Outpost",
  );
  const args: string[] = [...copilotMcpArguments(settings.mcpServers)];
  if (input.continuation) validId(input.continuation.id);
  if (input.liveInput && !input.interactive)
    return {
      executable: "node",
      arguments: [
        "-e",
        copilotRpcBridge,
        JSON.stringify([
          ...args,
          "--headless",
          "--stdio",
          "--no-auto-update",
          "--allow-all",
          "--no-ask-user",
        ]),
      ],
      stdin: copilotRpcInitialize(settings, input),
    };
  if (input.continuation) {
    args.push("--resume", input.continuation.id);
  }
  if (settings.model) args.push("--model", settings.model.name);
  if (input.interactive)
    return {
      executable: "copilot",
      arguments: [
        ...args,
        ...(text === undefined ? [] : ["--interactive", text]),
      ],
      interactive: true,
    };
  args.push("--output-format", "json", "--allow-all", "--no-ask-user");
  return { executable: "copilot", arguments: args, stdin: text ?? "" };
}
