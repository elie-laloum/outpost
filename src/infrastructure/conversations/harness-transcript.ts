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
  const source = continuation
    ? await options.store.locate(continuation.id, options.repository)
    : undefined;
  const text = source ? await readFile(source.file, "utf8") : undefined;
  const messages = text ? transcriptMessages(parseTranscript(text)) : [];
  const id =
    continuation && !continuation.fork ? continuation.id : randomUUID();
  const file = harnessTranscriptPath(options.repository, id);
  const release = await lock(options.repository, `harness-conversation:${id}`);
  try {
    await mkdir(dirname(file), { recursive: true, mode: 0o700 });
    if (!continuation || continuation.fork)
      await writeFile(
        file,
        lines([
          {
            type: "session",
            version: 1,
            id,
            model: options.model,
            ...(continuation ? { parent: continuation.id } : {}),
            createdAt: new Date().toISOString(),
          },
          ...(messages.length
            ? [{ type: "compaction" as const, messages }]
            : []),
        ]),
        { flag: "wx", mode: 0o600 },
      );
    if (continuation && !continuation.fork && source!.file !== file)
      await writeFile(file, text!, { mode: 0o600 });
  } catch (error) {
    await release();
    throw error;
  }
  return {
    id,
    messages,
    append: (record) => appendFile(file, lines([record]), { mode: 0o600 }),
    close: release,
  };
}

function lines(records: readonly TranscriptRecord[]): string {
  return records.map((record) => `${JSON.stringify(record)}\n`).join("");
}
