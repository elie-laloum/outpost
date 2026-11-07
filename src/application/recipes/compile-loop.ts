import { executeAgentTask, runTaskCommand } from "../task-execution.ts";
import { defineLoopTask } from "../../domain/workflow/loop-task.ts";
import { validateLoopCheck } from "../../domain/workflow/loop-validation.ts";
import { defineJsonResponse } from "../../domain/response.ts";
import { OutpostError } from "../../domain/errors.ts";
import { renderRecipeCommand } from "../../domain/recipe-templates.ts";
import { recipeLoopFollowUp } from "../../domain/recipes/loop.constants.ts";
import { recipeJson } from "../../domain/recipes/expressions.ts";
import { recipeDispatchProjection } from "./projection.ts";
import {
  recipeLoopCheckResponse,
  recipeLoopOutputCharacters,
} from "./compile-loop.constants.ts";
import { configurationError } from "../../domain/configuration-diagnostic.ts";
import type { DispatchAgent } from "../../domain/fallback-agent.types.ts";
import type {
  RecipeLoopAgentCheck,
  RecipeLoopCommandCheck,
} from "../../domain/recipes/loop.types.ts";
import type { LoopCheckResult } from "../../domain/workflow/loop-task.types.ts";
import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";
import type { Task } from "../../domain/workflow.types.ts";
import type { RecipeCompilationContext } from "./compilation.types.ts";
import type { RecipeStepOf } from "./normalized.types.ts";
import type {
  RecipeLoopOutput,
  RecipeLoopPhase,
  RecipeLoopStream,
} from "./compile-loop.types.ts";

