import type { AgentInput } from "../../domain/agent.types.ts";
import type { Command } from "../../domain/command.types.ts";
import { cliDiagnosticScenarios } from "./cli-diagnostics.constants.ts";
import type {
  AgentCliDiagnostic,
  AgentCliMode,
} from "./cli-diagnostics.types.ts";

export function cliDiagnostics(
  request: (input: AgentInput) => Command,
  usage: Readonly<Record<AgentCliMode, string>>,
): readonly AgentCliDiagnostic[] {
  return cliDiagnosticScenarios.map(({ mode, input }) => {
    const command = request(input);
    const args = command.arguments ?? [];
    return {
      mode,
      usage: usage[mode],
      options: args.filter((argument) => argument.startsWith("--")),
      command: { ...command, arguments: [...args, "--help"] },
    };
  });
}

export function helpDiagnostics(
  request: (input: AgentInput) => Command,
  usage: string,
): readonly AgentCliDiagnostic[] {
  const command = request({});
  return [
    {
      mode: "start",
      usage,
      options: (command.arguments ?? []).filter((argument) =>
        argument.startsWith("--"),
      ),
      command: { executable: command.executable, arguments: ["--help"] },
    },
  ];
}
