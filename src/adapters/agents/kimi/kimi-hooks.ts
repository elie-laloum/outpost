import { defineNativeHook } from "../native-hooks.ts";
import { kimiHookSchemas } from "./kimi-hooks.constants.ts";
import type {
  KimiHook,
  KimiHookPhase,
  KimiHookOptions,
  KimiHookEvents,
  KimiHookDecisions,
} from "./kimi-hooks.types.ts";

export function defineKimiHook<Phase extends KimiHookPhase>(
  options: KimiHookOptions<Phase>,
): KimiHook<Phase> {
  return defineNativeHook<
    "kimi",
    Phase,
    KimiHookEvents[Phase],
    KimiHookDecisions[Phase]
  >("kimi", kimiHookSchemas, options);
}
