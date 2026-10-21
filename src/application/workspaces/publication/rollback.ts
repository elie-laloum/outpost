import { randomUUID } from "node:crypto";
import { rename } from "node:fs/promises";
import { join } from "node:path";
import { invariant } from "../../../domain/errors.ts";
import { safeDestination } from "../../../infrastructure/files.ts";
import {
  preparePublicationRollback,
  rollbackPublicationDirectories,
} from "../../workspace-publication-directories.ts";
import type { PublicationJournal } from "../../workspace-publication.types.ts";

import { currentEntry, installExclusive, sameEntry } from "./entries.ts";
export async function rollbackPublication(
  journal: PublicationJournal,
  save: () => Promise<void>,
): Promise<boolean> {
  let complete = await preparePublicationRollback(journal);
  for (const operation of [...journal.operations].reverse()) {
    if (operation.phase === "pending" || operation.phase === "restored")
      continue;
    try {
      const destination = await safeDestination(
        journal.options.destination,
        operation.path,
      );
      const backup = await safeDestination(journal.backup, operation.path);
      const previous = await currentEntry(journal.backup, operation.path);
      const current = await currentEntry(
        journal.options.destination,
        operation.path,
      );
      if (operation.previous && sameEntry(current, operation.previous)) {
        operation.phase = "restored";
        await save();
        continue;
      }
      if (previous) {
        invariant(
          sameEntry(previous, operation.previous),
          "Quarantined publication entry changed",
        );
        invariant(
          !current || sameEntry(current, operation.incoming),
          "Publication destination changed during rollback",
        );
        if (current) {
          operation.rollbackDisplaced = `rollback-${randomUUID()}`;
          await save();
          const displaced = join(journal.backup, operation.rollbackDisplaced);
          await rename(destination, displaced);
          if (
            !sameEntry(
              await currentEntry(journal.backup, operation.rollbackDisplaced),
              operation.incoming,
            )
          ) {
            await installExclusive(displaced, destination);
            throw new Error(
              "Publication entry changed during rollback displacement",
            );
          }
        }
        await installExclusive(backup, destination);
      } else {
        invariant(
          !operation.previous || sameEntry(current, operation.previous),
          "Publication backup is unavailable",
        );
        if (!operation.previous && current) {
          invariant(
            sameEntry(current, operation.incoming),
            "Created publication entry changed during rollback",
          );
          operation.rollbackDisplaced = `rollback-${randomUUID()}`;
          await save();
          const displaced = join(journal.backup, operation.rollbackDisplaced);
          await rename(destination, displaced);
          if (
            !sameEntry(
              await currentEntry(journal.backup, operation.rollbackDisplaced),
              operation.incoming,
            )
          ) {
            await installExclusive(displaced, destination);
            throw new Error(
              "Created entry changed during rollback displacement",
            );
          }
        }
      }
      operation.phase = "restored";
      await save();
    } catch {
      complete = false;
    }
  }
  complete = (await rollbackPublicationDirectories(journal, save)) && complete;
  journal.state = complete ? "rolled-back" : "recovery-required";
  await save();
  return complete;
}
