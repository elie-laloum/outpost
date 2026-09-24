import { journalRetentionLimits } from "./journal-retention.constants.ts";
import { lstat, writeFile } from "node:fs/promises";
import { hashInspectionEntry } from "./inspection-hash.ts";
import { readInspectionFile } from "./inspection-file.ts";

export async function markJournalClosed(file: string): Promise<void> {
  const info = await lstat(file);
  const fingerprint = await hashInspectionEntry(file);
  await writeFile(
    `${file}.closed.json`,
    JSON.stringify({
      version: 1,
      closedAt: new Date().toISOString(),
      dev: info.dev,
      ino: info.ino,
      mtimeMs: info.mtimeMs,
      ctimeMs: info.ctimeMs,
      ...fingerprint,
    }),
    { flag: "wx", mode: 0o600 },
  );
}

export async function closedJournal(file: string): Promise<boolean> {
  try {
    const record: unknown = JSON.parse(
      (
        await readInspectionFile(
          `${file}.closed.json`,
          journalRetentionLimits.maxMarkerBytes,
        )
      ).toString("utf8"),
    );
    if (
      !record ||
      typeof record !== "object" ||
      !("version" in record) ||
      record.version !== 1 ||
      !("closedAt" in record) ||
      typeof record.closedAt !== "string" ||
      !Number.isFinite(Date.parse(record.closedAt)) ||
      !("kind" in record) ||
      record.kind !== "file" ||
      !("bytes" in record) ||
      typeof record.bytes !== "number" ||
      !Number.isSafeInteger(record.bytes) ||
      record.bytes < 0 ||
      !("sha256" in record) ||
      typeof record.sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(record.sha256)
    )
      return false;
    const info = await lstat(file);
    for (const key of ["dev", "ino", "mtimeMs", "ctimeMs"] as const)
      if (Object.getOwnPropertyDescriptor(record, key)?.value !== info[key])
        return false;
    const current = await hashInspectionEntry(
      file,
      journalRetentionLimits.maxLogBytes,
    );
    return (
      current.kind === "file" &&
      current.bytes === record.bytes &&
      current.sha256 === record.sha256
    );
  } catch {
    return false;
  }
}
