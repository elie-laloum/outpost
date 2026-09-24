import { randomUUID } from "node:crypto";
import { mkdir, open, readdir, realpath, rm } from "node:fs/promises";
import { join } from "node:path";
import { invariant, OutpostError } from "../domain/errors.ts";
import { lockStorageMutation } from "./storage-mutation-lock.ts";
import {
  localProcessIdentity,
  observeOwnership,
} from "./git/process-identity.ts";
import { readInspectionFile } from "./inspection-file.ts";
import { storageInventory } from "./storage-inventory.ts";
import { storageReservationDefaults as defaults } from "./storage-reservations.constants.ts";
import type {
  StorageReservation,
  StorageReservationOptions,
  StorageReservationRecord,
} from "./storage-reservations.types.ts";

async function reservationDirectory(root: string): Promise<string> {
  const paths = [
    join(root, ".outpost"),
    join(root, ".outpost", "locks"),
    join(root, ".outpost", "locks", "storage-reservations"),
  ];
  for (const path of paths) {
    await mkdir(path, { recursive: true, mode: 0o700 });
    invariant(
      (await realpath(path)) === path,
      "Storage reservation directory must not use symlinks",
    );
  }
  return paths[2]!;
}

function validRecord(value: unknown): value is StorageReservationRecord {
  if (!value || typeof value !== "object") return false;
  return (
    "version" in value &&
    value.version === 1 &&
    "id" in value &&
    typeof value.id === "string" &&
    "pid" in value &&
    typeof value.pid === "number" &&
    Number.isSafeInteger(value.pid) &&
    value.pid > 0 &&
    value.pid <= 2_147_483_647 &&
    "reserveBytes" in value &&
    typeof value.reserveBytes === "number" &&
    Number.isSafeInteger(value.reserveBytes) &&
    value.reserveBytes >= 0 &&
    "createdAt" in value &&
    typeof value.createdAt === "string" &&
    Number.isFinite(Date.parse(value.createdAt))
  );
}

async function readRecord(path: string): Promise<StorageReservationRecord> {
  try {
    const value: unknown = JSON.parse(
      (await readInspectionFile(path, defaults.maxRecordBytes)).toString(
        "utf8",
      ),
    );
    if (validRecord(value)) return value;
  } catch (cause) {
    throw new OutpostError(
      "workspace",
      "Storage reservation record is unreadable; admission refused",
      { path },
      cause,
    );
  }
  throw new OutpostError(
    "workspace",
    "Storage reservation record is invalid; admission refused",
    { path },
  );
}

async function reservedBytes(directory: string): Promise<number> {
  const names = await readdir(directory);
  invariant(
    names.length <= defaults.maxRecords,
    "Too many storage reservation records",
  );
  let reserved = 0;
  for (const name of names) {
    const path = join(directory, name);
    const record = await readRecord(path);
    invariant(
      name === `${record.id}.json`,
      "Storage reservation identity mismatch",
    );
    const owner = await observeOwnership(record.pid, record.identity);
    if (owner.status === "inactive") {
      await rm(path);
      continue;
    }
    reserved += record.reserveBytes;
    invariant(
      Number.isSafeInteger(reserved),
      "Storage reservation total exceeds safe integer range",
    );
  }
  return reserved;
}

async function releaseRecord(
  root: string,
  path: string,
  id: string,
): Promise<void> {
  await reservationDirectory(root);
  const unlock = await lockStorageMutation(root);
  try {
    const names = await readdir(
      join(root, ".outpost", "locks", "storage-reservations"),
    );
    if (!names.includes(`${id}.json`)) return;
    const record = await readRecord(path);
    invariant(
      record.id === id,
      "Storage reservation identity changed; refusing release",
    );
    await rm(path);
  } finally {
    await unlock();
  }
}

export async function reserveStorage(
  repository: string,
  options: StorageReservationOptions,
): Promise<StorageReservation> {
  invariant(
    Number.isSafeInteger(options.maxBytes) && options.maxBytes >= 0,
    "maxBytes must be a nonnegative integer",
  );
  invariant(
    Number.isSafeInteger(options.reserveBytes) && options.reserveBytes >= 0,
    "reserveBytes must be a nonnegative integer",
  );
  options.signal?.throwIfAborted();
  const directory = await reservationDirectory(repository);
  const unlock = await lockStorageMutation(repository, options.signal);
  const id = randomUUID();
  const path = join(directory, `${id}.json`);
  try {
    const reserved = await reservedBytes(directory);
    const inventory = await storageInventory(
      join(repository, ".outpost"),
      options.maxEntries,
    );
    const record: StorageReservationRecord = {
      version: 1,
      id,
      pid: process.pid,
      identity: await localProcessIdentity(),
      reserveBytes: options.reserveBytes,
      createdAt: new Date().toISOString(),
    };
    const data = JSON.stringify(record);
    if (
      !inventory.complete ||
      inventory.usage.bytes +
        reserved +
        options.reserveBytes +
        Buffer.byteLength(data) >
        options.maxBytes
    )
      throw new OutpostError(
        "workspace",
        "Outpost storage reservation admission refused",
        {
          usageBytes: inventory.usage.bytes,
          reservedBytes: reserved,
          reserveBytes: options.reserveBytes,
          maxBytes: options.maxBytes,
          complete: inventory.complete,
        },
      );
    options.signal?.throwIfAborted();
    const file = await open(path, "wx", 0o600);
    try {
      await file.writeFile(data);
      await file.sync();
    } catch (error) {
      await file.close();
      await rm(path, { force: true });
      throw error;
    }
    await file.close();
  } finally {
    await unlock();
  }
  let released = false;
  const release = async () => {
    if (released) return;
    await releaseRecord(repository, path, id);
    released = true;
  };
  return {
    id,
    repository,
    reserveBytes: options.reserveBytes,
    release,
    [Symbol.asyncDispose]: release,
  };
}
