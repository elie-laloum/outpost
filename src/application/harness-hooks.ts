import { OutpostError } from "../domain/errors.ts";
import { validateHookDecision } from "../domain/hook-decision.ts";
import { HOOK_TIMEOUT_MS } from "../domain/hook.constants.ts";
import { hookSnapshot, hookSandbox, invokeHook } from "./hook-invocation.ts";
import type {
  HarnessHook,
  HarnessHookContext,
  HarnessHookEvents,
  HarnessHookInput,
  HarnessHookPhase,
  HarnessHookResult,
} from "../domain/hook.types.ts";
import type { ModelToolCallBlock } from "../domain/model.types.ts";
import type { ToolOutput } from "../domain/tool.types.ts";
import type {
  HarnessRuntime,
  ToolDenial,
  ToolOutcome,
} from "./harness.types.ts";

export async function sessionInstructions(
  runtime: HarnessRuntime,
  prompt: string,
): Promise<readonly string[]> {
  const texts: string[] = [];
  for (const decision of await each(
    runtime,
    "session-start",
    { prompt, source: runtime.startSource ?? "start" },
    0,
  )) {
    if (decision === undefined) continue;
    expect(
      typeof decision.instructions === "string",
      "session-start hooks may only return { instructions }",
    );
    texts.push(decision.instructions);
  }
  return texts;
}

export async function beforeTool(
  runtime: HarnessRuntime,
  call: ModelToolCallBlock,
  step: number,
): Promise<ToolDenial | ModelToolCallBlock> {
  let current = call;
  for (const hook of hooks(runtime, "before-tool")) {
    const decision = await runHook(runtime, hook, { call: current }, step);
    if (decision === undefined) continue;
    expect(
      decision !== null && typeof decision === "object",
      "before-tool hooks may return { deny } or { input }",
    );
    if ("deny" in decision) {
      expect(
        typeof decision.deny === "string" && decision.deny.trim() !== "",
        "before-tool deny reasons must be nonempty text",
      );
      return { deny: decision.deny };
    }
    expect(
      "input" in decision,
      "before-tool hooks may return { deny } or { input }",
    );
    current = { ...current, input: decision.input };
  }
  return current;
}

export async function afterTool(
  runtime: HarnessRuntime,
  call: ModelToolCallBlock,
  outcome: ToolOutcome,
  step: number,
  normalize: (output: ToolOutput) => ToolOutcome,
): Promise<ToolOutcome> {
  let current = outcome;
  for (const hook of hooks(runtime, "after-tool")) {
    const decision = await runHook(
      runtime,
      hook,
      {
        call,
        result: current,
        status: outcome.status ?? (outcome.isError ? "error" : "success"),
      },
      step,
    );
    if (decision === undefined) continue;
    expect(
      decision !== null && typeof decision === "object" && "result" in decision,
      "after-tool hooks may only return { result }",
    );
    current = normalize(decision.result);
  }
  return current;
}

export async function stopRequest(
  runtime: HarnessRuntime,
  text: string,
  step: number,
): Promise<string | undefined> {
  for (const hook of hooks(runtime, "stop")) {
    const decision = await runHook(runtime, hook, { text }, step);
    if (decision === undefined) continue;
    expect(
      decision !== null &&
        typeof decision === "object" &&
        typeof decision.continue === "string" &&
        decision.continue.trim() !== "",
      "stop hooks may only return { continue } with nonempty text",
    );
    return decision.continue;
  }
  return undefined;
}

export async function each<Phase extends HarnessHookPhase>(
  runtime: HarnessRuntime,
  phase: Phase,
  event: HarnessHookEvents[Phase],
  step: number,
): Promise<readonly HarnessHookResult<Phase>[]> {
  const decisions: HarnessHookResult<Phase>[] = [];
  for (const hook of hooks(runtime, phase)) {
    const decision = await runHook(runtime, hook, event, step);
    decisions.push(decision);
  }
  return decisions;
}

export function hooks<Phase extends HarnessHookPhase>(
  runtime: HarnessRuntime,
  phase: Phase,
): readonly HarnessHook<Phase>[] {
  return runtime.agent.harness.hooks.filter(
    (hook): hook is HarnessHook<Phase> => hook.on === phase,
  );
}

function context(runtime: HarnessRuntime, step: number): HarnessHookContext {
  runtime.signal.throwIfAborted();
  return {
    sandbox: runtime.sandbox,
    signal: runtime.signal,
    model: runtime.agent.model,
    step,
    depth: runtime.depth,
    ...(runtime.conversation ? { conversation: runtime.conversation } : {}),
    ...(runtime.subagentId ? { subagentId: runtime.subagentId } : {}),
  };
}

export async function runHook<Phase extends HarnessHookPhase>(
  runtime: HarnessRuntime,
  hook: HarnessHook<Phase>,
  event: HarnessHookEvents[Phase],
  step: number,
): Promise<HarnessHookResult<Phase>> {
  const release = runtime.hold();
  try {
    const decision = await invokeHook(
      hook.name,
      hook.timeoutMs ?? HOOK_TIMEOUT_MS,
      runtime.signal,
      (signal) =>
        hook.run({
          ...hookSnapshot(event),
          ...context(runtime, step),
          model: hookSnapshot(runtime.agent.model),
          sandbox: hookSandbox(runtime.sandbox, signal),
          signal,
        } as HarnessHookInput<Phase>),
    );
    validateHookDecision(hook.on, decision);
    runtime.emit({
      kind: "hook",
      phase: hook.on,
      changed: decision !== undefined,
    });
    return decision === undefined ? undefined : hookSnapshot(decision);
  } finally {
    release();
  }
}

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new OutpostError("configuration", message);
}
