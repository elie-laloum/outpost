import assert from "node:assert/strict";
import { mkdir, mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { executeProcess } from "../../src/infrastructure/process.ts";

test(
  "the workspace lock registry waits through live contention and reports only an unchanged gate",
  { skip: process.platform === "win32", timeout: 30_000 },
  async () => {
    const root = await realpath(
      await mkdtemp(join(tmpdir(), "outpost-lock-registry-")),
    );
    try {
      const target = join(root, "work");
      await mkdir(target);
      const contend = async (mode: "live" | "abandoned") => {
        const result = await executeProcess({
          executable: process.execPath,
          arguments: [
            resolve("test/fixtures/workspace-registry-contention.ts"),
            mode,
            target,
          ],
          variables: { TMPDIR: root },
        });
        assert.equal(result.status, 0, result.stderr);
        return JSON.parse(result.stdout) as {
          acquired: boolean;
          waitedMs: number;
          message?: string;
        };
      };
      const live = await contend("live");
      assert.equal(live.acquired, true, live.message);
      assert.ok(live.waitedMs >= 1900, `${live.waitedMs}`);
      const abandoned = await contend("abandoned");
      assert.equal(abandoned.acquired, false);
      assert.match(abandoned.message ?? "", /registry is busy/);
      assert.ok(abandoned.waitedMs >= 9900, `${abandoned.waitedMs}`);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);
