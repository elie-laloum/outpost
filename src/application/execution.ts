import type { AgentAdapter, Usage } from "../domain/agent.types.ts";
import { invariant } from "../domain/errors.ts";
import { ResponseError } from "../domain/response.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { addUsage } from "../domain/usage.ts";
import type { WorkspaceRecord } from "../domain/workspace.types.ts";
import { turn } from "./agent-turn.ts";
import { renderBrief } from "./brief-renderer.ts";
import { validateDispatch } from "./dispatch-validation.ts";
import { executionDefaults } from "./execution.constants.ts";
import type { DispatchOptions, Execution, Turn } from "./execution.types.ts";
import { notify } from "./observation.ts";

export { renderBrief } from "./brief-renderer.ts";
export { preflightDispatch, validateDispatch } from "./dispatch-validation.ts";
export type { DispatchOptions, Execution, Turn } from "./execution.types.ts";
export { notify } from "./observation.ts";

export async function execute<T>(
  workspace: WorkspaceRecord,
  lease: SandboxLease,
  agent: AgentAdapter,
  host: boolean,
  options: DispatchOptions<T>,
  afterTurn?: (turn: Turn) => Promise<Turn>,
): Promise<Execution<T>> {
  validateDispatch(options);
  const markers =
    options.until === undefined
      ? [executionDefaults.completion]
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
    : (options.passes ?? executionDefaults.passes);
  for (let index = 0; index < attempts; index++) {
    notify(options.observe, {
      kind: "phase",
      name: "preparing prompt",
      agent: agent.name,
      branch: workspace.branch,
      directory: workspace.directory,
      pass: index + 1,
      at: new Date().toISOString(),
    });
    const prompt =
      repair ??
      (await renderBrief(options.brief, workspace, lease, host, options));
    if (options.response && !repair)
      invariant(
        prompt.includes(`<${options.response.tag}>`),
        `Brief must request an opening <${options.response.tag}> tag`,
      );
    notify(options.observe, {
      kind: "prompt",
      text: prompt,
      pass: index + 1,
      at: new Date().toISOString(),
    });
    notify(options.observe, {
      kind: "phase",
      name: "running",
      agent: agent.name,
      branch: workspace.branch,
      pass: index + 1,
      at: new Date().toISOString(),
    });
    const finished = await turn(
      lease,
      agent,
      prompt,
      options,
      continuation,
      markers,
      index + 1,
    );
    const current = afterTurn ? await afterTurn(finished) : finished;
    turns.push(current);
    notify(options.observe, {
      kind: "summary",
      durationMs: current.durationMs,
      status: current.status,
      tokens: current.usage,
      pass: index + 1,
      at: new Date().toISOString(),
    });
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
        repair = [
          `Correct the response inside <${options.response.tag}> and </${options.response.tag}>.`,
          `Validation failure: ${error.message}`,
          `Previous content: ${error.raw ?? "No complete tagged response was returned."}`,
          `Cause: ${error.cause instanceof Error ? error.cause.message : (JSON.stringify(error.cause) ?? "unspecified")}`,
          `Further repair attempts after this one: ${attempts - index - 2}.`,
          "Do not edit files, run commands or continue implementation. Only return the corrected response.",
        ].join("\n");
      }
    }
    if (!options.response && completed) break;
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
    usage: turns.reduce((sum, item) => addUsage(sum, item.usage), {
      input: 0,
      cached: 0,
      output: 0,
    } as Usage),
  };
}
