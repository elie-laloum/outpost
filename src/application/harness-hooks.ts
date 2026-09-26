import { OutpostError } from "../domain/errors.ts";
import type {
  HarnessHook,
  HarnessHookContext,
  HarnessHookEvents,
  HarnessHookInput,
  HarnessHookPhase,
  HarnessHookResult,
} from "../domain/hook.types.ts";
import type {
  ModelMessage,
  ModelResult,
  ModelToolCallBlock,
} from "../domain/model.types.ts";
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
  for (const decision of await each(runtime, "session-start", { prompt }, 0)) {
    if (decision === undefined) continue;
    expect(
      typeof decision.instructions === "string",
      "session-start hooks may only return { instructions }",
    );
    texts.push(decision.instructions);
  }
  return texts;
}

export async function beforeModel(
  runtime: HarnessRuntime,
  messages: readonly ModelMessage[],
  step: number,
): Promise<void> {
  await each(runtime, "before-model", { messages }, step);
}

export async function afterModel(
  runtime: HarnessRuntime,
  result: ModelResult,
  step: number,
): Promise<void> {
  await each(runtime, "after-model", { result }, step);
}

export async function beforeTool(
  runtime: HarnessRuntime,
  call: ModelToolCallBlock,
  step: number,
): Promise<ToolDenial | ModelToolCallBlock> {
  let current = call;
  for (const hook of hooks(runtime, "before-tool")) {
    const decision = await hook.run({
      call: current,
      ...context(runtime, step),
    });
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
    const decision = await hook.run({
      call,
      result: current,
      ...context(runtime, step),
    });
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
    const decision = await hook.run({ text, ...context(runtime, step) });
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

async function each<Phase extends HarnessHookPhase>(
  runtime: HarnessRuntime,
  phase: Phase,
  event: HarnessHookEvents[Phase],
  step: number,
): Promise<readonly HarnessHookResult<Phase>[]> {
  const decisions: HarnessHookResult<Phase>[] = [];
  for (const hook of hooks(runtime, phase))
    decisions.push(
      await hook.run({
        ...event,
        ...context(runtime, step),
      } as HarnessHookInput<Phase>),
    );
  return decisions;
}

function hooks<Phase extends HarnessHookPhase>(
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
  };
}

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new OutpostError("configuration", message);
}
