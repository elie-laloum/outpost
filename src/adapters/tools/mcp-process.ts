import { PassThrough } from "node:stream";
import { setTimeout as delay } from "node:timers/promises";
import type { Command } from "../../domain/command.types.ts";
import { OutpostError } from "../../domain/errors.ts";
import type { SandboxLease } from "../../domain/sandbox.types.ts";
import { mcpConnection } from "./mcp-connection.ts";
import { mcpDefaults } from "./mcp.constants.ts";
import type { McpProcess } from "./mcp.types.ts";

export function openMcpProcess(
  server: string,
  lease: SandboxLease,
  command: Pick<Command, "executable" | "arguments" | "variables">,
  signal: AbortSignal,
): McpProcess {
  const input = new PassThrough();
  const stop = new AbortController();
  let open = true;
  let stderr = "";
  let pending = "";
  const connection = mcpConnection(server, (text) => {
    if (open) input.write(text);
  });
  const receive = (chunk: string) => {
    pending += chunk;
    let end: number;
    while ((end = pending.indexOf("\n")) >= 0) {
      connection.receive(pending.slice(0, end));
      pending = pending.slice(end + 1);
    }
    if (pending.length > mcpDefaults.lineCharacters)
      stop.abort(
        new OutpostError(
          "response",
          `MCP server ${server} sent a message larger than ${mcpDefaults.lineCharacters} characters`,
        ),
      );
  };
  const running = lease.invoke({
    ...command,
    input,
    deadlineMs: mcpDefaults.processDeadlineMs,
    retain: 1,
    signal: AbortSignal.any([signal, stop.signal]),
    observe(channel, text) {
      if (channel === "stdout") receive(text);
      else stderr = (stderr + text).slice(-mcpDefaults.stderrCharacters);
    },
  });
  void running.then(
    (result) =>
      exited(
        new OutpostError(
          result.status === mcpDefaults.missingVariableStatus
            ? "configuration"
            : "process",
          `MCP server ${server} exited with status ${result.status}${stderr.trim() ? `: ${stderr.trim()}` : ""}`,
          { server, status: result.status },
        ),
      ),
    exited,
  );
  function exited(error: unknown): void {
    open = false;
    input.end();
    connection.fail(error);
  }
  return {
    connection,
    async close() {
      if (open) {
        open = false;
        input.end();
      }
      const settled = running.then(
        () => true,
        () => true,
      );
      const graceful = await Promise.race([
        settled,
        delay(mcpDefaults.closeGraceMs, false, { ref: false }),
      ]);
      if (!graceful)
        stop.abort(new OutpostError("aborted", `MCP server ${server} closed`));
      await settled;
    },
  };
}
