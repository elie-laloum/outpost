import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { readInspectionFile } from "../../src/infrastructure/inspection-file.ts";
import { hashInspectionEntry } from "../../src/infrastructure/inspection-hash.ts";

test("inspection reads and hashes native temporary paths and Windows casing aliases", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-inspection-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, "payload.bin");
  const bytes = Buffer.from([0, 255, 128, 10]);
  await writeFile(path, bytes);
  const alias =
    process.platform === "win32" ? path.toUpperCase() : await realpath(path);
  assert.deepEqual(await readInspectionFile(alias, bytes.length), bytes);
  assert.deepEqual(await hashInspectionEntry(alias), {
    kind: "file",
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
  await assert.rejects(
    readInspectionFile(alias, bytes.length - 1),
    /too large/,
  );
});

test("inspection rejects ancestor symlinks and Windows junctions", async (t) => {
  const directory = await realpath(
    await mkdtemp(join(tmpdir(), "outpost-inspection-")),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const source = join(directory, "source");
  await mkdir(source);
  await writeFile(join(source, "payload.bin"), "payload");
  const alias = join(directory, "alias");
  await symlink(
    source,
    alias,
    process.platform === "win32" ? "junction" : "dir",
  );
  await assert.rejects(
    readInspectionFile(join(alias, "payload.bin"), 100),
    /Inspection path changed/,
  );
  await assert.rejects(
    hashInspectionEntry(join(alias, "payload.bin")),
    /symlink/,
  );
});
