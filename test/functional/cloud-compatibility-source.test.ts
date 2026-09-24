import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { cloudCompatibilitySource } from "../fixtures/cloud-compatibility-source.ts";

test("cloud evidence identifies clean, modified and unavailable source without exposing paths", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-cloud-source-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  assert.deepEqual(await cloudCompatibilitySource(directory), {
    commit: null,
    dirty: null,
  });
  async function git(...args: string[]): Promise<string> {
    const result = await executeProcess({
      executable: "git",
      arguments: args,
      directory,
    });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  }
  await git("init");
  await git(
    "-c",
    "user.name=Fixture",
    "-c",
    "user.email=fixture@example.test",
    "commit",
    "--allow-empty",
    "-m",
    "fixture",
  );
  const commit = await git("rev-parse", "HEAD");
  assert.deepEqual(await cloudCompatibilitySource(directory), {
    commit,
    dirty: false,
  });
  await writeFile(
    join(directory, "private-path-secret-token"),
    "private contents",
  );
  assert.deepEqual(await cloudCompatibilitySource(directory), {
    commit,
    dirty: true,
  });
  await git("add", ".");
  assert.deepEqual(await cloudCompatibilitySource(directory), {
    commit,
    dirty: true,
  });
});
