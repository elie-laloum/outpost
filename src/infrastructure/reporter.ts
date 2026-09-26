import type { AgentEvent } from "../domain/agent.types.ts";
import type { ReporterOptions, ReportPass } from "./reporter.types.ts";

export type { ReporterOptions } from "./reporter.types.ts";

export function reporter(
  options: ReporterOptions = {},
): (event: AgentEvent & ReportPass) => void {
  const write = options.write ?? ((text) => process.stdout.write(text));
  let streamed = false;
  return (event) => {
    if (options.quiet) return;
    const prefix = `[${options.label ?? "outpost"}${event.pass ? ` · pass ${event.pass}` : ""}]`;
    switch (event.kind) {
      case "phase":
        if (event.name === "running") streamed = false;
        write(
          `${prefix} ${event.name}${event.agent ? ` · ${event.agent}` : ""}${event.branch ? ` · ${event.branch}` : ""}${options.verbose && event.directory ? ` · ${event.directory}` : ""}\n`,
        );
        break;
      case "text":
        streamed = true;
        write(event.text);
        break;
      case "result":
        if (!streamed || options.verbose)
          write(`\n${prefix} result: ${event.text}\n`);
        break;
      case "tool":
        write(
          `\n${prefix} tool: ${event.name}${options.verbose ? ` ${JSON.stringify(event.input)}` : ""}\n`,
        );
        break;
      case "tool-result":
        write(
          `${prefix} tool ${event.isError ? "failed" : "done"}: ${event.name}${options.verbose ? ` ${event.preview}` : ""}\n`,
        );
        break;
      case "tool-denied":
        write(`${prefix} tool denied: ${event.name} · ${event.reason}\n`);
        break;
      case "stop-prevented":
        write(`${prefix} stop prevented: ${event.message}\n`);
        break;
      case "step":
        if (options.verbose) write(`${prefix} step ${event.index}\n`);
        break;
      case "summary":
        write(
          `\n${prefix} finished · ${(event.durationMs / 1000).toFixed(2)}s · status ${event.status} · input ${event.tokens.input} · cache read ${event.tokens.cached} · cache write ${event.tokens.cacheCreated ?? 0} · output ${event.tokens.output}\n`,
        );
        break;
      case "failure":
      case "warning":
        write(`\n${prefix} ${event.kind}: ${event.message}\n`);
        break;
      case "conversation":
        if (options.verbose) write(`\n${prefix} conversation: ${event.id}\n`);
        break;
      case "prompt":
        if (options.verbose) write(`${prefix} prompt:\n${event.text}\n`);
        break;
      case "raw":
        if (options.verbose)
          write(
            `${prefix} raw: ${typeof event.value === "string" ? event.value : JSON.stringify(event.value)}\n`,
          );
        break;
    }
  };
}
