import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { OutpostError, invariant, positive } from "../domain/errors.ts";
import type {
  AgentAdapter,
  AgentEvent,
  SandboxLease,
  Usage,
  WorkspaceRecord,
} from "../domain/ports.ts";
import { prepareBrief, validateBrief, type Brief } from "../domain/prompts.ts";
import { ResponseError, type ResponseSpec } from "../domain/response.ts";
import { shell } from "../infrastructure/process.ts";
import type { Logging } from "../infrastructure/journal.ts";

export interface DispatchOptions<T = undefined> {
  readonly agent?: AgentAdapter;
  readonly logging?: Logging;
  readonly label?: string;
  readonly brief: Brief;
  readonly passes?: number;
  readonly until?: string | readonly string[];
  readonly idleMs?: number;
  readonly settleMs?: number;
  readonly deadlineMs?: number;
  readonly expansionMs?: number;
  readonly signal?: AbortSignal;
  readonly continuation?: { readonly id: string; readonly fork?: boolean };
  readonly response?: ResponseSpec<T>;
  readonly observe?: (event: AgentEvent) => void;
  readonly warn?: (message: string) => void;
}

export interface Turn {
  readonly text: string;
  readonly status: number;
  readonly conversation?: string;
  readonly usage: Usage;
  readonly durationMs: number;
}

export interface Execution<T> {
  readonly text: string;
  readonly turns: readonly Turn[];
  readonly usage: Usage;
  readonly conversation?: string;
  readonly value: T;
  readonly completed: boolean;
  readonly completion?: string;
}

export function notify<T>(
  observer: ((value: T) => void) | undefined,
  value: T,
): void {
  try {
    observer?.(value);
  } catch {
    /* Observers cannot change execution outcomes. */
  }
}

export async function renderBrief(
  brief: Brief,
  workspace: WorkspaceRecord,
  lease: SandboxLease,
  host: boolean,
  options: Pick<DispatchOptions, "signal" | "expansionMs" | "warn">,
): Promise<string> {
  if (brief.text !== undefined) return brief.text;
  const source = await readFile(
    resolve(workspace.repository, brief.file),
    "utf8",
  );
  const prepared = prepareBrief(source, brief.values, {
    WORK_BRANCH: workspace.branch,
    BASE_BRANCH: workspace.baseBranch,
  });
  if (prepared.unused.length)
    notify(
      options.warn,
      `Unused prompt variables: ${prepared.unused.join(", ")}`,
    );
  const controller = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;
  const pending = prepared.fragments.map(async (fragment) => {
    if (fragment.kind === "literal") return fragment.value;
    try {
      const command = host
        ? shell(fragment.value)
        : { executable: "sh", arguments: ["-c", fragment.value] };
      const result = await lease.invoke({
        ...command,
        signal,
        deadlineMs: options.expansionMs ?? 30_000,
      });
      if (result.status !== 0)
        throw new OutpostError("prompt", "Prompt command failed", {
          command: fragment.value,
          ...result,
        });
      return result.stdout.trimEnd();
    } catch (cause) {
      controller.abort(cause);
      throw cause;
    }
  });
  const results = await Promise.allSettled(pending);
  const failure = results.find((result) => result.status === "rejected");
  if (failure?.status === "rejected") throw failure.reason;
  return results
    .map((result) => (result as PromiseFulfilledResult<string>).value)
    .join("");
}

export function validateDispatch(options: DispatchOptions<unknown>): void {
  validateBrief(options.brief);
  positive(options.passes ?? 1, "passes");
  invariant(
    Number.isSafeInteger(options.passes ?? 1),
    "passes must be an integer",
  );
  for (const key of [
    "idleMs",
    "settleMs",
    "deadlineMs",
    "expansionMs",
  ] as const)
    if (options[key] !== undefined) positive(options[key], key);
  if (options.response || options.continuation)
    invariant(
      (options.passes ?? 1) === 1,
      "Structured responses and continuations require one pass",
    );
  const markers =
    options.until === undefined
      ? []
      : typeof options.until === "string"
        ? [options.until]
        : options.until;
  invariant(
    markers.every((marker) => marker.length > 0),
    "Completion markers cannot be empty",
  );
}

