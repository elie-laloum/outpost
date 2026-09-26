import { antigravityRequest } from "./antigravity-request.ts";
import { helpDiagnostics } from "./cli-diagnostics.ts";

export function antigravityDiagnostics() {
  return helpDiagnostics(
    (input) => antigravityRequest({}, input),
    "Usage of agy:",
  );
}
