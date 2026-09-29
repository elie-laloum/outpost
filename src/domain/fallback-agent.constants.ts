import type { FallbackTrigger } from "./fallback-agent.types.ts";

export const fallbackTriggers: ReadonlySet<FallbackTrigger> = new Set([
  "quota",
  "unavailable",
]);

export const fallbackAgentKinds: ReadonlySet<string> = new Set([
  "cli",
  "custom",
  "replay",
]);
