import type { HarnessHookPhase } from "./hook.types.ts";

export const HOOK_PHASES: ReadonlySet<HarnessHookPhase> = new Set([
  "session-start",
  "before-model",
  "after-model",
  "before-tool",
  "after-tool",
  "before-prompt",
  "model-error",
  "before-compaction",
  "after-compaction",
  "before-subagent",
  "after-subagent",
  "run-end",
  "stop",
]);

export const HOOK_FIELDS: ReadonlySet<string> = new Set([
  "on",
  "name",
  "run",
  "command",
  "timeoutMs",
]);
export const HOOK_TIMEOUT_MS = 30_000;
export const HOOK_OUTPUT_BYTES = 1_048_576;

export const HOOK_DECISION_FIELDS: Readonly<
  Record<HarnessHookPhase, readonly string[]>
> = {
  "session-start": ["instructions"],
  "before-prompt": ["prompt", "deny"],
  "before-model": ["messages", "system"],
  "after-model": ["result"],
  "before-tool": ["deny", "input"],
  "after-tool": ["result"],
  stop: ["continue"],
  "before-compaction": ["messages"],
  "after-compaction": ["messages"],
  "before-subagent": ["prompt", "deny"],
  "after-subagent": ["text"],
  "model-error": [],
  "run-end": [],
};
