import type { Harness } from "../domain/harness.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { harnessTools } from "../domain/tool.ts";
import type { HarnessTool } from "../domain/tool.types.ts";
import { openMcpServers } from "../adapters/tools/mcp.ts";

export async function withMcpTools<T>(
  harness: Harness,
  sandbox: SandboxLease,
  signal: AbortSignal,
  tools: readonly HarnessTool[],
  run: (tools: readonly HarnessTool[]) => Promise<T>,
): Promise<T> {
  if (!harness.mcpServers || Object.keys(harness.mcpServers).length === 0)
    return run(tools);
  const opened = await openMcpServers(harness.mcpServers, sandbox, signal);
  try {
    return await run(harnessTools([...tools, ...opened.tools]));
  } finally {
    await opened.close();
  }
}
