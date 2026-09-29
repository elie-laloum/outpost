import { helpDiagnostics } from "../cli-diagnostics.ts";
import { copilotRequest } from "./copilot-request.ts";

export function copilotDiagnostics() {
  return helpDiagnostics(
    (input) => copilotRequest({}, input),
    "Usage: copilot [",
    true,
  );
}
