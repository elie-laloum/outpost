import { defineNativeHook } from "../native-hooks.ts";
import { codexHookSchemas } from "./codex-hooks.constants.ts";
import type {
  CodexHook,
  CodexHookPhase,
  CodexHookOptions,
  CodexHookEvents,
  CodexHookDecisions,
} from "./codex-hooks.types.ts";

export function defineCodexHook<Phase extends CodexHookPhase>(
  options: CodexHookOptions<Phase>,
): CodexHook<Phase> {
  return defineNativeHook<
    "codex",
    Phase,
    CodexHookEvents[Phase],
    CodexHookDecisions[Phase]
  >("codex", codexHookSchemas, options);
}
