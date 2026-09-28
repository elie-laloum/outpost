import { helpDiagnostics } from "./cli-diagnostics.ts";
import { kimiRequest } from "./kimi-request.ts";
import type { AgentCliDiagnostic } from "./cli-diagnostics.types.ts";

export function kimiDiagnostics(): readonly AgentCliDiagnostic[] {
  return [
    ...helpDiagnostics(
      (input) => kimiRequest({}, input),
      "Usage: kimi [",
      true,
    ),
    {
      mode: "fork",
      usage: "Usage: kimi fork [",
      options: ["--yes"],
      command: { executable: "kimi", arguments: ["fork", "--help"] },
    },
  ];
}
