import type { McpServers } from "./mcp-server.types.ts";
import type { AgentProfile } from "./agent-profile.types.ts";
import type { HarnessPermissions } from "./permissions.types.ts";
import { PROFILE_HARNESS_TOOLS } from "./agent-profile.constants.ts";

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
  return [
    Object.freeze({
      kind: "permissions",
      default: "deny",
      rules: Object.freeze([]),
      evaluate(tool, resources) {
        const mcp = servers.some((server) =>
          tool.startsWith(`mcp__${server}__`),
        );
        const shell =
          tool === "shell" &&
          (entries.includes("shell") ||
            (resources.command !== undefined &&
              commands.includes(resources.command)));
        if (mcp || shell || (tool !== "shell" && names.includes(tool)))
          return { allowed: true };
        return {
          allowed: false,
          reason: "Denied by agent profile allowedTools",
        };
      },
    } satisfies HarnessPermissions),
  ];
}
