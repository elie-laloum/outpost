import { setTimeout as delay } from "node:timers/promises";
import { invariant } from "../domain/errors.ts";
import { runDefaults } from "../domain/run.constants.ts";
import type {
  ReadRunOptions,
  WatchRunOptions,
  RunSnapshot,
  RunEvent,
} from "../domain/run.types.ts";
import { jsonObject } from "./transport-json.ts";
import {
  runPrefix,
  runSnapshot,
  runEvent,
  runInterval,
  runReadLimit,
} from "./run-storage.ts";

export async function readRun(
  options: ReadRunOptions,
): Promise<RunSnapshot | undefined> {
  const prefix = runPrefix(options.id);
  const object = await options.transporter.read(`${prefix}/index`, {
    maxBytes: runReadLimit(options.maxBytes),
    ...(options.signal ? { signal: options.signal } : {}),
  });
  if (!object) return undefined;
  const snapshot = runSnapshot(jsonObject(object));
  invariant(snapshot.id === options.id, "Run identity mismatch");
  if (
    snapshot.status === "running" &&
    Date.now() >= Date.parse(snapshot.expiresAt)
  )
    return { ...snapshot, status: "abandoned", complete: false };
  return snapshot;
}
export async function* watchRun(
  options: WatchRunOptions,
): AsyncIterable<RunEvent> {
  const prefix = runPrefix(options.id);
  const pollMs = runInterval(options.pollMs ?? runDefaults.pollMs, "pollMs");
  let from = options.from ?? 0;
  invariant(
    Number.isSafeInteger(from) && from >= 0,
    "from must be a nonnegative safe integer",
  );
  while (true) {
    options.signal?.throwIfAborted();
    const snapshot = await readRun(options);
    invariant(snapshot, "Run does not exist");
    invariant(from <= snapshot.seq, "Run cursor is ahead of the snapshot");
    while (from < snapshot.seq) {
      const object = await options.transporter.read(
        `${prefix}/events/${from + 1}`,
        {
          maxBytes: runReadLimit(options.maxBytes),
          ...(options.signal ? { signal: options.signal } : {}),
        },
      );
      invariant(object, "Run event is missing");
      const event = runEvent(jsonObject(object));
      invariant(event.seq === from + 1, "Run event sequence mismatch");
      from = event.seq;
      yield event;
    }
    if (snapshot.status !== "running") return;
    await delay(pollMs, undefined, { signal: options.signal });
  }
}