function loopAgent(
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

/** The last attempt's projection, with every round's commits and the round count. */
function attemptOutput(
  projection: RecipeLoopOutput,
  previous: RecipeLoopOutput | undefined,
  round: number,
): RecipeLoopOutput {
  const output = Object.fromEntries(
    Object.entries(projection).filter(
      ([key]) => key !== "usage" && key !== "turns",
    ),
  );
  if (Array.isArray(projection.commits) || Array.isArray(previous?.commits))
    output.commits = [...commits(previous), ...commits(projection)];
  return { ...output, rounds: round };
}

/** The tail of one output stream; `length` also counts what a bounded collector dropped. */
function tail({ channel, text, length }: RecipeLoopStream): string {
  const output = text.trimEnd();
  if (!output.trim()) return "";
  const kept = output.slice(-recipeLoopOutputCharacters);
  const omitted = length - text.length + output.length - kept.length;
  return omitted > 0
    ? `${channel}:\n[${omitted} characters omitted]\n${kept}`
    : `${channel}:\n${kept}`;
}

function commandFeedback(
  summary: string,
  streams: readonly RecipeLoopStream[],
): string {
  return [summary, ...streams.map(tail).filter(Boolean)].join("\n\n");
}

/** A command check fails on a nonzero exit or on its own deadline, keeping the output seen so far. */
function commandCheck(
  check: RecipeLoopCommandCheck,
  { sandbox, text }: RecipeCompilationContext,
): RecipeLoopPhase {
  return async (task) => {
    const command = renderRecipeCommand(check.command, (value) =>
      text(value, task, { round: task.round }),
    );
    const seen = new Map<RecipeLoopStream["channel"], RecipeLoopStream>();
    const observe = (channel: RecipeLoopStream["channel"], chunk: string) => {
      const stream = seen.get(channel);
      seen.set(channel, {
        channel,
        length: (stream?.length ?? 0) + chunk.length,
        text: ((stream?.text ?? "") + chunk).slice(-recipeLoopOutputCharacters),
      });
    };
    try {
      const result = await runTaskCommand(
        { sandbox: await sandbox(task), command: { ...command, observe } },
        task,
      );
      if (result.status === 0) return { done: true };
      return {
        done: false,
        feedback: commandFeedback(
          `${command.executable} exited with status ${result.status}.`,
          [
            {
              channel: "stdout",
              text: result.stdout,
              length: result.stdout.length,
            },
            {
              channel: "stderr",
              text: result.stderr,
              length: result.stderr.length,
            },
          ],
        ),
      };
    } catch (error) {
      if (
        task.signal.aborted ||
        !(error instanceof OutpostError) ||
        error.code !== "timeout"
      )
        throw error;
      return {
        done: false,
        feedback: commandFeedback(
          `${command.executable} did not finish: ${error.message}.`,
          [...seen.values()],
        ),
      };
    }
  };
}

/** An agent check answers { done, feedback } in a new conversation, with one repair when it can resume. */
function agentCheck(
  check: RecipeLoopAgentCheck,
  step: RecipeStepOf<"declarative-loop">,
  context: RecipeCompilationContext,
): RecipeLoopPhase {
  const { bindings, sandbox, text } = context;
  const agent = loopAgent(context, check.agent);
  const response = defineJsonResponse<LoopCheckResult>({
    ...recipeLoopCheckResponse,
    repairs:
      agent.kind !== "fallback" && (agent.resumable ?? !!agent.storage) ? 1 : 0,
    schema(input) {
      validateLoopCheck(input);
      return input.done
        ? { done: true }
        : { done: false, feedback: input.feedback };
    },
  });
  return async (task, output) => {
    const request = {
      agent,
      brief: {
        text: text(check.brief, task, {
          round: task.round,
          text: typeof output.text === "string" ? output.text : "",
        }),
      },
      response,
    };
    await bindings.validateDispatch?.(request);
    const result = await executeAgentTask(
      {
        ...(step.quotaResume ? { quotaResume: step.quotaResume } : {}),
        sandbox: await sandbox(task),
        request: () => request,
      },
      task,
    );
    return result.value;
  };
}

function compileCheck(
  step: RecipeStepOf<"declarative-loop">,
  context: RecipeCompilationContext,
): RecipeLoopPhase {
  const { check } = step.loop;
  switch (check.kind) {
    case "command":
      return commandCheck(check, context);
    case "agent":
      return agentCheck(check, step, context);
  }
}

/** Compiles an agent attempt and a command or agent check into a loop task in the shared workspace. */
export function compileDeclarativeLoop(
  step: RecipeStepOf<"declarative-loop">,
  context: RecipeCompilationContext,
): Task {
  const { common, bindings, sandbox, text } = context;
  const { maxRounds, attempt } = step.loop;
  const agent = loopAgent(context, attempt.agent);
  if (
    attempt.conversation === "continue" &&
    (agent.kind === "fallback" || agent.resumable === false)
  )
    throw configurationError(
      `${step.key}: agent ${attempt.agent} cannot continue its conversation between rounds`,
      `tasks.${step.key}.loop.attempt.conversation`,
      "unsupported-capability",
      "Set conversation: new, or choose an agent that resumes conversations.",
    );
  const check = compileCheck(step, context);
  return defineLoopTask<RecipeLoopOutput>({
    ...common,
    maxRounds,
    async attempt(task, feedback, last) {
      const previous = previousOutput(last);
      const values = { round: task.round, feedback: feedback ?? "" };
      const continued = attempt.conversation === "continue" && task.round > 1;
      const conversation = previous?.conversation;
      if (continued && typeof conversation !== "string")
        throw new OutpostError(
          "session",
          `Loop task ${step.key} cannot continue round ${task.round}: the previous attempt reported no conversation`,
          { key: step.key, round: task.round },
        );
      const request = {
        ...step.dispatch,
        agent,
        brief: {
          text: continued
            ? text(attempt.followUp ?? recipeLoopFollowUp, task, values)
            : text(attempt.brief, task, values),
        },
        ...(continued ? { continuation: { id: String(conversation) } } : {}),
      };
      await bindings.validateDispatch?.(request);
      const result = await executeAgentTask(
        {
          ...(step.quotaResume ? { quotaResume: step.quotaResume } : {}),
          sandbox: await sandbox(task),
          request: () => request,
        },
        task,
      );
      return attemptOutput(
        recipeDispatchProjection(result),
        previous,
        task.round,
      );
    },
    check,
  });
}
