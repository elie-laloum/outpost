import { verboseOnly } from "./journal.constants.ts";
import { transportJournal } from "./transport-journal.ts";
import { lock } from "./git/lock.ts";
import { markJournalClosed } from "./journal-retention.ts";
import { randomUUID } from "node:crypto";
import type { FileHandle } from "node:fs/promises";
import { mkdir, open, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { Journal, Logging } from "./journal.types.ts";
import { reporter } from "./reporter.ts";

export type { Logging } from "./journal.types.ts";

export async function journal(
  repository: string,
  logging: Logging = {},
  label?: string,
): Promise<Journal> {
  if (logging && logging !== "stdout" && logging.transporter) {
    if (logging.file !== undefined)
      throw new Error("Provide a journal file or transporter, not both");
    return transportJournal(
      logging.transporter,
      logging.verbose ?? false,
      label,
    );
  }
  const file =
    logging && logging !== "stdout"
      ? resolve(
          repository,
          logging.file ??
            join(
              ".outpost",
              "logs",
              `${label ? label.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 64) + "-" : ""}${new Date().toISOString().replaceAll(":", "-")}-${randomUUID()}.jsonl`,
            ),
        )
      : undefined;
  let handle: FileHandle | undefined,
    pending = Promise.resolve();
  let failure: unknown;
  let release: (() => Promise<void>) | undefined;
  let closing: Promise<void> | undefined;
  const managed =
    !!logging && logging !== "stdout" && logging.file === undefined;
  const display = reporter({ ...(label ? { label } : {}) });
  if (file) {
    await mkdir(dirname(file), { recursive: true });
    release = await lock(repository, `journal:${file}`);
    try {
      await rm(`${file}.closed.json`, { force: true });
      handle = await open(file, managed ? "wx" : "a", 0o600);
      await handle.write(
        JSON.stringify({
          kind: "dispatch-start",
          at: new Date().toISOString(),
          label,
        }) + "\n",
      );
    } catch (error) {
      await handle?.close();
      await release();
      throw error;
    }
  }
  return {
    ...(file ? { file } : {}),
    record(event) {
      if (!logging || closing) return;
      if (
        verboseOnly.has(event.kind) &&
        logging !== "stdout" &&
        !logging.verbose
      )
        return;
      const line =
        JSON.stringify({
          at: new Date().toISOString(),
          ...(label ? { label } : {}),
          ...event,
        }) + "\n";
      if (logging === "stdout") display(event);
      else
        pending = pending
          .then(async () => {
            await handle?.write(line);
          })
          .catch((error) => {
            failure = error;
          });
    },
    close() {
      closing ??= (async () => {
        try {
          await pending;
          await handle?.close();
          if (failure) throw failure;
          if (file && managed) await markJournalClosed(file);
        } finally {
          await release?.();
        }
      })();
      return closing;
    },
  };
}
