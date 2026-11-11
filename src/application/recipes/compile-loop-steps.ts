import { dispatchCandidates } from "../../domain/fallback-agent.ts";
import type { DispatchAgent } from "../../domain/fallback-agent.types.ts";
import type { LoopTaskContext } from "../../domain/workflow/loop-task.types.ts";
import type { RecipeCompilationContext } from "./compilation.types.ts";
import type { RecipeLoopPhaseName } from "../../domain/recipes/loop.types.ts";
import type { RecipeLoopStepLabel } from "./compile-loop.types.ts";
import type {
  NormalizedRecipeLoopAttemptStep,
  NormalizedRecipeLoopCheckStep,
} from "./normalized.types.ts";

export function loopAgent(
  { bindings }: RecipeCompilationContext,
  role: string,
): DispatchAgent {
  const agent =
    bindings.agents && Object.hasOwn(bindings.agents, role)
      ? bindings.agents[role]
      : undefined;
  if (!agent) throw new Error(`Unknown recipe agent: ${role}`);
  return agent;
}

export function loopStepLabel(
  phase: RecipeLoopPhaseName,
  index: number,
  step: NormalizedRecipeLoopAttemptStep | NormalizedRecipeLoopCheckStep,
): RecipeLoopStepLabel {
  return {
    phase,
    rank: index + 1,
    ...(step.kind === "agent"
      ? { agent: step.agent }
      : { command: step.command.executable }),
  };
}

/** Fallback agents restart from the brief, so they never resume a conversation. */
export function resumesConversation(agent: DispatchAgent): boolean {
  return agent.kind !== "fallback" && agent.resumable !== false;
}

/** Dispatch preflight rule for response repairs, applied to each candidate of a fallback agent. */
export function repairsResponses(agent: DispatchAgent): boolean {
  return dispatchCandidates(agent).every(
    (candidate) => candidate.resumable ?? !!candidate.storage,
  );
}

/** A quota pause names no agent: only a phase with one agent may resume its conversation. */
export function phaseContext(
  task: LoopTaskContext,
  agents: number,
): LoopTaskContext {
  if (agents <= 1) return task;
  const { quota: _quota, ...context } = task;
  return context;
}

/** Names the step in the message and keeps the error itself, so its class, code and recovery survive. */
function located(
  error: unknown,
  key: string,
  round: number,
  label: RecipeLoopStepLabel,
): unknown {
  const subject =
    label.agent === undefined
      ? `command ${label.command}`
      : `agent ${label.agent}`;
  const where = `Loop task ${key}, round ${round}, ${label.phase} step ${label.rank} (${subject})`;
  if (!(error instanceof Error))
    return new Error(`${where}: ${String(error)}`, { cause: error });
  if (!Object.getOwnPropertyDescriptor(error, "message")?.writable)
    return error;
  error.message = `${where}: ${error.message}`;
  return error;
}

/** Runs one loop step, naming the task, round, phase and step in its failure. */
export async function runLoopStep<T>(
  key: string,
  task: LoopTaskContext,
  label: RecipeLoopStepLabel,
  run: () => Promise<T>,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (task.signal.aborted) throw error;
    throw located(error, key, task.round, label);
  }
}
