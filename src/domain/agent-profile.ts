import type { McpServers } from "./mcp-server.types.ts";
import { invariant } from "./errors.ts";
import { mcpServers } from "./mcp-server.ts";
import {
  AGENT_PROFILE_FIELDS,
  AGENT_PROFILE_TOOLS,
} from "./agent-profile.constants.ts";
import type {
  AgentProfile,
  AgentProfileOptions,
} from "./agent-profile.types.ts";

export function defineAgentProfile(options: AgentProfileOptions): AgentProfile {
  invariant(
    options !== null && typeof options === "object" && !Array.isArray(options),
    "Agent profile options must be an object",
  );
  invariant(
    Object.keys(options).every((key) => AGENT_PROFILE_FIELDS.has(key)),
    "Agent profiles accept instructions, allowedTools and mcpServers",
  );
  invariant(
    options.instructions === undefined ||
      (typeof options.instructions === "string" &&
        options.instructions.trim().length > 0 &&
        !options.instructions.includes("\0")),
    "Agent profile instructions must be nonempty text without NUL",
  );
  const tools = options.allowedTools;
  invariant(
    tools === undefined ||
      (Array.isArray(tools) &&
        tools.every(
          (tool) =>
            typeof tool === "string" &&
            (AGENT_PROFILE_TOOLS.has(tool) ||
              (tool.startsWith("shell:") &&
                tool.slice(6).trim().length > 0 &&
                !/[\r\n\0]/.test(tool))),
        ) &&
        new Set(tools).size === tools.length),
    "Agent profile allowedTools must list distinct read, edit, shell or shell:<exact command> entries",
  );
  return Object.freeze({
    kind: "agent-profile",
    ...(options.instructions === undefined
      ? {}
      : { instructions: options.instructions }),
    ...(tools === undefined ? {} : { allowedTools: Object.freeze([...tools]) }),
    ...(options.mcpServers === undefined
      ? {}
      : { mcpServers: mcpServers(options.mcpServers) }),
  });
}

export function agentProfile(
  profile: AgentProfile | undefined,
): AgentProfile | undefined {
  if (profile === undefined) return undefined;
  invariant(
    profile?.kind === "agent-profile",
    "Declare profiles with defineAgentProfile",
  );
  const { kind: _kind, ...options } = profile;
  return defineAgentProfile(options);
}

export function profileMcpServers(
  profile: AgentProfile | undefined,
  servers: McpServers | undefined,
): McpServers | undefined {
  const declared = profile?.mcpServers;
  if (declared === undefined) return servers;
  invariant(
    Object.keys(declared).every((name) => !Object.hasOwn(servers ?? {}, name)),
    "Declare each MCP server on the profile or harness, not both",
  );
  return mcpServers({ ...declared, ...servers });
}
