import { helpDiagnostics } from "./cli-diagnostics.ts";
import { kimiRequest } from "./kimi-request.ts";

export function kimiDiagnostics() {
  return helpDiagnostics((input) => kimiRequest({}, input), "Usage: kimi [");
}
