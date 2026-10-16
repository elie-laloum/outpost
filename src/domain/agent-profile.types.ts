import type { NativeHook } from "./agent-hook.types.ts";
import type { HarnessHook } from "./hook.types.ts";
import type { McpServers } from "./mcp-server.types.ts";

export type AgentProfileTool = "read" | "edit" | "shell" | `shell:${string}`;

export interface AgentProfileHooks {
  readonly claude?: readonly NativeHook<"claude">[];
  readonly codex?: readonly NativeHook<"codex">[];
  readonly copilot?: readonly NativeHook<"copilot">[];
  readonly kimi?: readonly NativeHook<"kimi">[];
  readonly antigravity?: readonly NativeHook<"antigravity">[];
  readonly outpost?: readonly HarnessHook[];
}

export interface AgentProfileOptions {
  readonly hooks?: AgentProfileHooks;
  readonly instructions?: string;
  readonly allowedTools?: readonly AgentProfileTool[];
  readonly mcpServers?: McpServers;
}

export interface AgentProfile extends AgentProfileOptions {
  readonly kind: "agent-profile";
}
