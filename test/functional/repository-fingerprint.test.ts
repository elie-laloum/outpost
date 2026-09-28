import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdir,
  mkdtemp,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { repositoryFingerprint } from "../../src/index.ts";
import { git } from "../../src/infrastructure/git.ts";
import { repository } from "../helpers.ts";

async function scratchEntries(): Promise<string[]> {
  return (await readdir(tmpdir())).filter((name) =>
    name.startsWith("outpost-fingerprint-"),
  );
}

test("repository fingerprints follow commits, tracked edits, the index and untracked files", async (t) => {
  const path = await repository(t);
  const before = await scratchEntries();
  const initial = await repositoryFingerprint(path);
  assert.match(initial, /^[0-9a-f]{64}$/);
  assert.equal(await repositoryFingerprint(path), initial);
  await mkdir(join(path, "nested"));
  assert.equal(await repositoryFingerprint(join(path, "nested")), initial);

  await writeFile(join(path, "base.txt"), "edited\n");
  const edited = await repositoryFingerprint(path);
  assert.notEqual(edited, initial);
  await git(path, ["add", "base.txt"]);
  const staged = await repositoryFingerprint(path);
  assert.notEqual(staged, edited);
  await git(path, ["commit", "-m", "Edit"]);
  const committed = await repositoryFingerprint(path);
  assert.notEqual(committed, initial);
  assert.notEqual(committed, staged);

  await writeFile(join(path, "notes.txt"), "draft\n");
  const untracked = await repositoryFingerprint(path);
  assert.notEqual(untracked, committed);
  await writeFile(join(path, "notes.txt"), "changed\n");
  assert.notEqual(await repositoryFingerprint(path), untracked);
  await rm(join(path, "notes.txt"));
  assert.equal(await repositoryFingerprint(path), committed);

  if (process.platform !== "win32") {
    await symlink("base.txt", join(path, "link"));
    assert.notEqual(await repositoryFingerprint(path), committed);
    await rm(join(path, "link"));
  }
  await mkdir(join(path, ".outpost"), { recursive: true });
  await writeFile(join(path, ".outpost", "runtime.json"), "{}");
  assert.equal(await repositoryFingerprint(path), committed);
  assert.deepEqual(await scratchEntries(), before);
});

test("repository fingerprints reject paths outside a Git repository", async (t) => {
  const path = await mkdtemp(join(tmpdir(), "outpost-plain-"));
  t.after(() => rm(path, { recursive: true, force: true }));
  await assert.rejects(repositoryFingerprint(path));
  await assert.rejects(repositoryFingerprint(join(path, "missing")));
});
