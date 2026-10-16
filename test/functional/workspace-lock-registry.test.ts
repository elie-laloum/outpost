import assert from "node:assert/strict";
import { mkdir, mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { executeProcess } from "../../src/infrastructure/process.ts";

type Contention = { acquired: boolean; waitedMs: number; message?: string };

async function contend(
  root: string,
  mode: "live" | "abandoned" | "reused",
): Promise<Contention> {
  const registry = join(root, mode);
  const target = join(registry, "work");
  await mkdir(target, { recursive: true });
  const result = await executeProcess({
    executable: process.execPath,
    arguments: [
      resolve("test/fixtures/workspace-registry-contention.ts"),
      mode,
      target,
    ],
    variables: { TMPDIR: registry, TEMP: registry, TMP: registry },
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout) as Contention;
}

test(
  "the workspace lock registry waits through live contention and reports only an unchanged gate",
  { skip: process.platform === "win32", timeout: 30_000 },
  async () => {
    const root = await realpath(
      await mkdtemp(join(tmpdir(), "outpost-lock-registry-")),
    );
    try {
      const live = await contend(root, "live");
      assert.equal(live.acquired, true, live.message);
      assert.ok(live.waitedMs >= 1900, `${live.waitedMs}`);
      const abandoned = await contend(root, "abandoned");
      assert.equal(abandoned.acquired, false);
      assert.match(abandoned.message ?? "", /registry is busy/);
      assert.ok(abandoned.waitedMs >= 9900, `${abandoned.waitedMs}`);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test("abandoned locks on deleted directories do not claim a reused inode", async () => {
  const root = await realpath(
    await mkdtemp(join(tmpdir(), "outpost-lock-reuse-")),
  );
  try {
    const reused = await contend(root, "reused");
    assert.equal(reused.acquired, true, reused.message);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
