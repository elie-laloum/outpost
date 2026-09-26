import { verboseOnly } from "./journal.constants.ts";
import { transportDefaults } from "./transport.constants.ts";
import { readLimit } from "./transport-envelope.ts";
import { randomUUID } from "node:crypto";
import type {
  Transport,
  TransportReference,
} from "../domain/transport.types.ts";
import type { Journal } from "./journal.types.ts";
import type {
  JournalSnapshot,
  ReadJournalOptions,
} from "./transport-journal.types.ts";
import {
  jsonBytes,
  jsonObject,
  readReference,
  transportReference,
} from "./transport-json.ts";
import { positive } from "../domain/errors.ts";

export function journalSnapshot(value: unknown): JournalSnapshot {
  if (
    !value ||
    typeof value !== "object" ||
    !("closed" in value) ||
    typeof value.closed !== "boolean" ||
    !("head" in value)
  )
    throw new Error("Invalid journal snapshot");
  return {
    closed: value.closed,
    head: value.head === null ? null : transportReference(value.head),
  };
}

export async function transportJournal(
  transporter: Transport,
  verbose: boolean,
  label?: string,
): Promise<Journal> {
  const prefix = `logs/${randomUUID()}`;
  let head: TransportReference | null = null;
  let current = await transporter.write(
    `${prefix}/index`,
    jsonBytes({ closed: false, head }),
    { ifRevision: null },
  );
  let closing: Promise<void> | undefined;
  let pending = Promise.resolve();
  let failure: unknown;
  const append = async (event: unknown) => {
    const segment = await transporter.write(
      `${prefix}/${randomUUID()}`,
      jsonBytes({ previous: head, event }),
      { ifRevision: null },
    );
    current = await transporter.write(
      current.key,
      jsonBytes({ closed: false, head: segment }),
      { ifRevision: current.revision },
    );
    head = segment;
  };
  await append({ kind: "dispatch-start", at: new Date().toISOString(), label });
  return {
    get reference() {
      return { key: current.key, revision: current.revision };
    },
    record(event) {
      if (closing || (verboseOnly.has(event.kind) && !verbose)) return;
      try {
        const value = structuredClone({
          at: new Date().toISOString(),
          ...(label ? { label } : {}),
          ...event,
        });
        pending = pending
          .then(async () => {
            if (!failure) await append(value);
          })
          .catch((error) => {
            failure = error;
          });
      } catch (error) {
        failure = error;
      }
    },
    close() {
      closing ??= (async () => {
        await pending;
        if (failure) throw failure;
        current = await transporter.write(
          current.key,
          jsonBytes({ closed: true, head }),
          { ifRevision: current.revision },
        );
      })();
      return closing;
    },
  };
}

export async function readJournal(
  options: ReadJournalOptions,
): Promise<readonly unknown[]> {
  const maxEntries = positive(
    options.maxEntries ?? transportDefaults.maxEntries,
    "maxEntries",
  );
  const snapshot = journalSnapshot(
    jsonObject(await readReference(options.transporter, options.reference)),
  );
  let next = snapshot.head;
  let remaining = readLimit(options.maxBytes);
  const events: unknown[] = [];
  const seen = new Set<string>();
  while (next) {
    if (events.length >= maxEntries || seen.has(next.key))
      throw new Error("Journal entry limit or cycle");
    seen.add(next.key);
    const object = await readReference(options.transporter, next, remaining);
    remaining -= object.bytes.length;
    const segment: unknown = jsonObject(object);
    if (
      !segment ||
      typeof segment !== "object" ||
      !("event" in segment) ||
      !("previous" in segment)
    )
      throw new Error("Invalid journal segment");
    events.push(segment.event);
    next =
      segment.previous === null ? null : transportReference(segment.previous);
  }
  return events.reverse();
}
