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
import type {
  HarnessRuntime,
  ToolCallBatch,
  ToolOutcome,
} from "./harness.types.ts";

const toolEvents: ReadonlySet<string> = new Set(["text", "warning", "raw"]);

export async function executeToolCalls(
  runtime: HarnessRuntime,
  calls: readonly ModelToolCallBlock[],
): Promise<readonly ModelToolResultBlock[]> {
  const tools = new Map(
    runtime.agent.harness.tools.map((tool) => [tool.name, tool]),
  );
  const results = new Map<string, ModelToolResultBlock>();
  for (const batch of batches(calls, tools)) {
    const pending = [...batch.calls];
    const limit = batch.concurrent
      ? runtime.agent.harness.toolExecution.concurrency
      : 1;
    await Promise.all(
      Array.from({ length: Math.min(limit, pending.length) }, async () => {
        for (let call = pending.shift(); call; call = pending.shift())
          results.set(call.id, await executeToolCall(runtime, tools, call));
      }),
    );
  }
  return calls.map((call) => results.get(call.id)!);
}

function batches(
  calls: readonly ModelToolCallBlock[],
  tools: ReadonlyMap<string, HarnessTool>,
): readonly ToolCallBatch[] {
  const grouped: ToolCallBatch[] = [];
  for (const call of calls) {
    const concurrent = tools.get(call.name)?.readOnly ?? true;
    const last = grouped.at(-1);
    if (last?.concurrent && concurrent) {
      grouped[grouped.length - 1] = {
        concurrent,
        calls: [...last.calls, call],
      };
      continue;
    }
    grouped.push({ concurrent, calls: [call] });
  }
  return grouped;
}

async function executeToolCall(
  runtime: HarnessRuntime,
  tools: ReadonlyMap<string, HarnessTool>,
  call: ModelToolCallBlock,
): Promise<ModelToolResultBlock> {
  runtime.signal.throwIfAborted();
  runtime.emit({
    kind: "tool",
    name: call.name,
    input: call.input,
    callId: call.id,
  });
  const output = await toolOutput(runtime, tools.get(call.name), call);
  const content =
    output.content.length > TOOL_RESULT_CHARACTERS
      ? `${output.content.slice(0, TOOL_RESULT_CHARACTERS)}\n[truncated ${output.content.length - TOOL_RESULT_CHARACTERS} characters]`
      : output.content;
  runtime.emit({
    kind: "tool-result",
    callId: call.id,
    name: call.name,
    isError: output.isError,
    preview: content.slice(0, TOOL_PREVIEW_CHARACTERS),
    characters: output.content.length,
  });
  return {
    type: "tool-result",
    callId: call.id,
    content,
    ...(output.isError ? { isError: true } : {}),
  };
}

async function toolOutput(
  runtime: HarnessRuntime,
  tool: HarnessTool | undefined,
  call: ModelToolCallBlock,
): Promise<ToolOutcome> {
  if (!tool) return failed(`Unknown tool: ${call.name}`);
  const validation = await tool.validate(call.input);
  if ("issues" in validation)
    return failed(`Invalid input for ${call.name}: ${validation.issues}`);
  try {
    return normalized(await runTool(runtime, tool, call, validation.value));
  } catch (error) {
    runtime.signal.throwIfAborted();
    if (runtime.agent.harness.toolExecution.onError === "fail") throw error;
    return failed(error instanceof Error ? error.message : String(error));
  }
}

async function runTool(
  runtime: HarnessRuntime,
  tool: HarnessTool,
  call: ModelToolCallBlock,
  input: unknown,
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
    tool.execute(input, {
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
