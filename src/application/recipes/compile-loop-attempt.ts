import { executeAgentTask, executeCommandTask } from "../task-execution.ts";
import { OutpostError } from "../../domain/errors.ts";
import { renderRecipeCommand } from "../../domain/recipe-templates.ts";
import { recipeLoopFollowUp } from "../../domain/recipes/loop.constants.ts";
import { recipeJson } from "../../domain/recipes/expressions.ts";
import { recipeDispatchProjection } from "./projection.ts";
import {
  loopAgent,
  loopStepLabel,
  phaseContext,
  runLoopStep,
} from "./compile-loop-steps.ts";
import type { RecipeLoopCommandStep } from "../../domain/recipes/loop.types.ts";
import type { LoopTaskContext } from "../../domain/workflow/loop-task.types.ts";
import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";
import type { RecipeCompilationContext } from "./compilation.types.ts";
import type {
  NormalizedRecipeLoopAttemptAgent,
  RecipeStepOf,
} from "./normalized.types.ts";
import type { RecipeLoopOutput } from "./compile-loop.types.ts";

function isOutput(value: WorkflowJson): value is RecipeLoopOutput {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** The previous round's output, cloned in memory or restored from its checkpoint. */
function previousOutput(value: unknown): RecipeLoopOutput | undefined {
  if (value === undefined) return undefined;
  const json = recipeJson(value);
  return isOutput(json) ? json : undefined;
}

function commits(output: RecipeLoopOutput | undefined): WorkflowJson[] {
  const value = output?.commits;
  return Array.isArray(value) ? value : [];
}

/** The conversation an attempt agent reported in the previous round, by its rank among agents. */
function previousConversation(
  previous: RecipeLoopOutput | undefined,
  rank: number,
  agents: number,
): WorkflowJson | undefined {
  if (agents === 1) return previous?.conversation;
  const conversations = previous?.conversations;
  return Array.isArray(conversations) ? conversations[rank] : undefined;
}

/** The last agent's projection, with every agent's commits of every round and the round count. */
function attemptOutput(
  projections: readonly RecipeLoopOutput[],
  previous: RecipeLoopOutput | undefined,
  round: number,
): RecipeLoopOutput {
  const output: Record<string, WorkflowJson> = Object.fromEntries(
    Object.entries(projections.at(-1) ?? {}).filter(
      ([key]) => key !== "usage" && key !== "turns",
    ),
  );
  if (
    projections.some((projection) => Array.isArray(projection.commits)) ||
    Array.isArray(previous?.commits)
  )
    output.commits = [
      ...commits(previous),
      ...projections.flatMap((projection) => commits(projection)),
    ];
  if (projections.length > 1)
    output.conversations = projections.map((projection) =>
      typeof projection.conversation === "string"
        ? projection.conversation
        : null,
    );
  return { ...output, rounds: round };
}

/** A failing attempt command fails the task, like an exception thrown by a TypeScript attempt. */
async function attemptCommand(
  item: RecipeLoopCommandStep,
  task: LoopTaskContext,
  { sandbox, text }: RecipeCompilationContext,
): Promise<void> {
  const command = renderRecipeCommand(item.command, (value) =>
    text(value, task, { round: task.round }),
  );
  await executeCommandTask({ sandbox: await sandbox(task), command }, task);
}

/** Runs the ordered attempt steps of one round and returns the round's output. */
export function compileLoopAttempt(
  step: RecipeStepOf<"declarative-loop">,
  context: RecipeCompilationContext,
) {
  const { bindings, sandbox, text } = context;
  const { attempt } = step.loop;
  const agents = attempt.filter(
    (item): item is NormalizedRecipeLoopAttemptAgent => item.kind === "agent",
  ).length;
  const quotaResume = step.quotaResume ? { quotaResume: step.quotaResume } : {};
  const brief = (
    item: NormalizedRecipeLoopAttemptAgent,
    continued: boolean,
    round: number,
  ): string => {
    if (round === 1) return item.brief;
    if (item.followUp !== undefined) return item.followUp;
    return continued ? recipeLoopFollowUp : item.brief;
  };
  const dispatch = async (
    item: NormalizedRecipeLoopAttemptAgent,
    rank: number,
    task: LoopTaskContext,
    feedback: string | undefined,
    previous: RecipeLoopOutput | undefined,
  ): Promise<RecipeLoopOutput> => {
    const continued = item.conversation === "continue" && task.round > 1;
    const conversation = previousConversation(previous, rank, agents);
    if (continued && typeof conversation !== "string")
      throw new OutpostError(
        "session",
        `Loop task ${step.key} cannot continue round ${task.round}: the previous attempt reported no conversation for agent ${item.agent}`,
        { key: step.key, round: task.round },
      );
    const request = {
      ...item.dispatch,
      agent: loopAgent(context, item.agent),
      brief: {
        text: text(brief(item, continued, task.round), task, {
          round: task.round,
          feedback: feedback ?? "",
        }),
      },
      ...(continued ? { continuation: { id: String(conversation) } } : {}),
    };
    await bindings.validateDispatch?.(request);
    const result = await executeAgentTask(
      { ...quotaResume, sandbox: await sandbox(task), request: () => request },
      phaseContext(task, agents),
    );
    return recipeDispatchProjection(result);
  };
  return async (
    task: LoopTaskContext,
    feedback: string | undefined,
    last: unknown,
  ): Promise<RecipeLoopOutput> => {
    const previous = previousOutput(last);
    const projections: RecipeLoopOutput[] = [];
    for (const [index, item] of attempt.entries()) {
      if (index > 0) task.signal.throwIfAborted();
      const label = loopStepLabel("attempt", index, item);
      await runLoopStep(step.key, task, label, async () => {
        if (item.kind === "command") return attemptCommand(item, task, context);
        projections.push(
          await dispatch(item, projections.length, task, feedback, previous),
        );
      });
    }
    return attemptOutput(projections, previous, task.round);
  };
}
