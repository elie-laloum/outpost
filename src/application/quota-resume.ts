import type { TaskContext } from "../domain/workflow.types.ts";
import { executionDefaults } from "./execution.constants.ts";
import type { DispatchOptions } from "./execution.types.ts";
import type { SandboxOptions } from "./outpost.types.ts";
import { quotaResumeInstructions } from "./quota-resume.constants.ts";
import type { QuotaResumePolicy } from "./quota-resume.types.ts";

export function quotaResumeBrief(tag?: string): string {
  return tag === undefined
    ? quotaResumeInstructions
    : `${quotaResumeInstructions}\nReturn the final answer inside <${tag}> and </${tag}>.`;
}

/** Continues the conversation interrupted by a quota pause when the dispatch allows it. */
export function quotaContinuation<O extends DispatchOptions<unknown>>(
  context: TaskContext,
  options: O,
  policy: QuotaResumePolicy = "continue",
): O {
  const conversation = context.quota?.conversation;
  if (
    policy === "restart" ||
    !conversation ||
    options.continuation ||
    options.agent?.kind === "fallback" ||
    options.agent?.resumable === false ||
    (options.passes ?? executionDefaults.passes) !== 1
  )
    return options;
  return {
    ...options,
    brief: { text: quotaResumeBrief(options.response?.tag) },
    continuation: { id: conversation },
  };
}

/** Starts an automatically integrated workspace from the interrupted branch. */
export function quotaWorkspace<
  T extends SandboxOptions & DispatchOptions<unknown>,
>(context: TaskContext, options: T, policy: QuotaResumePolicy = "continue"): T {
  const branch = context.quota?.branch;
  // Fallback agents rerun the brief on the interrupted work instead of continuing a conversation.
  const resumed =
    !!options.continuation ||
    (options.agent?.kind === "fallback" && policy === "continue");
  if (!branch || !resumed || options.workspace) return options;
  const integrated =
    options.branch?.mode === "integrate" ||
    (!options.branch && options.sandboxProvider?.placement === "remote");
  if (!integrated) return options;
  return { ...options, branch: { mode: "integrate", from: branch } };
}
