import { codexDiagnosticUsage } from "./codex.constants.ts";
import { cliDiagnostics } from "../cli-diagnostics.ts";
import { codexRequest } from "./codex-request.ts";

export function codexDiagnostics() {
  return cliDiagnostics(
    (input) => codexRequest({}, input),
    codexDiagnosticUsage,
  );
}
