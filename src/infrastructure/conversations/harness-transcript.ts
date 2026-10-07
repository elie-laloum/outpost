import { randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
  parseTranscript,
  transcriptMessages,
} from "../../domain/transcript.ts";
import type { TranscriptRecord } from "../../domain/transcript.types.ts";
import { lock } from "../git/lock.ts";
import { harnessTranscriptPath } from "./harness-store.ts";
import type {
  TranscriptHandle,
  TranscriptOptions,
} from "./harness-transcript.types.ts";

export async function openTranscript(
  options: TranscriptOptions,
): Promise<TranscriptHandle> {
  const { continuation } = options;
  const serialize = (records: readonly TranscriptRecord[]) =>
    lines(options.observation?.redact(records) ?? records);
  const id =
    continuation && !continuation.fork ? continuation.id : randomUUID();
  const file = harnessTranscriptPath(options.repository, id);
  const release = await lock(options.repository, `harness-conversation:${id}`);
  try {
    const source = continuation
      ? await options.store.locate(continuation.id, options.repository)
      : undefined;
    const text = source ? await readFile(source.file, "utf8") : undefined;
    const records = text ? parseTranscript(text) : [];
    const messages = transcriptMessages(records);
    const version =
      options.routed ||
      records.some(
        (record) => record.type === "session" && record.version === 2,
      )
        ? 2
        : 1;
    await mkdir(dirname(file), { recursive: true, mode: 0o700 });
    if (!continuation || continuation.fork)
      await writeFile(
        file,
        serialize([
          {
            type: "session",
            version,
            id,
            model: options.model,
            ...(options.parentConversation
              ? { parentConversation: options.parentConversation }
              : {}),
            ...(options.parentCallId
              ? { parentCallId: options.parentCallId }
              : {}),
            ...(continuation ? { parent: continuation.id } : {}),
            createdAt: new Date().toISOString(),
          },
          ...(messages.length
            ? [{ type: "compaction" as const, messages }]
            : []),
        ]),
        { flag: "wx", mode: 0o600 },
      );
    if (
      continuation &&
      !continuation.fork &&
      (source!.file !== file ||
        options.observation !== undefined ||
        (version === 2 &&
          records[0]?.type === "session" &&
          records[0].version === 1))
    )
      await writeFile(
        file,
        serialize(
          records.map((record) =>
            record.type === "session" ? { ...record, version } : record,
          ),
        ),
        { mode: 0o600 },
      );
    return {
      id,
      messages,
      append: (record) =>
        appendFile(file, serialize([record]), { mode: 0o600 }),
      close: release,
    };
  } catch (error) {
    await release();
    throw error;
  }
}

function lines(records: readonly TranscriptRecord[]): string {
  return records.map((record) => `${JSON.stringify(record)}\n`).join("");
}
