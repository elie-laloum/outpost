import { transportJournal } from "./transport-journal.ts";
import { repositoryTransport } from "./repository-transport.ts";
import type { Journal, Logging } from "./journal.types.ts";
import { reporter } from "./reporter.ts";

export type { Logging } from "./journal.types.ts";

export async function journal(
  repository: string,
  logging: Logging = {},
  label?: string,
): Promise<Journal> {
  if (logging && logging !== "stdout")
    return transportJournal(
      logging.transporter ?? repositoryTransport(repository),
      logging.verbose ?? false,
      label,
    );
  const display = reporter({ ...(label ? { label } : {}) });
  let closed = false;
  return {
    record(event) {
      if (logging === "stdout" && !closed) display(event);
    },
    async close() {
      closed = true;
    },
  };
}
