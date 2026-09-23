import { mkdir, open, type FileHandle } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import type { AgentEvent } from "../domain/ports.ts";

export type Logging =
  false | "stdout" | { readonly file?: string; readonly verbose?: boolean };

export async function journal(
  repository: string,
  logging: Logging = {},
  label?: string,
): Promise<{
  file?: string;
  record(event: AgentEvent): void;
  close(): Promise<void>;
}> {
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
  if (file) {
    await mkdir(dirname(file), { recursive: true });
    handle = await open(file, "wx", 0o600);
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
      if (logging === "stdout")
        process.stdout.write(event.kind === "text" ? event.text : line);
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
