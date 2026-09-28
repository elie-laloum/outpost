import { access } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { agentObservation } from "../domain/agent-observation.ts";
import type { Agent, Usage } from "../domain/agent.types.ts";
import type { DispatchTelemetrySession } from "../domain/dispatch-telemetry.types.ts";
import type {
  ObservationHub,
  ObservationSource,
} from "../domain/observation.types.ts";
import { createObservationHub } from "../domain/observation.ts";
import {
  recordRecovery,
  recoveryDetails,
  OutpostError,
} from "../domain/errors.ts";
import { addUsage } from "../domain/usage.ts";
import { journal } from "../infrastructure/journal.ts";
import type { Journal } from "../infrastructure/journal.types.ts";
import type { ObservedDispatchResult } from "./dispatch-observation.types.ts";
import type { DispatchOptions } from "./execution.types.ts";

const active = new WeakSet<ObservationHub>();

export async function observeDispatch<T, R extends ObservedDispatchResult>(
  options: DispatchOptions<T>,
  action: (options: DispatchOptions<T>) => Promise<R>,
  repository = process.cwd(),
): Promise<R> {
  if (options.observation && active.has(options.observation))
    return action(options);
  const root = options.observation ?? createObservationHub();
  const failures: unknown[] = [];
  let log: Journal | undefined;
  let session: DispatchTelemetrySession | undefined;
  const initialized = (async () => {
    try {
      await access(repository);
      log = await journal(repository, options.logging, options.label, false);
    } catch (error) {
      failures.push(error);
    }
  })();
  try {
    session = options.telemetry?.startDispatch();
  } catch (error) {
    failures.push(error);
  }
  const observation = root.child({ dispatchId: randomUUID() }, [
    {
      async observe(value) {
        await initialized;
        await log?.record({
          ...value.event,
          seq: value.seq,
          at: value.at,
          source: value.source,
          scope: value.scope,
        });
      },
      async flush() {
        await initialized;
        await log?.close();
      },
    },
    {
      observe(value) {
        if (value.event.kind === "warning")
          return options.warn?.(value.event.message);
      },
    },
    {
      observe(value) {
        if (value.source !== "agent" && value.source !== "harness") return;
        const event = agentObservation(value);
        if (event) return options.observe?.(event);
      },
      async flush() {
        const observer = options.observe;
        if (
          observer &&
          "flush" in observer &&
          typeof observer.flush === "function"
        )
          await observer.flush();
      },
    },
  ]);
  active.add(observation);
  observation.emit("sandbox", { kind: "dispatch-start" });
  const empty = (): Usage => ({ input: 0, cached: 0, output: 0 });
  let previous = empty(),
    current = empty();
  const { telemetry: _telemetry, ...settings } = options;
  const observed: DispatchOptions<T> = {
    ...settings,
    observation,
    warn(message) {
      observation.emit("agent", { kind: "warning", message });
    },
    observe(event) {
      if (event.kind === "phase" && event.name === "preparing prompt") {
        previous = addUsage(previous, current);
        current = empty();
      }
      if (event.kind === "usage") current = addUsage(current, event.tokens);
      if (event.kind === "summary") current = event.tokens;
      observation
        .child({
          pass: event.pass,
          ...(event.subagentId ? { subagentId: event.subagentId } : {}),
        })
        .emit(agentSource(options.agent), event);
    },
  };
  try {
    const result = await action(observed);
    observation.emit("sandbox", {
      kind: "dispatch-finished",
      status: "done",
      completed: result.completed,
      usage: result.usage,
      ...(result.branch ? { branch: result.branch } : {}),
      ...(result.commits ? { commits: result.commits } : {}),
    });
    try {
      session?.finish({
        status: "done",
        usage: result.usage,
        completed: result.completed,
      });
    } catch (error) {
      failures.push(error);
    }
    await finish();
    return {
      ...result,
      ...(log?.reference ? { logReference: log.reference } : {}),
      observerErrors: [...failures, ...observation.errors],
    };
  } catch (error) {
    const cancelled =
      options.signal?.aborted ||
      (error instanceof OutpostError && error.code === "aborted") ||
      (error instanceof Error && error.name === "AbortError");
    const status = cancelled ? "cancelled" : "failed";
    const usage = addUsage(previous, current);
    const recovery = recoveryDetails(error);
    observation.emit("sandbox", {
      kind: "dispatch-finished",
      status,
      completed: false,
      ...(typeof recovery?.branch === "string"
        ? { branch: recovery.branch }
        : {}),
      ...(Array.isArray(recovery?.commits) && recovery.commits.every(isCommit)
        ? { commits: recovery.commits }
        : {}),
      usage,
      error: {
        ...(error instanceof OutpostError ? { code: error.code } : {}),
        message: error instanceof Error ? error.message : String(error),
      },
    });
    try {
      session?.finish({ status, usage });
    } catch (failure) {
      failures.push(failure);
    }
    await finish();
    recordRecovery(error, {
      observerErrors: [...failures, ...observation.errors],
      ...(log?.reference ? { logReference: log.reference } : {}),
    });
    throw error;
  }
  async function finish(): Promise<void> {
    await observation.close();
    active.delete(observation);
  }
}

function agentSource(agent: Agent | undefined): ObservationSource {
  if (agent?.kind === "replay") return agent.source;
  return agent?.kind === "custom" ? "harness" : "agent";
}

function isCommit(
  value: unknown,
): value is import("../domain/workspace.types.ts").Commit {
  return (
    typeof value === "object" &&
    value !== null &&
    "oid" in value &&
    typeof value.oid === "string" &&
    "subject" in value &&
    typeof value.subject === "string"
  );
}
