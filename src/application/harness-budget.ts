import type { Usage } from "../domain/agent.types.ts";
import { OutpostError } from "../domain/errors.ts";
import type { HarnessLimits } from "../domain/harness.types.ts";
import { addUsage, validateTokenUsage } from "../domain/usage.ts";
import type { HarnessBudget } from "./harness-budget.types.ts";

export function harnessBudget(
  limits: HarnessLimits,
  parent?: HarnessBudget,
): HarnessBudget {
  let usage: Usage = { input: 0, cached: 0, output: 0 };
  let failure: unknown;
  return {
    check() {
      parent?.check();
      if (failure) throw failure;
    },
    account(result) {
      parent?.account(result);
      try {
        if (result.usage) {
          const tokens = result.usage;
          validateTokenUsage(tokens, "Harness usage");
          usage = addUsage(usage, tokens);
        }
        if (!limits.usage) return;
        if (!result.usage || result.usage.complete === false)
          throw new OutpostError(
            "configuration",
            "Harness usage limits require a model provider that reports usage completely",
          );
        const exceeded = Object.entries(limits.usage).find(
          ([key, value]) =>
            (usage[key as Exclude<keyof Usage, "complete" | "models">] ?? 0) >
            value,
        );
        if (exceeded)
          throw new OutpostError(
            "limit",
            `Harness exceeded its ${exceeded[0]} token budget`,
            { limit: "usage" },
          );
      } catch (error) {
        failure ??= error;
        throw error;
      }
    },
  };
}
