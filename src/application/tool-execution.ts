import { OutpostError } from "../domain/errors.ts";
import {
  TOOL_PREVIEW_CHARACTERS,
  TOOL_RESULT_CHARACTERS,
} from "../domain/harness.constants.ts";
import type {
  ModelToolCallBlock,
  ModelToolResultBlock,
} from "../domain/model.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type {
  HarnessTool,
  HarnessToolEvent,
  ToolOutput,
} from "../domain/tool.types.ts";
import { afterTool, beforeTool } from "./harness-hooks.ts";
import type {
  HarnessRuntime,
  PreparedCall,
  ToolCallBatch,
  ToolOutcome,
  ValidatedInput,
} from "./harness.types.ts";

const toolEvents: ReadonlySet<string> = new Set(["text", "warning", "raw"]);

export async function executeToolCalls(
  runtime: HarnessRuntime,
  calls: readonly ModelToolCallBlock[],
  step: number,
  loaded: ReadonlySet<string>,
): Promise<readonly ModelToolResultBlock[]> {
  const tools = new Map(runtime.tools.map((tool) => [tool.name, tool]));
  const owners = new Map(
    runtime.agent.harness.skills.flatMap((skill) =>
      skill.tools.map((tool) => [tool.name, skill.name] as const),
    ),
  );
  const locked = (name: string) => {
    const skill = owners.get(name);
    return skill === undefined || loaded.has(skill) ? undefined : skill;
  };
  const prepared: PreparedCall[] = [];
  for (const call of calls)
    prepared.push(await prepareCall(runtime, tools, call, step, locked));
  const outcomes = new Map<string, ToolOutcome>();
  for (const batch of batches(prepared)) {
    const pending = [...batch.calls];
    const limit = batch.concurrent
      ? runtime.agent.harness.toolExecution.concurrency
      : 1;
    await Promise.all(
      Array.from({ length: Math.min(limit, pending.length) }, async () => {
        for (let next = pending.shift(); next; next = pending.shift())
          outcomes.set(next.call.id, await executeCall(runtime, next));
      }),
    );
  }
  const results: ModelToolResultBlock[] = [];
  for (const { call, outcome } of prepared)
    results.push(
      await finish(runtime, call, outcome ?? outcomes.get(call.id)!, step),
    );
  return results;
}

async function prepareCall(
  runtime: HarnessRuntime,
  tools: ReadonlyMap<string, HarnessTool>,
  call: ModelToolCallBlock,
  step: number,
  locked: (name: string) => string | undefined,
): Promise<PreparedCall> {
  runtime.signal.throwIfAborted();
  runtime.emit({
    kind: "tool",
    name: call.name,
    input: call.input,
    callId: call.id,
  });
  const tool = tools.get(call.name);
  if (!tool) return { call, outcome: failed(`Unknown tool: ${call.name}`) };
  const validated = await validate(tool, call.input, "Invalid input");
  if ("outcome" in validated) return { call, outcome: validated.outcome };
  const skill = locked(tool.name);
  if (skill)
    return denied(
      runtime,
      call,
      `Load the ${skill} skill with load_skill before using ${tool.name}`,
    );
  const permitted = permission(runtime, tool, validated.value);
  if (permitted) return denied(runtime, call, permitted);
  const decision = await beforeTool(
    runtime,
    { ...call, input: validated.value },
    step,
  );
  if ("deny" in decision) return denied(runtime, call, decision.deny);
  if (decision.input === validated.value)
    return { call, tool, input: validated.value };
  const revised = await validate(
    tool,
    decision.input,
    "Hook produced invalid input",
  );
  if ("outcome" in revised) return { call, outcome: revised.outcome };
  const revisedPermission = permission(runtime, tool, revised.value);
  if (revisedPermission) return denied(runtime, call, revisedPermission);
  return { call, tool, input: revised.value };
}

async function validate(
  tool: HarnessTool,
  input: unknown,
  label: string,
): Promise<ValidatedInput> {
  const validation = await tool.validate(input);
  if ("issues" in validation)
    return {
      outcome: failed(`${label} for ${tool.name}: ${validation.issues}`),
    };
  return { value: validation.value };
}

function permission(
  runtime: HarnessRuntime,
  tool: HarnessTool,
  input: unknown,
): string | undefined {
  const permissions = runtime.agent.harness.permissions;
  if (!permissions) return undefined;
  const decision = permissions.evaluate(tool.name, tool.resources(input));
  return decision.allowed ? undefined : decision.reason;
}

function denied(
  runtime: HarnessRuntime,
  call: ModelToolCallBlock,
  reason: string,
): PreparedCall {
  runtime.emit({
    kind: "tool-denied",
    callId: call.id,
    name: call.name,
    reason,
  });
  return { call, outcome: failed(`Denied: ${reason}`) };
}

