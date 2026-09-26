import { OutpostError } from "./errors.ts";
import type { ModelMessage } from "./model.types.ts";
import type { TranscriptRecord } from "./transcript.types.ts";

const folds: Readonly<
  Record<
    TranscriptRecord["type"],
    (messages: ModelMessage[], record: TranscriptRecord) => ModelMessage[]
  >
> = {
  session: (messages) => messages,
  message: (messages, record) =>
    record.type === "message" ? [...messages, record.message] : messages,
  compaction: (_messages, record) =>
    record.type === "compaction" ? [...record.messages] : [],
};

export function parseTranscript(text: string): readonly TranscriptRecord[] {
  const records = text
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      try {
        return JSON.parse(line) as TranscriptRecord;
      } catch {
        throw new OutpostError(
          "session",
          "Harness transcript is not valid JSONL",
        );
      }
    });
  const first = records[0];
  if (first?.type !== "session" || first.version !== 1)
    throw new OutpostError("session", "Unsupported harness transcript");
  for (const record of records)
    if (!Object.hasOwn(folds, record?.type))
      throw new OutpostError(
        "session",
        "Unsupported harness transcript record",
      );
  return records;
}

export function transcriptMessages(
  records: readonly TranscriptRecord[],
): ModelMessage[] {
  const messages = records.reduce<ModelMessage[]>(
    (current, record) => folds[record.type](current, record),
    [],
  );
  const last = messages.at(-1);
  const pending =
    last?.role === "assistant"
      ? last.content.flatMap((block) =>
          block.type === "tool-call" ? [block.id] : [],
        )
      : [];
  if (!pending.length) return messages;
  return [
    ...messages,
    {
      role: "user",
      content: pending.map((callId) => ({
        type: "tool-result" as const,
        callId,
        content: "The tool call was interrupted before it produced a result.",
        isError: true,
      })),
    },
  ];
}
