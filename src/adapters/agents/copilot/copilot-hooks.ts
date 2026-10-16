import { defineNativeHook } from "../native-hooks.ts";
import { copilotHookSchemas } from "./copilot-hooks.constants.ts";
import type {
  CopilotHook,
  CopilotHookPhase,
  CopilotHookOptions,
  CopilotHookEvents,
  CopilotHookDecisions,
} from "./copilot-hooks.types.ts";

export function defineCopilotHook<Phase extends CopilotHookPhase>(
  options: CopilotHookOptions<Phase>,
): CopilotHook<Phase> {
  return defineNativeHook<
    "copilot",
    Phase,
    CopilotHookEvents[Phase],
    CopilotHookDecisions[Phase]
  >("copilot", copilotHookSchemas, options);
}
