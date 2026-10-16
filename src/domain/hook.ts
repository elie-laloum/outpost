import { hookCommand } from "./hook-command.ts";
import { invariant, OutpostError, positive } from "./errors.ts";
import {
  HOOK_FIELDS,
  HOOK_PHASES,
  HOOK_OUTPUT_BYTES,
  HOOK_TIMEOUT_MS,
} from "./hook.constants.ts";
import { validateHookDecision } from "./hook-decision.ts";
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
  if (options.command === undefined)
    invariant(typeof options.run === "function", "Hook run must be a function");
  invariant(
    (typeof options.run === "function") !== (options.command !== undefined),
    "Hook requires exactly one of run or command",
  );
  const command =
    options.command === undefined ? undefined : hookCommand(options.command);
  const callback = options.run;
  const phase = options.on;
  const name = options.name ?? phase;
  const timeoutMs = positive(
    options.timeoutMs ?? HOOK_TIMEOUT_MS,
    "Hook timeoutMs",
  );
  invariant(
    options.name === undefined ||
      (typeof options.name === "string" && options.name.trim()),
    "Hook name must be nonempty text",
  );
  return Object.freeze({
    kind: "hook",
    on: options.on,
    name: options.name ?? options.on,
    timeoutMs,
    async run(input: HarnessHookInput<Phase>) {
      if (callback) return callback(input);
      const { sandbox, signal, ...event } = input;
      let bytes = 0;
      const encoder = new TextEncoder();
      const result = await sandbox.invoke({
        ...command!,
        stdin: JSON.stringify(event, (_key, value: unknown) =>
          value instanceof Error
            ? { name: value.name, message: value.message }
            : value,
        ),
        signal,
        deadlineMs: timeoutMs,
        retain: HOOK_OUTPUT_BYTES + 1,
        observe(channel, chunk) {
          if (channel === "stdout") bytes += encoder.encode(chunk).byteLength;
        },
      });
      if (result.status !== 0)
        throw new OutpostError(
          "process",
          `Hook ${name} exited with status ${result.status}`,
        );
      invariant(
        Math.max(bytes, encoder.encode(result.stdout).byteLength) <=
          HOOK_OUTPUT_BYTES,
        "Hook output exceeds its size limit",
      );
      const decision: unknown = result.stdout.trim()
        ? JSON.parse(result.stdout)
        : undefined;
      validateHookDecision(phase, decision);
      return decision;
    },
  });
}

export function harnessHooks(
  hooks: readonly HarnessHook[] | undefined,
): readonly HarnessHook[] {
  if (hooks === undefined) return [];
  invariant(Array.isArray(hooks), "Hooks must be an array");
  for (const hook of hooks)
    invariant(
      hook?.kind === "hook" &&
        typeof hook.run === "function" &&
        HOOK_PHASES.has(hook.on) &&
        typeof hook.name === "string" &&
        hook.name.trim().length > 0 &&
        (hook.timeoutMs === undefined ||
          (Number.isFinite(hook.timeoutMs) && hook.timeoutMs > 0)),
      "Declare hooks with defineHarnessHook",
    );
  return Object.freeze([...hooks]);
}
