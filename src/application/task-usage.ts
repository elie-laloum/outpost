import type { AgentObservation, Usage } from "../domain/agent.types.ts";
import { addUsage } from "../domain/usage.ts";
import type { TaskContext } from "../domain/workflow.types.ts";
import { notify } from "./observation.ts";
import type { TaskUsageObserver } from "./task-usage.types.ts";

export function taskUsage(
  context: Pick<TaskContext, "reportUsage">,
  observer: ((event: AgentObservation) => void) | undefined,
): TaskUsageObserver {
  const passes = new Map<number, Usage>();
  let total: Usage = { input: 0, cached: 0, output: 0 };
  function difference(next: Usage, previous: Usage): Usage {
    return {
      input: Math.max(0, next.input - previous.input),
      cached: Math.max(0, next.cached - previous.cached),
      output: Math.max(0, next.output - previous.output),
      cacheCreated: Math.max(
        0,
        (next.cacheCreated ?? 0) - (previous.cacheCreated ?? 0),
      ),
    };
  }
  function report(usage: Usage): void {
    if (!Object.values(usage).some((value) => value > 0)) return;
    total = addUsage(total, usage);
    context.reportUsage(usage);
  }
  return {
    observe(event) {
      if (event.kind === "usage" || event.kind === "summary") {
        const previous = passes.get(event.pass) ?? {
          input: 0,
          cached: 0,
          output: 0,
        };
        const delta =
          event.kind === "usage"
            ? event.tokens
            : difference(event.tokens, previous);
        passes.set(event.pass, addUsage(previous, delta));
        report(delta);
      }
      notify(observer, event);
    },
    reconcile(usage) {
      report(difference(usage, total));
    },
  };
}
