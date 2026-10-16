import { defineNativeHook } from "../native-hooks.ts";
import { antigravityHookSchemas } from "./antigravity-hooks.constants.ts";
import type {
  AntigravityHook,
  AntigravityHookPhase,
  AntigravityHookOptions,
  AntigravityHookEvents,
  AntigravityHookDecisions,
} from "./antigravity-hooks.types.ts";

export function defineAntigravityHook<Phase extends AntigravityHookPhase>(
  options: AntigravityHookOptions<Phase>,
): AntigravityHook<Phase> {
  return defineNativeHook<
    "antigravity",
    Phase,
    AntigravityHookEvents[Phase],
    AntigravityHookDecisions[Phase]
  >("antigravity", antigravityHookSchemas, options);
}
