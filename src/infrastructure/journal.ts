import { randomUUID } from "node:crypto";
import type { FileHandle } from "node:fs/promises";
import { mkdir, open } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { Journal, Logging } from "./journal.types.ts";
import { reporter } from "./reporter.ts";

export type { Logging } from "./journal.types.ts";

export async function journal(
  repository: string,
  logging: Logging = {},
  label?: string,
): Promise<Journal> {
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
  const display = reporter({ ...(label ? { label } : {}) });
  if (file) {
    await mkdir(dirname(file), { recursive: true });
    handle = await open(file, "a", 0o600);
    await handle.write(
      JSON.stringify({
        kind: "dispatch-start",
        at: new Date().toISOString(),
        label,
      }) + "\n",
    );
  }
  return {
    ...(file ? { file } : {}),
    record(event) {
      if (!logging) return;
      if (event.kind === "raw" && logging !== "stdout" && !logging.verbose)
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
    async close() {
      await pending;
      await handle?.close();
      if (failure) throw failure;
    },
  };
}
