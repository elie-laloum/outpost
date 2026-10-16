import type { McpServers } from "./mcp-server.types.ts";
import type { AgentProfile } from "./agent-profile.types.ts";
import type { HarnessPermissions } from "./permissions.types.ts";
import { PROFILE_HARNESS_TOOLS } from "./agent-profile.constants.ts";
import { MCP_CAPABILITY_TOOLS } from "./mcp-server.constants.ts";
import { SKILL_LOADER } from "./skill.constants.ts";

export function profilePermissions(
  profile: AgentProfile | undefined,
  mcpServers?: McpServers,
): readonly HarnessPermissions[] {
  if (profile?.allowedTools === undefined) return [];
  const entries = profile.allowedTools;
  const names = entries.flatMap((entry) => {
    if (entry.startsWith("shell:")) return ["shell"];
    if (entry === "read" || entry === "edit" || entry === "shell")
      return PROFILE_HARNESS_TOOLS[entry];
    return [];
  });
  const commands = entries
    .filter((entry) => entry.startsWith("shell:"))
    .map((entry) => entry.slice(6));
  const servers = Object.keys(mcpServers ?? profile.mcpServers ?? {});
  const capabilityTools = new Set<string>(Object.values(MCP_CAPABILITY_TOOLS));
  return [
    Object.freeze({
      kind: "permissions",
      default: "deny",
      rules: Object.freeze([]),
      evaluate(tool, resources) {
        const mcp = servers.some((server) =>
          tool.startsWith(`mcp__${server}__`),
        );
        const capability =
          capabilityTools.has(tool) &&
          resources.mcpServer !== undefined &&
          servers.includes(resources.mcpServer);
        const shell =
          tool === "shell" &&
          (entries.includes("shell") ||
            (resources.command !== undefined &&
              commands.includes(resources.command)));
        if (
          tool === SKILL_LOADER ||
          capability ||
          mcp ||
          shell ||
          (tool !== "shell" && names.includes(tool))
        )
          return { allowed: true };
        return {
          allowed: false,
          reason: "Denied by agent profile allowedTools",
        };
      },
    } satisfies HarnessPermissions),
  ];
}
