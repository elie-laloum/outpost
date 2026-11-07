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
import type { CommandResult } from "../../domain/command.types.ts";
import type { DispatchAgent } from "../../domain/fallback-agent.types.ts";
import type { RecipeLoopCheck } from "../../domain/recipes/loop.types.ts";
import type {
  LoopCheckResult,
  LoopTaskContext,
} from "../../domain/workflow/loop-task.types.ts";
import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";
import type { Task } from "../../domain/workflow.types.ts";
import type { RecipeCompilationContext } from "./compilation.types.ts";
import type { RecipeStepOf } from "./normalized.types.ts";
import type { RecipeLoopOutput } from "./compile-loop.types.ts";

const checkResponse = defineJsonResponse<LoopCheckResult>({
  ...recipeLoopCheckResponse,
  schema(input) {
    validateLoopCheck(input);
    return input.done
      ? { done: true }
      : { done: false, feedback: input.feedback };
  },
});

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

function tail(text: string): string {
  if (text.length <= recipeLoopOutputCharacters) return text;
  return `[${text.length - recipeLoopOutputCharacters} characters omitted]\n${text.slice(-recipeLoopOutputCharacters)}`;
}

function commandFeedback(executable: string, result: CommandResult): string {
  const sections = [`${executable} exited with status ${result.status}.`];
  for (const [channel, output] of [
    ["stdout", result.stdout.trimEnd()],
    ["stderr", result.stderr.trimEnd()],
  ] as const)
    if (output.trim()) sections.push(`${channel}:\n${tail(output)}`);
  return sections.join("\n\n");
}

function compileCheck(
  check: RecipeLoopCheck,
  step: RecipeStepOf<"declarative-loop">,
  context: RecipeCompilationContext,
): (
  task: LoopTaskContext,
  output: RecipeLoopOutput,
) => Promise<LoopCheckResult> {
  const { bindings, sandbox, text } = context;
  switch (check.kind) {
    case "command":
      return async (task) => {
        const command = renderRecipeCommand(check.command, (value) =>
          text(value, task, { round: task.round }),
        );
        const result = await runTaskCommand(
          { sandbox: await sandbox(task), command },
          task,
        );
        return result.status === 0
          ? { done: true }
          : {
              done: false,
              feedback: commandFeedback(command.executable, result),
            };
      };
    case "agent": {
      const agent = loopAgent(context, check.agent);
      return async (task, output) => {
        const request = {
          agent,
          brief: {
            text: text(check.brief, task, {
              round: task.round,
              text: typeof output.text === "string" ? output.text : "",
            }),
          },
          response: checkResponse,
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
  const check = compileCheck(step.loop.check, step, context);
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
