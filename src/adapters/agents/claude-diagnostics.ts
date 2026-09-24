import { claudeDiagnosticUsage } from "./cli-diagnostics.constants.ts";
import { cliDiagnostics } from "./cli-diagnostics.ts";
import { claudeRequest } from "./claude-request.ts";

export function claudeDiagnostics() {
  return cliDiagnostics(
    (input) => claudeRequest({}, input),
    claudeDiagnosticUsage,
  );
}
