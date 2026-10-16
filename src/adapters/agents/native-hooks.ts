import { hookCommand } from "../../domain/hook-command.ts";
import type { AgentHookContext } from "../../domain/agent-hook.types.ts";
import { Ajv } from "ajv";
import { invariant, positive } from "../../domain/errors.ts";
import {
  HOOK_TIMEOUT_MS,
  HOOK_OUTPUT_BYTES,
} from "../../domain/hook.constants.ts";
import type {
  NativeHook,
  NativeHookOptions,
  NativeHookSchema,
} from "./native-hooks.types.ts";

const validator = new Ajv({ strict: false, allErrors: false });

export function defineNativeHook<
  Agent extends string,
  Phase extends string,
  Event,
  Result,
>(
  agent: Agent,
  schemas: Readonly<Record<Phase, NativeHookSchema>>,
  options: NativeHookOptions<Phase, Event, Result>,
): NativeHook<Agent, Phase> {
  invariant(
    options !== null && typeof options === "object",
    "Hook options must be an object",
  );
  invariant(
    Object.keys(options).every((key) =>
      ["on", "name", "matcher", "timeoutMs", "command", "run"].includes(key),
    ),
    "Unsupported native hook option",
  );
  invariant(
    Object.hasOwn(schemas, options.on),
    `Unsupported ${agent} hook event: ${options.on}`,
  );
  invariant(
    (typeof options.run === "function") !== (options.command !== undefined),
    "Hook requires exactly one of run or command",
  );
  invariant(
    options.name === undefined ||
      (typeof options.name === "string" && options.name.trim()),
    "Hook name must be nonempty text",
  );
  invariant(
    options.matcher === undefined || typeof options.matcher === "string",
    "Hook matcher must be text",
  );
  const timeoutMs = positive(
    options.timeoutMs ?? HOOK_TIMEOUT_MS,
    "Hook timeoutMs",
  );
  invariant(timeoutMs <= 600_000, "Native hook timeoutMs cannot exceed 600000");
  const schema = schemas[options.on];
  const input = validator.compile<Event>(schema.input);
  const output = validator.compile(schema.output);
  const command =
    options.command === undefined ? undefined : hookCommand(options.command);
  const callback = options.run;
  const phase = options.on;
  return Object.freeze({
    kind: "native-hook",
    agent,
    on: options.on,
    name: options.name ?? options.on,
    timeoutMs,
    ...(options.matcher === undefined ? {} : { matcher: options.matcher }),
    ...(command ? { command } : {}),
    async run(event: unknown, context: AgentHookContext) {
      invariant(
        input(event),
        `Invalid ${agent} ${phase} hook event: ${validator.errorsText(input.errors)}`,
      );
      invariant(callback, "Command hooks execute inside the sandbox");
      const result: unknown = await callback({ ...context, event });
      if (result === undefined) return "";
      if (schema.text && typeof result === "string") {
        invariant(
          Buffer.byteLength(result) <= HOOK_OUTPUT_BYTES,
          "Hook output exceeds its size limit",
        );
        return result;
      }
      invariant(
        output(result),
        `Invalid ${agent} ${phase} hook result: ${validator.errorsText(output.errors)}`,
      );
      const text = JSON.stringify(result);
      invariant(
        Buffer.byteLength(text) <= HOOK_OUTPUT_BYTES,
        "Hook output exceeds its size limit",
      );
      return text;
    },
  });
}

export function nativeHooks<Agent extends string, Phase extends string>(
  agent: Agent,
  hooks: readonly NativeHook<Agent, Phase>[] | undefined,
): readonly NativeHook<Agent, Phase>[] {
  if (hooks === undefined) return [];
  invariant(
    Array.isArray(hooks) &&
      hooks.every(
        (hook) =>
          hook !== null &&
          typeof hook === "object" &&
          hook.kind === "native-hook" &&
          hook.agent === agent &&
          typeof hook.run === "function",
      ),
    `Declare ${agent} hooks with its own hook factory`,
  );
  return Object.freeze([...hooks]);
}

export function composedNativeHooks<Agent extends string, Phase extends string>(
  agent: Agent,
  schemas: Readonly<Record<Phase, NativeHookSchema>>,
  profile: readonly NativeHook<Agent, string>[] | undefined,
  local: readonly NativeHook<Agent, Phase>[] | undefined,
): readonly NativeHook<Agent, Phase>[] {
  const hooks = [...nativeHooks(agent, profile), ...nativeHooks(agent, local)];
  invariant(
    hooks.every((hook): hook is NativeHook<Agent, Phase> =>
      Object.hasOwn(schemas, hook.on),
    ),
    `Unsupported ${agent} profile hook event`,
  );
  return Object.freeze(hooks);
}
