import { runReportLimits } from "../domain/run-report.constants.ts";
import type { RunReportFailure } from "../domain/run-report.types.ts";
import type { RunReportEvents, RunReportTool } from "./run-report.types.ts";

export function createRunReportEvents(): RunReportEvents {
  const tools = new Map<string, RunReportTool>();
  const failures: RunReportFailure[] = [];
  const warnings = new Set<string>();
  let omittedFailures = 0;
  const bounded = (text: string): string => {
    if (text.length <= runReportLimits.characters) return text;
    warnings.add(
      "Long command descriptions or failure previews were truncated.",
    );
    return text.slice(0, runReportLimits.characters);
  };
  return {
    failures,
    get omittedFailures() {
      return omittedFailures;
    },
    get warnings() {
      return [...warnings];
    },
    observe({ event, scope }) {
      if (event.kind !== "tool" && event.kind !== "tool-result") return;
      const key = JSON.stringify([
        scope.dispatchId,
        scope.pass,
        scope.subagentId,
        event.callId,
      ]);
      if (event.kind === "tool") {
        if (!event.callId) return;
        if (tools.size >= runReportLimits.pendingTools) {
          tools.delete(tools.keys().next().value!);
          warnings.add(
            "Pending tool descriptions exceeded the report limit; some commands may be unavailable.",
          );
        }
        tools.set(key, { name: event.name, command: command(event.input) });
        return;
      }
      const tool = tools.get(key);
      tools.delete(key);
      if (!event.isError) return;
      if (failures.length >= runReportLimits.failures) {
        omittedFailures++;
        return;
      }
      failures.push({
        tool: tool?.name || event.name || "unknown",
        command: tool?.command ? bounded(tool.command) : null,
        preview: bounded(event.preview),
        pass: scope.pass ?? null,
        subagentId: scope.subagentId ?? null,
      });
    },
  };
  function command(input: unknown): string | null {
    if (typeof input === "string") return bounded(input);
    if (!input || typeof input !== "object") return null;
    for (const key of ["command", "cmd"]) {
      if (key in input) {
        const value: unknown = Reflect.get(input, key);
        if (typeof value === "string") return bounded(value);
      }
    }
    return null;
  }
}
