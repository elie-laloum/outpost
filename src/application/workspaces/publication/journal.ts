import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { invariant } from "../../../domain/errors.ts";
import type { WorkspaceOutputOptions } from "../../../domain/file-workspace.types.ts";
import type {
  Transport,
  TransportReference,
} from "../../../domain/transport.types.ts";
import {
  parseManifest,
  validateFilePaths,
} from "../../../infrastructure/file-manifest.ts";
import {
  jsonObject,
  readReference,
} from "../../../infrastructure/transport-json.ts";
import { workspaceFileLimits } from "../../../infrastructure/workspace-files.constants.ts";
import type {
  PublicationDirectory,
  PublicationJournal,
  PublicationOperation,
} from "../../workspace-publication.types.ts";

function publicationJournal(value: unknown): PublicationJournal {
  invariant(
    value &&
      typeof value === "object" &&
      "format" in value &&
      value.format === 1 &&
      "id" in value &&
      typeof value.id === "string" &&
      "workspaceId" in value &&
      typeof value.workspaceId === "string" &&
      "options" in value &&
      value.options &&
      typeof value.options === "object" &&
      "destination" in value.options &&
      typeof value.options.destination === "string" &&
      "paths" in value.options &&
      Array.isArray(value.options.paths) &&
      value.options.paths.every((path: unknown) => typeof path === "string") &&
      "policy" in value.options &&
      (value.options.policy === "create" ||
        value.options.policy === "update") &&
      "staging" in value &&
      typeof value.staging === "string" &&
      "backup" in value &&
      typeof value.backup === "string" &&
      "state" in value &&
      (value.state === "applying" ||
        value.state === "complete" ||
        value.state === "rolled-back" ||
        value.state === "recovery-required") &&
      "operations" in value &&
      Array.isArray(value.operations) &&
      value.operations.length <= workspaceFileLimits.entries,
    "Invalid publication journal",
  );
  const options: WorkspaceOutputOptions = {
    destination: value.options.destination,
    paths: value.options.paths,
    policy: value.options.policy,
    ...("deleteMissing" in value.options && value.options.deleteMissing === true
      ? { deleteMissing: true }
      : {}),
  };
  validateFilePaths(options.paths);
  invariant(
    isAbsolute(options.destination) &&
      resolve(options.destination) === options.destination,
    "Invalid publication destination",
  );
  const stagingRoot = dirname(value.staging);
  invariant(
    dirname(stagingRoot) === dirname(options.destination) &&
      /^\.outpost-publication-[A-Za-z0-9]+$/.test(basename(stagingRoot)) &&
      value.staging === join(stagingRoot, "incoming") &&
      value.backup === join(stagingRoot, "backup"),
    "Invalid publication recovery staging",
  );
  const operations = value.operations.map(
    (operation: unknown): PublicationOperation => {
      invariant(
        operation &&
          typeof operation === "object" &&
          "path" in operation &&
          typeof operation.path === "string" &&
          "phase" in operation &&
          (operation.phase === "pending" ||
            operation.phase === "quarantine-intent" ||
            operation.phase === "quarantined" ||
            operation.phase === "install-intent" ||
            operation.phase === "installed" ||
            operation.phase === "restored"),
        "Invalid publication operation",
      );
      validateFilePaths([operation.path]);
      if ("rollbackDisplaced" in operation)
        invariant(
          typeof operation.rollbackDisplaced === "string" &&
            /^rollback-[a-f0-9-]+$/.test(operation.rollbackDisplaced),
          "Invalid rollback quarantine path",
        );
      return {
        path: operation.path,
        phase: operation.phase,
        ...("rollbackDisplaced" in operation &&
        typeof operation.rollbackDisplaced === "string"
          ? { rollbackDisplaced: operation.rollbackDisplaced }
          : {}),
        ...("previous" in operation
          ? {
              previous: parseManifest(
                [operation.previous],
                [operation.path],
              )[0]!,
            }
          : {}),
        ...("incoming" in operation
          ? {
              incoming: parseManifest(
                [operation.incoming],
                [operation.path],
              )[0]!,
            }
          : {}),
      };
    },
  );
  invariant(
    new Set(operations.map((op) => op.path)).size === operations.length,
    "Duplicate publication operations",
  );
  let directories: PublicationDirectory[] | undefined;
  if ("directories" in value) {
    invariant(
      Array.isArray(value.directories) &&
        value.directories.length <= workspaceFileLimits.entries,
      "Invalid publication directories",
    );
    directories = value.directories.map((entry: unknown) => {
      invariant(
        entry &&
          typeof entry === "object" &&
          "path" in entry &&
          typeof entry.path === "string" &&
          "mode" in entry &&
          typeof entry.mode === "number" &&
          Number.isInteger(entry.mode) &&
          entry.mode >= 0 &&
          entry.mode <= 0o777 &&
          "phase" in entry &&
          (entry.phase === "pending" ||
            entry.phase === "create-intent" ||
            entry.phase === "created" ||
            entry.phase === "settled" ||
            entry.phase === "restored"),
        "Invalid publication directory",
      );
      if (entry.path !== ".") validateFilePaths([entry.path]);
      let identity: PublicationDirectory["identity"];
      if ("identity" in entry) {
        invariant(
          entry.identity &&
            typeof entry.identity === "object" &&
            "device" in entry.identity &&
            typeof entry.identity.device === "number" &&
            "inode" in entry.identity &&
            typeof entry.identity.inode === "number",
          "Invalid publication directory identity",
        );
        identity = {
          device: entry.identity.device,
          inode: entry.identity.inode,
        };
      }
      if ("createdMode" in entry)
        invariant(
          typeof entry.createdMode === "number" &&
            Number.isInteger(entry.createdMode) &&
            entry.createdMode >= 0 &&
            entry.createdMode <= 0o777,
          "Invalid publication directory mode",
        );
      return {
        path: entry.path,
        mode: entry.mode,
        phase: entry.phase,
        ...(identity ? { identity } : {}),
        ...("createdMode" in entry && typeof entry.createdMode === "number"
          ? { createdMode: entry.createdMode }
          : {}),
      };
    });
    invariant(
      new Set(directories.map((directory) => directory.path)).size ===
        directories.length,
      "Duplicate publication directory",
    );
  }
  const outputs =
    "outputs" in value
      ? parseManifest(
          value.outputs,
          Array.isArray(value.outputs)
            ? value.outputs.map((entry: unknown) => {
                invariant(
                  entry &&
                    typeof entry === "object" &&
                    "path" in entry &&
                    typeof entry.path === "string",
                  "Invalid publication output",
                );
                return entry.path;
              })
            : [],
        )
      : undefined;
  let lock: PublicationJournal["lock"];
  if ("lock" in value) {
    invariant(
      value.lock &&
        typeof value.lock === "object" &&
        "id" in value.lock &&
        typeof value.lock.id === "string" &&
        /^[a-f0-9-]{36}$/.test(value.lock.id) &&
        "directory" in value.lock &&
        value.lock.directory === options.destination,
      "Invalid publication lock identity",
    );
    lock = { id: value.lock.id, directory: options.destination };
  }
  return {
    format: 1,
    id: value.id,
    workspaceId: value.workspaceId,
    options,
    staging: value.staging,
    backup: value.backup,
    state: value.state,
    operations,
    ...(directories ? { directories } : {}),
    ...(outputs ? { outputs } : {}),
    ...(lock ? { lock } : {}),
  };
}

export async function inspectWorkspacePublication(
  transporter: Transport,
  reference: TransportReference,
): Promise<PublicationJournal> {
  return publicationJournal(
    jsonObject(
      await readReference(
        transporter,
        reference,
        workspaceFileLimits.manifestBytes,
      ),
    ),
  );
}