async function turn(
  lease: SandboxLease,
  agent: AgentAdapter,
  prompt: string,
  options: DispatchOptions<unknown>,
  continuation: DispatchOptions["continuation"],
  markers: readonly string[],
): Promise<Turn> {
  const start = Date.now();
  const controller = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;
  let idle: NodeJS.Timeout | undefined, settle: NodeJS.Timeout | undefined;
  let pending = "",
    text = "",
    conversation: string | undefined,
    failure: string | undefined;
  let usage: Usage = { input: 0, cached: 0, output: 0 };
  let completed = false;
  const refresh = () => {
    clearTimeout(idle);
    clearTimeout(settle);
    if (!completed)
      idle = setTimeout(
        () =>
          controller.abort(
            new OutpostError(
              "timeout",
              "Agent produced no output before the idle deadline",
            ),
          ),
        options.idleMs ?? 600_000,
      );
    if (completed)
      settle = setTimeout(
        () => controller.abort("completion"),
        options.settleMs ?? 60_000,
      );
  };
  const consume = (line: string) => {
    for (const event of agent.events(line)) {
      if (event.kind === "text") text += event.text;
      if (event.kind === "conversation") conversation = event.id;
      if (event.kind === "failure") failure = event.message;
      if (event.kind === "usage")
        usage = {
          input: usage.input + event.tokens.input,
          cached: usage.cached + event.tokens.cached,
          output: usage.output + event.tokens.output,
        };
      notify(options.observe, event);
    }
    completed = markers.some((marker) => text.includes(marker));
  };
  refresh();
  let status = 0;
  try {
    const command = agent.request({
      text: prompt,
      ...(continuation ? { continuation } : {}),
    });
    const result = await lease.invoke({
      ...command,
      signal,
      deadlineMs: options.deadlineMs ?? 3_600_000,
      observe(channel, chunk) {
        if (channel === "stdout") {
          pending += chunk;
          let end: number;
          while ((end = pending.indexOf("\n")) >= 0) {
            consume(pending.slice(0, end));
            pending = pending.slice(end + 1);
          }
          if (pending.length > 16_777_216)
            controller.abort(
              new OutpostError("process", "Agent emitted an oversized event"),
            );
        }
        refresh();
      },
    });
    status = result.status;
    if (pending) consume(pending);
    if (status !== 0)
      throw new OutpostError("process", `Agent exited with status ${status}`, {
        ...result,
        conversation,
      });
  } catch (cause) {
    if (options.signal?.aborted)
      throw new OutpostError(
        "aborted",
        "Dispatch cancelled",
        { conversation },
        cause,
      );
    if (controller.signal.reason !== "completion")
      throw controller.signal.reason instanceof OutpostError
        ? controller.signal.reason
        : cause;
    notify(
      options.warn,
      "Agent remained active after completion; its command was stopped and trailing output retained",
    );
  } finally {
    clearTimeout(idle);
    clearTimeout(settle);
  }
  if (failure) throw new OutpostError("process", failure, { conversation });
  return {
    text,
    status,
    usage,
    durationMs: Date.now() - start,
    ...(conversation ? { conversation } : {}),
  };
}

export async function execute<T>(
  workspace: WorkspaceRecord,
  lease: SandboxLease,
  agent: AgentAdapter,
  host: boolean,
  options: DispatchOptions<T>,
): Promise<Execution<T>> {
  validateDispatch(options);
  const markers =
    options.until === undefined
      ? ["<outpost>done</outpost>"]
      : typeof options.until === "string"
        ? [options.until]
        : options.until;
  const turns: Turn[] = [];
  let value: T = undefined as T,
    completed = false,
    continuation = options.continuation;
  let repair: string | undefined;
  const attempts = options.response
    ? 1 + options.response.repairs
    : (options.passes ?? 1);
  for (let index = 0; index < attempts; index++) {
    const prompt =
      repair ??
      (await renderBrief(options.brief, workspace, lease, host, options));
    if (options.response && !repair)
      invariant(
        prompt.includes(`<${options.response.tag}>`),
        `Brief must request an opening <${options.response.tag}> tag`,
      );
    notify(options.observe, { kind: "prompt", text: prompt });
    const current = await turn(
      lease,
      agent,
      prompt,
      options,
      continuation,
      markers,
    );
    turns.push(current);
    completed = markers.some((marker) => current.text.includes(marker));
    if (options.response) {
      try {
        value = await options.response.read(current.text);
        completed = true;
        break;
      } catch (error) {
        if (!(error instanceof ResponseError)) throw error;
        error.recovery = {
          conversation: current.conversation,
          branch: workspace.branch,
          directory: workspace.directory,
          turns,
        };
        if (index + 1 >= attempts || !current.conversation) throw error;
        continuation = { id: current.conversation };
        repair = `Your response could not be validated: ${error.message}. Return a corrected response inside <${options.response.tag}> and </${options.response.tag}>.`;
      }
    } else if (completed) break;
  }
  const conversation = turns.at(-1)?.conversation;
  const completion = markers.find((marker) =>
    turns.at(-1)?.text.includes(marker),
  );
  return {
    text: turns.map((item) => item.text).join("\n"),
    turns,
    value,
    completed,
    ...(completion ? { completion } : {}),
    ...(conversation ? { conversation } : {}),
    usage: turns.reduce(
      (sum, item) => ({
        input: sum.input + item.usage.input,
        cached: sum.cached + item.usage.cached,
        output: sum.output + item.usage.output,
      }),
      { input: 0, cached: 0, output: 0 },
    ),
  };
}
