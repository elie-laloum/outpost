import assert from "node:assert/strict";
import { test } from "node:test";
import { chmod, lstat, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verifyPublicationDirectories } from "../../src/application/workspace-publication-directories.ts";
import type { PublicationJournal } from "../../src/application/workspace-publication.types.ts";

test("Windows publication verifies writable modes and identity without requiring POSIX permission bits", async () => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-publication-mode-"));
  const platform = Object.getOwnPropertyDescriptor(process, "platform")!;
  try {
    await chmod(directory, 0o777);
    const info = await lstat(directory);
    const owned = {
      path: ".",
      mode: 0o700,
      identity: { device: info.dev, inode: info.ino },
      phase: "settled" as const,
    };
    const journal: PublicationJournal = {
      format: 1,
      id: "mode-check",
      workspaceId: "fixture",
      options: { paths: ["**"], destination: directory, policy: "create" },
      staging: directory,
      backup: directory,
      operations: [],
      directories: [owned],
      state: "applying",
    };
    Object.defineProperty(process, "platform", { value: "win32" });
    await verifyPublicationDirectories(journal);
    owned.mode = 0o500;
    await assert.rejects(
      verifyPublicationDirectories(journal),
      /verification failed/,
    );
    owned.mode = 0o700;
    owned.identity.inode++;
    await assert.rejects(
      verifyPublicationDirectories(journal),
      /verification failed/,
    );
    owned.identity.inode--;
    Object.defineProperty(process, "platform", { value: "linux" });
    await assert.rejects(
      verifyPublicationDirectories(journal),
      /verification failed/,
    );
  } finally {
    Object.defineProperty(process, "platform", platform);
    await rm(directory, { recursive: true, force: true });
  }
});
