import { mkdir, rename } from "node:fs/promises";
import { dirname } from "node:path";
import { invariant } from "../../../domain/errors.ts";
import type {
  Transport,
  TransportReference,
} from "../../../domain/transport.types.ts";
import { safeDestination } from "../../../infrastructure/files.ts";
import { jsonBytes } from "../../../infrastructure/transport-json.ts";
import {
  inspectWorkspacePathLocks,
  lockWorkspacePath,
  recoverWorkspacePathLock,
} from "../../../infrastructure/workspace-lock.ts";
import {
  applyPublicationDirectories,
  settlePublicationDirectories,
  verifyPublicationDirectories,
} from "../../workspace-publication-directories.ts";
import type { PublicationRecoveryOptions } from "../../workspace-publication.types.ts";

import { currentEntry, installExclusive, sameEntry } from "./entries.ts";
import { inspectWorkspacePublication } from "./journal.ts";
import { rollbackPublication } from "./rollback.ts";
export async function recoverWorkspacePublication(
  transporter: Transport,
  reference: TransportReference,
  action: "finish" | "rollback",
  options: PublicationRecoveryOptions = {},
): Promise<TransportReference> {
  const journal = await inspectWorkspacePublication(transporter, reference);
  invariant(
    journal.state !== "complete" && journal.state !== "rolled-back",
    "Publication has already settled",
  );
  let current = {
    key: reference.key,
    revision: (
      await transporter.write(reference.key, jsonBytes(journal), {
        ifRevision: reference.revision,
      })
    ).revision,
  };
  if (
    journal.lock &&
    (await inspectWorkspacePathLocks()).some(
      (lock) => lock.id === journal.lock?.id,
    )
  ) {
    invariant(
      options.processesStopped === true,
      "Interrupted publication ownership requires explicit stopped-process authorization",
    );
    await recoverWorkspacePathLock(journal.lock.id, journal.lock.directory, {
      processesStopped: true,
    });
  }
  const release = await lockWorkspacePath(journal.options.destination, true);
  journal.lock = { id: release.id, directory: release.directory };
  const save = async () => {
    current = await transporter.write(current.key, jsonBytes(journal), {
      ifRevision: current.revision,
    });
  };
  try {
    if (action === "rollback") {
      invariant(
        await rollbackPublication(journal, save),
        "Publication rollback requires further recovery",
      );
      return current;
    }
    await applyPublicationDirectories(journal, save);
    for (const operation of journal.operations) {
      invariant(
        operation.phase !== "restored",
        "A restored operation cannot be finished; use a new publication",
      );
      const target = await safeDestination(
        journal.options.destination,
        operation.path,
      );
      const existing = await currentEntry(
        journal.options.destination,
        operation.path,
      );
      if (sameEntry(existing, operation.incoming)) {
        operation.phase = "installed";
        await save();
        continue;
      }
      const backup = await safeDestination(journal.backup, operation.path);
      if (
        operation.previous &&
        !(await currentEntry(journal.backup, operation.path))
      ) {
        invariant(
          sameEntry(existing, operation.previous),
          "Publication destination changed before recovery",
        );
        await mkdir(dirname(backup), { recursive: true });
        operation.phase = "quarantine-intent";
        await save();
        await rename(target, backup);
      }
      invariant(
        sameEntry(
          await currentEntry(journal.backup, operation.path),
          operation.previous,
        ),
        "Publication backup changed before recovery",
      );
      invariant(
        !(await currentEntry(journal.options.destination, operation.path)),
        "Publication destination was recreated",
      );
      operation.phase = "install-intent";
      await save();
      if (operation.incoming) {
        invariant(
          sameEntry(
            await currentEntry(journal.staging, operation.path),
            operation.incoming,
          ),
          "Publication staging changed before recovery",
        );
        await mkdir(dirname(target), { recursive: true });
        await installExclusive(
          await safeDestination(journal.staging, operation.path),
          target,
        );
      }
      invariant(
        sameEntry(
          await currentEntry(journal.options.destination, operation.path),
          operation.incoming,
        ),
        "Publication recovery verification failed",
      );
      operation.phase = "installed";
      await save();
    }
    for (const entry of journal.outputs ?? [])
      invariant(
        sameEntry(
          await currentEntry(journal.options.destination, entry.path),
          entry,
        ),
        "Publication output changed before recovery verification",
      );
    await settlePublicationDirectories(journal, save);
    await verifyPublicationDirectories(journal);
    journal.state = "complete";
    await save();
    return current;
  } finally {
    await release();
  }
}
