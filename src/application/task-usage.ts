import type { AgentObservation, Usage } from "../domain/agent.types.ts";
import { addUsage, usageDifference } from "../domain/usage.ts";
import type { TaskContext } from "../domain/workflow.types.ts";
import { notify } from "./observation.ts";
import type {
  TaskUsageObserver,
  TaskUsageDelivery,
} from "./task-usage.types.ts";

const accountingObservers = new WeakMap<
  (event: AgentObservation) => void,
  TaskUsageDelivery
>();

export function accountTaskUsage(
  observer: ((event: AgentObservation) => void) | undefined,
  event: AgentObservation,
): void {
  if (observer) accountingObservers.get(observer)?.account(event);
}

export function deliverTaskUsage(
  observer: ((event: AgentObservation) => void) | undefined,
  event: AgentObservation,
): void {
  const registered = observer && accountingObservers.get(observer);
  if (registered) return registered.deliver(event);
  observer?.(event);
}

export function taskUsage(
  context: Pick<TaskContext, "reportUsage">,
  observer: ((event: AgentObservation) => void) | undefined,
): TaskUsageObserver {
  const passes = new Map<number, Usage>();
  let total: Usage = { input: 0, cached: 0, output: 0 };
  function report(usage: Usage): void {
    if (
      usage.complete !== false &&
      ![usage.input, usage.cached, usage.output, usage.cacheCreated ?? 0].some(
        (value) => value > 0,
      )
    )
      return;
    total = addUsage(total, usage);
    context.reportUsage(usage);
  }
  function account(event: AgentObservation): void {
    if (event.kind === "usage" || event.kind === "summary") {
      const previous = passes.get(event.pass) ?? {
        input: 0,
        cached: 0,
        output: 0,
      };
      const delta =
        event.kind === "usage"
          ? event.tokens
          : usageDifference(event.tokens, previous);
      passes.set(event.pass, addUsage(previous, delta));
      report(delta);
    }
  }
  const observe = (event: AgentObservation) => {
    account(event);
    notify(observer, event);
  };
  accountingObservers.set(observe, {
    account,
    deliver: (event) => notify(observer, event),
  });
  return {
    observe,
    reconcile(usage) {
      report(usageDifference(usage, total));
    },
  };
}
