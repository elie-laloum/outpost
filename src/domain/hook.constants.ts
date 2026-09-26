import type { HarnessHookPhase } from "./hook.types.ts";

export const HOOK_PHASES: ReadonlySet<HarnessHookPhase> = new Set([
  "session-start",
  "before-model",
  "after-model",
  "before-tool",
  "after-tool",
  "stop",
]);

export const HOOK_FIELDS: ReadonlySet<string> = new Set(["on", "name", "run"]);
