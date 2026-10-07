import { runDefaults } from "../domain/run.constants.ts";
import { emptyRunUsage, projectRun } from "../domain/run.ts";
import { invariant } from "../domain/errors.ts";
import type {
  RunObserver,
  RunObserverOptions,
  RunSnapshot,
} from "../domain/run.types.ts";
import { jsonBytes, jsonObject } from "./transport-json.ts";
import { runInterval, runPrefix, runSnapshot } from "./run-storage.ts";

export async function createRunObserver(
  options: RunObserverOptions,
): Promise<RunObserver> {
  const prefix = runPrefix(options.id);
  invariant(
    options.kind === "workflow" || options.kind === "dispatch",
    "Invalid run kind",
  );
  invariant(
    !options.resume || options.kind === "workflow",
    "Only workflow projections can resume",
  );
  const heartbeatMs = runInterval(
    options.heartbeatMs ?? runDefaults.heartbeatMs,
    "heartbeatMs",
  );
  const abandonAfterMs = runInterval(
    options.abandonAfterMs ?? runDefaults.abandonAfterMs,
    "abandonAfterMs",
  );
  invariant(
    abandonAfterMs > heartbeatMs,
    "abandonAfterMs must exceed heartbeatMs",
  );
  const transporter = options.transporter;
  const now = new Date().toISOString();
  const previous = options.resume
    ? await transporter.read(`${prefix}/index`, {
        maxBytes: runDefaults.maxBytes,
      })
    : undefined;
  if (options.resume) invariant(previous, "Run to resume does not exist");
  const initial = previous ? runSnapshot(jsonObject(previous)) : undefined;
  if (initial) {
    invariant(
      initial.id === options.id && initial.kind === options.kind,
      "Run identity mismatch",
    );
    invariant(
      initial.status !== "running",
      "Cannot resume an unsettled run projection; use a new ID after explicit execution recovery",
    );
  }
  let snapshot: RunSnapshot = initial
    ? { ...initial, status: "running", observationSeq: 0 }
    : {
        version: 1,
        id: options.id,
        kind: options.kind,
        status: "running",
        seq: 0,
        observationSeq: 0,
        complete: true,
        startedAt: now,
        updatedAt: now,
        heartbeatAt: now,
        expiresAt: now,
        tasks: [],
        dispatches: [],
        commits: [],
        usage: emptyRunUsage(),
        errors: [],
      };
  function heartbeat(value: RunSnapshot): RunSnapshot {
    const time = Date.now();
    return {
      ...value,
      heartbeatAt: new Date(time).toISOString(),
      expiresAt: new Date(time + abandonAfterMs).toISOString(),
    };
  }
  snapshot = heartbeat(snapshot);
  let entry = await transporter.write(`${prefix}/index`, jsonBytes(snapshot), {
    ifRevision: previous?.revision ?? null,
  });
  let pending = Promise.resolve();
  let failed = false;
  let failure: unknown;
  let closed = false;
  let closing: Promise<void> | undefined;
  const errors: unknown[] = [];
  async function save(next: RunSnapshot): Promise<void> {
    const bytes = jsonBytes(next);
    invariant(
      bytes.byteLength <= runDefaults.maxBytes,
      "Run snapshot exceeds byte limit",
    );
    entry = await transporter.write(entry.key, bytes, {
      ifRevision: entry.revision,
    });
    snapshot = next;
    if (next.status !== "running") clearInterval(timer);
  }
  function enqueue(action: () => Promise<void>): Promise<void> {
    const operation = pending.then(async () => {
      if (failed) throw failure;
      await action();
    });
    pending = operation.catch((error: unknown) => {
      if (!failed) {
        failed = true;
        failure = error;
        errors.push(error);
      }
      clearInterval(timer);
    });
    return operation;
  }
  let heartbeatPending = false;
  const timer = setInterval(() => {
    if (closed || heartbeatPending || snapshot.status !== "running") return;
    heartbeatPending = true;
    void enqueue(() => save(heartbeat(snapshot)))
      .catch(() => {})
      .finally(() => {
        heartbeatPending = false;
      });
  }, heartbeatMs);
  timer.unref();
  const observer: RunObserver = {
    errors,
    observe(observation) {
      if (closed) throw new Error("Run observer is closed");
      const copy = structuredClone(observation);
      return enqueue(async () => {
        invariant(
          snapshot.status === "running",
          "Run projection is already settled",
        );
        const next = heartbeat(projectRun(snapshot, copy));
        const bytes = jsonBytes({
          ...copy,
          observationSeq: copy.seq,
          seq: next.seq,
        });
        invariant(
          bytes.byteLength <= runDefaults.maxBytes,
          "Run event exceeds byte limit",
        );
        await transporter.write(`${prefix}/events/${next.seq}`, bytes, {
          ifRevision: null,
        });
        await save(next);
      });
    },
    async flush() {
      await pending;
      if (failed) throw failure;
    },
    close() {
      closing ??= (async () => {
        closed = true;
        clearInterval(timer);
        await observer.flush?.();
      })();
      return closing;
    },
    [Symbol.asyncDispose]() {
      return observer.close();
    },
  };
  return observer;
}