async function finish(
  runtime: HarnessRuntime,
  call: ModelToolCallBlock,
  outcome: ToolOutcome,
  step: number,
): Promise<ModelToolResultBlock> {
  const final = await afterTool(runtime, call, outcome, step, normalized);
  const content =
    final.content.length > TOOL_RESULT_CHARACTERS
      ? `${final.content.slice(0, TOOL_RESULT_CHARACTERS)}\n[truncated ${final.content.length - TOOL_RESULT_CHARACTERS} characters]`
      : final.content;
  runtime.emit({
    kind: "tool-result",
    callId: call.id,
    name: call.name,
    isError: final.isError,
    preview: content.slice(0, TOOL_PREVIEW_CHARACTERS),
    characters: final.content.length,
  });
  return {
    type: "tool-result",
    callId: call.id,
    content,
    ...(final.isError ? { isError: true } : {}),
  };
}

function batches(calls: readonly PreparedCall[]): readonly ToolCallBatch[] {
  const grouped: ToolCallBatch[] = [];
  for (const prepared of calls) {
    if (prepared.outcome) continue;
    const concurrent = prepared.tool!.readOnly;
    const last = grouped.at(-1);
    if (last?.concurrent && concurrent) {
      grouped[grouped.length - 1] = {
        concurrent,
        calls: [...last.calls, prepared],
      };
      continue;
    }
    grouped.push({ concurrent, calls: [prepared] });
  }
  return grouped;
}

async function executeCall(
  runtime: HarnessRuntime,
  prepared: PreparedCall,
): Promise<ToolOutcome> {
  try {
    return normalized(await runTool(runtime, prepared));
  } catch (error) {
    runtime.signal.throwIfAborted();
    if (runtime.agent.harness.toolExecution.onError === "fail") throw error;
    return failed(error instanceof Error ? error.message : String(error));
  }
}

async function runTool(
  runtime: HarnessRuntime,
  { call, tool, input }: PreparedCall,
): Promise<ToolOutput> {
  const { deadlineMs } = runtime.agent.harness.toolExecution;
  const controller = new AbortController();
  const signal = AbortSignal.any([runtime.signal, controller.signal]);
  const timer = setTimeout(
    () =>
      controller.abort(
        new OutpostError(
          "timeout",
          `Tool ${call.name} timed out after ${deadlineMs} ms`,
        ),
      ),
    deadlineMs,
  );
  const release = runtime.hold();
  const aborted = new Promise<never>((_, reject) => {
    const fail = () => reject(signal.reason);
    if (signal.aborted) fail();
    signal.addEventListener("abort", fail, { once: true });
  });
  const execution = Promise.resolve().then(() =>
    tool!.execute(input, {
      sandbox: scopedLease(runtime.sandbox, signal),
      signal,
      callId: call.id,
      model: runtime.agent.model,
      observe(event: HarnessToolEvent) {
        signal.throwIfAborted();
        if (!toolEvents.has(event?.kind))
          throw new OutpostError(
            "configuration",
            "Tools may only report text, warning or raw events",
          );
        runtime.emit(event);
      },
    }),
  );
  execution.catch(() => undefined);
  aborted.catch(() => undefined);
  try {
    return await Promise.race([execution, aborted]);
  } finally {
    clearTimeout(timer);
    controller.abort(new OutpostError("aborted", "Tool call ended"));
    release();
  }
}

function scopedLease(lease: SandboxLease, signal: AbortSignal): SandboxLease {
  const combine = (own?: AbortSignal) =>
    own ? AbortSignal.any([own, signal]) : signal;
  return {
    root: lease.root,
    home: lease.home,
    invoke: (command) => {
      signal.throwIfAborted();
      return lease.invoke({ ...command, signal: combine(command.signal) });
    },
    upload: (source, destination, settings = {}) => {
      signal.throwIfAborted();
      return lease.upload(source, destination, {
        ...settings,
        signal: combine(settings.signal),
      });
    },
    download: (source, destination, settings = {}) => {
      signal.throwIfAborted();
      return lease.download(source, destination, {
        ...settings,
        signal: combine(settings.signal),
      });
    },
    release: () => lease.release(),
  };
}

function normalized(output: ToolOutput): ToolOutcome {
  if (typeof output === "string") return { content: output, isError: false };
  if (
    output === null ||
    typeof output !== "object" ||
    typeof output.content !== "string" ||
    (output.isError !== undefined && typeof output.isError !== "boolean")
  )
    throw new OutpostError(
      "configuration",
      "Tools must return text or { content, isError }",
    );
  return { content: output.content, isError: output.isError ?? false };
}

function failed(message: string): ToolOutcome {
  return { content: message, isError: true };
}
