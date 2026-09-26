import { invariant } from "./errors.ts";
import { HOOK_FIELDS, HOOK_PHASES } from "./hook.constants.ts";
import type {
  HarnessHook,
  HarnessHookInput,
  HarnessHookOptions,
  HarnessHookPhase,
} from "./hook.types.ts";

export function defineHarnessHook<Phase extends HarnessHookPhase>(
  options: HarnessHookOptions<Phase>,
): HarnessHook<Phase> {
  invariant(
    options !== null && typeof options === "object",
    "Hook options must be an object",
  );
  invariant(
    Object.keys(options).every((key) => HOOK_FIELDS.has(key)),
    "Unsupported hook option",
  );
  invariant(
    HOOK_PHASES.has(options.on),
    `Hook phase must be one of ${[...HOOK_PHASES].join(", ")}`,
  );
  invariant(typeof options.run === "function", "Hook run must be a function");
  invariant(
    options.name === undefined ||
      (typeof options.name === "string" && options.name.trim()),
    "Hook name must be nonempty text",
  );
  return Object.freeze({
    kind: "hook",
    on: options.on,
    name: options.name ?? options.on,
    run: (input: HarnessHookInput<Phase>) => options.run(input),
  });
}

export function harnessHooks(
  hooks: readonly HarnessHook[] | undefined,
): readonly HarnessHook[] {
  if (hooks === undefined) return [];
  invariant(Array.isArray(hooks), "Hooks must be an array");
  for (const hook of hooks)
    invariant(hook?.kind === "hook", "Declare hooks with defineHarnessHook");
  return Object.freeze([...hooks]);
}
