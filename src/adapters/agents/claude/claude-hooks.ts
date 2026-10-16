import { defineNativeHook } from "../native-hooks.ts";
import { claudeHookSchemas } from "./claude-hooks.constants.ts";
import type {
  ClaudeHook,
  ClaudeHookPhase,
  ClaudeHookOptions,
  ClaudeHookEvents,
  ClaudeHookDecisions,
} from "./claude-hooks.types.ts";

export function defineClaudeHook<Phase extends ClaudeHookPhase>(
  options: ClaudeHookOptions<Phase>,
): ClaudeHook<Phase> {
  return defineNativeHook<
    "claude",
    Phase,
    ClaudeHookEvents[Phase],
    ClaudeHookDecisions[Phase]
  >("claude", claudeHookSchemas, options);
}
