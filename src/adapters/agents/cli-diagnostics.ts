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
  resume = false,
): readonly AgentCliDiagnostic[] {
  const modes = resume ? (["start", "resume"] as const) : (["start"] as const);
  return modes.map((mode) => {
    const command = request(
      mode === "resume"
        ? { continuation: { id: "00000000-0000-0000-0000-000000000000" } }
        : {},
    );
    return {
      mode,
      usage,
      options: (command.arguments ?? []).filter((argument) =>
        argument.startsWith("--"),
      ),
      command: {
        executable: command.executable,
        arguments: ["--help"],
        ...(command.variables ? { variables: command.variables } : {}),
      },
    };
  });
}
