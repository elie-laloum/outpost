import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { firecracker } from "../src/providers/firecracker.ts";
import type { FirecrackerOptions } from "../src/providers/firecracker.types.ts";

test(
  "LIVE Firecracker: boot, binary transfer, command completion, cancellation and warm reuse",
  { skip: !process.env.OUTPOST_FIRECRACKER_CONFIG },
  async () => {
    const options: FirecrackerOptions = JSON.parse(
      await readFile(process.env.OUTPOST_FIRECRACKER_CONFIG!, "utf8"),
    );
    const root = await mkdtemp(join(tmpdir(), "outpost-firecracker-live-"));
    const lease = await firecracker(options).acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    });
    try {
      const result = await lease.invoke({
        executable: "sh",
        arguments: ["-c", "exec 1>&- 2>&-; sleep 0.2; exit 23"],
      });
      assert.equal(result.status, 23);
      const bytes = Buffer.from(
        Array.from({ length: 300_000 }, (_, n) => n % 256),
      );
      await writeFile(join(root, "input"), bytes, { mode: 0o750 });
      await lease.upload(join(root, "input"), `${lease.root}/input`);
      assert.equal(
        (
          await lease.invoke({
            executable: "node",
            arguments: [
              "-e",
              "const fs=require('node:fs');const x=fs.readFileSync('input');if(x.length!==300000||x[255]!==255||(fs.statSync('input').mode&511)!==488)process.exit(1)",
            ],
          })
        ).status,
        0,
      );
      await lease.download(`${lease.root}/input`, join(root, "output"));
      assert.deepEqual(await readFile(join(root, "output")), bytes);
      await assert.rejects(
        lease.invoke({
          executable: "sh",
          arguments: ["-c", "sleep 1; touch orphan"],
          deadlineMs: 100,
        }),
      );
      assert.equal(
        (
          await lease.invoke({
            executable: "sh",
            arguments: ["-c", "sleep 1.2; test ! -e orphan"],
          })
        ).status,
        0,
      );
    } finally {
      await lease.release();
      await lease.release();
      await rm(root, { recursive: true, force: true });
    }
  },
);
