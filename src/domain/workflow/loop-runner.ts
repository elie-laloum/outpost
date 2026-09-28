import { checkpointValue } from "./checkpoint-value.ts";
import { LoopTaskExhausted } from "./loop-task.ts";
import { validateLoopCheck } from "./loop-validation.ts";
import type { Task, WorkflowExecutionState } from "../workflow.types.ts";
import type {
  LoopDefinition,
  LoopRoundRecord,
  LoopTaskContext,
} from "./loop-task.types.ts";

export async function runLoopTask(
  item: Task,
  definition: LoopDefinition,
  runtime: WorkflowExecutionState,
): Promise<unknown> {
  const state = runtime.record(item);
  let rounds = state.rounds ?? Object.freeze([]);
  async function save(entry: LoopRoundRecord): Promise<void> {
    rounds = Object.freeze([
      ...rounds.filter((value) => value.round !== entry.round),
      Object.freeze(entry),
    ]);
    state.rounds = rounds;
    runtime.emit({
      type: "loop",
      key: item.key,
      attempt: state.attempts,
      round: entry.round,
      phase: entry.phase,
    });
    await runtime.persist();
  }
  while (true) {
    runtime.signal.throwIfAborted();
    const last = rounds.at(-1);
    if (last?.check?.done)
      return last.output?.kind === "json" ? last.output.value : undefined;
    if (last?.phase === "complete" && last.round === definition.maxRounds)
      throw new LoopTaskExhausted(
        item.key,
        definition.maxRounds,
        last.check?.done === false ? last.check.feedback : "",
      );
    const entry: LoopRoundRecord =
      last && last.phase !== "complete"
        ? last
        : { round: rounds.length + 1, phase: "attempt" };
    runtime.accounting.admit();
    state.attempts++;
    runtime.emit({ type: "attempt", key: item.key, attempt: state.attempts });
    await save(entry);
    const deadline = new AbortController();
    const timer =
      item.timeoutMs === undefined
        ? undefined
        : setTimeout(
            () => deadline.abort(new Error(`${item.key} timed out`)),
            item.timeoutMs,
          );
    const signal = AbortSignal.any([runtime.signal, deadline.signal]);
    const base = runtime.context(item, state.attempts, signal);
    const context = (phase: LoopTaskContext["phase"]): LoopTaskContext => ({
      ...base,
      round: entry.round,
      phase,
      idempotencyKey: `${base.idempotencyKey}:round:${entry.round}:${phase}`,
    });
    try {
      signal.throwIfAborted();
      let result: unknown =
        entry.output?.kind === "json"
          ? structuredClone(entry.output.value)
          : undefined;
      if (entry.phase === "attempt") {
        const previous = rounds.at(-2)?.check;
        result = await definition.attempt(
          context("attempt"),
          previous?.done === false ? previous.feedback : undefined,
        );
        signal.throwIfAborted();
        const output = runtime.options.checkpoint
          ? checkpointValue(result)
          : undefined;
        await save({
          round: entry.round,
          phase: "check",
          ...(output ? { output } : {}),
        });
      }
      signal.throwIfAborted();
      const checked = await definition.check(context("check"), result);
      signal.throwIfAborted();
      validateLoopCheck(checked);
      const check = Object.freeze(
        checked.done
          ? { done: true as const }
          : { done: false as const, feedback: checked.feedback },
      );
      await save({
        ...rounds.at(-1)!,
        phase: "complete",
        check,
        ...(runtime.options.checkpoint
          ? { output: checkpointValue(result) }
          : {}),
      });
      signal.throwIfAborted();
      if (check.done) return result;
    } finally {
      runtime.closeAttempt(item);
      clearTimeout(timer);
    }
  }
}
