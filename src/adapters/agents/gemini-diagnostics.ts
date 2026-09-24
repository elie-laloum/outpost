import type { AgentCliDiagnostic } from "./cli-diagnostics.types.ts";
import { geminiRequest } from "./gemini-request.ts";

export function geminiDiagnostics(): readonly AgentCliDiagnostic[] {
  const command = geminiRequest({}, {});
  const args = command.arguments ?? [];
  return [
    {
      mode: "start",
      usage: "gemini",
      options: args.filter((argument) => argument.startsWith("--")),
      // Gemini omits supplied options from its help output.
      command: { ...command, arguments: ["--help"] },
    },
  ];
}
