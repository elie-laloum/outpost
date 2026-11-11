import { executeAgentTask, runTaskCommand } from "../task-execution.ts";
import { validateLoopCheck } from "../../domain/workflow/loop-validation.ts";
import { defineJsonResponse } from "../../domain/response.ts";
import { OutpostError } from "../../domain/errors.ts";
import { renderRecipeCommand } from "../../domain/recipe-templates.ts";
import { recipeJson } from "../../domain/recipes/expressions.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import {
  recipeLoopCheckResponse,
  recipeLoopOutputCharacters,
} from "./compile-loop.constants.ts";
import {
  loopAgent,
  loopStepLabel,
  phaseContext,
  runLoopStep,
} from "./compile-loop-steps.ts";
import type { RecipeLoopCommandStep } from "../../domain/recipes/loop.types.ts";
import type { LoopCheckResult } from "../../domain/workflow/loop-task.types.ts";
import type { RecipeCompilationContext } from "./compilation.types.ts";
import type {
  NormalizedRecipeLoopCheckAgent,
  NormalizedRecipeLoopCheckStep,
  RecipeStepOf,
} from "./normalized.types.ts";
import type {
  RecipeLoopPhase,
  RecipeLoopStream,
  RecipeLoopVerdictKind,
  RecipeLoopVerdictStrategy,
} from "./compile-loop.types.ts";

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
  check: RecipeLoopCommandStep,
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

function refusal(value: unknown): LoopCheckResult {
  if (!recipeObject(value) || typeof value.feedback !== "string")
    throw new Error(
      "The check agent response requires a feedback string when done is false",
    );
  return { done: false, feedback: value.feedback };
}

/** The verdict a `{ done, feedback }` answer carries, without its other fields. */
function verdict(value: unknown): LoopCheckResult {
  validateLoopCheck(value);
  return value.done
    ? { done: true }
    : { done: false, feedback: value.feedback };
}

/** Verdict strategies of a check agent, by where its decision comes from. */
const verdicts: Readonly<
  Record<RecipeLoopVerdictKind, RecipeLoopVerdictStrategy>
> = {
  contract: (_check, agent) => ({
    response: defineJsonResponse<LoopCheckResult>({
      ...recipeLoopCheckResponse,
      repairs:
        agent.kind !== "fallback" && (agent.resumable ?? !!agent.storage)
          ? 1
          : 0,
      schema: verdict,
    }),
    decide: verdict,
  }),
  response: () => ({ decide: verdict }),
  condition: ({ done }, _agent, context) => ({
    decide: (value, task) =>
      done && context.condition(done, task, recipeJson(value))
        ? { done: true }
        : refusal(value),
  }),
};

function verdictKind(
  check: NormalizedRecipeLoopCheckAgent,
): RecipeLoopVerdictKind {
  if (!check.dispatch?.response) return "contract";
  return check.done ? "condition" : "response";
}

/** A check agent answers in a new conversation each round; its verdict strategy reads the answer. */
function agentCheck(
  check: NormalizedRecipeLoopCheckAgent,
  step: RecipeStepOf<"declarative-loop">,
  agents: number,
  context: RecipeCompilationContext,
): RecipeLoopPhase {
  const { bindings, sandbox, text } = context;
  const agent = loopAgent(context, check.agent);
  const verdict = verdicts[verdictKind(check)](check, agent, context);
  return async (task, output) => {
    const request = {
      ...check.dispatch,
      agent,
      brief: {
        text: text(check.brief, task, {
          round: task.round,
          text: typeof output.text === "string" ? output.text : "",
        }),
      },
      ...(verdict.response ? { response: verdict.response } : {}),
    };
    await bindings.validateDispatch?.(request);
    const result = await executeAgentTask(
      {
        ...(step.quotaResume ? { quotaResume: step.quotaResume } : {}),
        sandbox: await sandbox(task),
        request: () => request,
      },
      phaseContext(task, agents),
    );
    return verdict.decide(result.value, task);
  };
}

function checkRun(
  item: NormalizedRecipeLoopCheckStep,
  step: RecipeStepOf<"declarative-loop">,
  agents: number,
  context: RecipeCompilationContext,
): RecipeLoopPhase {
  if (item.kind === "command") return commandCheck(item, context);
  return agentCheck(item, step, agents, context);
}

/** Runs the ordered check steps; the first refusal ends the round with its feedback. */
export function compileLoopCheck(
  step: RecipeStepOf<"declarative-loop">,
  context: RecipeCompilationContext,
): RecipeLoopPhase {
  const { check } = step.loop;
  const agents = check.filter((item) => item.kind === "agent").length;
  const runs = check.map((item, index) => ({
    run: checkRun(item, step, agents, context),
    label: loopStepLabel("check", index, item),
  }));
  return async (task, output) => {
    for (const [index, { run, label }] of runs.entries()) {
      if (index > 0) task.signal.throwIfAborted();
      const result = await runLoopStep(step.key, task, label, () =>
        run(task, output),
      );
      if (!result.done) return result;
    }
    return { done: true };
  };
}
