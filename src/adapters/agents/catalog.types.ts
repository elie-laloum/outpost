import type { AgentDescriptor } from "./agent-descriptor.types.ts";

/** Built-in CLI agents; the catalog must describe exactly these names. */
export type BuiltInAgentName =
  "codex" | "claude" | "antigravity" | "copilot" | "kimi";

export type BuiltInAgentCatalog = {
  readonly [Name in BuiltInAgentName]: AgentDescriptor & {
    readonly name: Name;
  };
};
