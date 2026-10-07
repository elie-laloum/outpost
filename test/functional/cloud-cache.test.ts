import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdir,
  readFile,
  readdir,
  writeFile,
  symlink,
  stat,
} from "node:fs/promises";
import { join } from "node:path";
import { createLocalTransport } from "../../src/infrastructure/local-transport.ts";
import { cloudCacheSandbox } from "../fixtures/cloud-cache-sandbox.ts";
import { repository } from "../helpers.ts";

for (const name of ["vercel", "daytona"] as const) {
  test(
    `${name} restores binary downloads before use and saves once at release, isolating keys and environments`,
    { skip: process.platform === "win32" },
    async (t) => {
      const root = await repository(t);
      const transport = createLocalTransport({
        directory: join(root, "store"),
      });
      const context = {
        repository: root,
        directory: root,
        gitDirectories: [],
        variables: {},
      };
      const caches = [{ name: "npm", key: "node24", transport }];
      const bytes = Buffer.from([0, 255, 128, 10, 13, 0]);
      let stopped = 0;
      const first = await (
        await cloudCacheSandbox(
          name,
          join(root, "first"),
          caches,
          "v1",
          async () => {
            stopped++;
          },
        )
      ).acquire(context);
      await mkdir(join(root, "first/cache/npm/nested"));
      await writeFile(join(root, "first/cache/npm/nested/download"), bytes, {
        mode: 0o750,
      });
      await symlink("nested/download", join(root, "first/cache/npm/link"));
      await Promise.all([first.release(), first.release()]);
      assert.equal(stopped, 1);
      const second = await (
        await cloudCacheSandbox(name, join(root, "second"), caches)
      ).acquire(context);
      const inspected = await second.invoke({
        executable: "node",
        arguments: [
          "-e",
          "console.log(require('node:fs').readFileSync('/outpost/cache/npm/link').toString('hex'))",
        ],
      });
      assert.equal(inspected.status, 0);
      assert.equal(inspected.stdout.trim(), bytes.toString("hex"));
      assert.deepEqual(
        await readFile(join(root, "second/cache/npm/link")),
        bytes,
      );
      assert.equal(
        (await stat(join(root, "second/cache/npm/nested/download"))).mode &
          0o777,
        0o750,
      );
      await writeFile(join(root, "second/cache/npm/extra"), "updated");
      await second.release();
      const third = await (
        await cloudCacheSandbox(name, join(root, "third"), caches)
      ).acquire(context);
      assert.equal(
        await readFile(join(root, "third/cache/npm/extra"), "utf8"),
        "updated",
      );
      await third.release();
      for (const [label, key, environment] of [
        ["key", "node25", "v1"],
        ["image", "node24", "v2"],
      ]) {
        const lease = await (
          await cloudCacheSandbox(
            name,
            join(root, label!),
            [{ name: "npm", key: key!, transport }],
            environment!,
          )
        ).acquire(context);
        assert.deepEqual(await readdir(join(root, label!, "cache/npm")), []);
        await lease.release();
      }
    },
  );

  test(
    `${name} concurrent cache publishers preserve the first completed snapshot`,
    { skip: process.platform === "win32" },
    async (t) => {
      const root = await repository(t);
      const transport = createLocalTransport({
        directory: join(root, "store"),
      });
      const caches = [{ name: "pip", key: "python", transport }];
      const context = {
        repository: root,
        directory: root,
        gitDirectories: [],
        variables: {},
      };
      const a = await (
        await cloudCacheSandbox(name, join(root, "a"), caches)
      ).acquire(context);
      const b = await (
        await cloudCacheSandbox(name, join(root, "b"), caches)
      ).acquire(context);
      await writeFile(join(root, "a/cache/pip/download"), "winner");
      await writeFile(join(root, "b/cache/pip/download"), "stale");
      await a.release();
      await b.release();
      const c = await (
        await cloudCacheSandbox(name, join(root, "c"), caches)
      ).acquire(context);
      assert.equal(
        await readFile(join(root, "c/cache/pip/download"), "utf8"),
        "winner",
      );
      await c.release();
    },
  );

  test(
    `${name} cache read/save failures dispose allocations and preserve failures`,
    { skip: process.platform === "win32" },
    async (t) => {
      const root = await repository(t);
      const base = createLocalTransport({ directory: join(root, "store") });
      let stopped = 0;
      const context = {
        repository: root,
        directory: root,
        gitDirectories: [],
        variables: {},
      };
      const stop = async () => {
        stopped++;
      };
      const brokenRead = {
        ...base,
        read: async () => {
          throw new Error("cache unavailable");
        },
      };
      await assert.rejects(
        (
          await cloudCacheSandbox(
            name,
            join(root, "read"),
            [{ name: "npm", key: "v1", transport: brokenRead }],
            "v1",
            stop,
          )
        ).acquire(context),
        /cache unavailable/,
      );
      assert.equal(stopped, 1);
      const brokenWrite = {
        ...base,
        write: async () => {
          throw new Error("store full");
        },
      };
      const lease = await (
        await cloudCacheSandbox(
          name,
          join(root, "write"),
          [{ name: "npm", key: "v1", transport: brokenWrite }],
          "v1",
          stop,
        )
      ).acquire(context);
      await assert.rejects(
        lease.release(),
        /Cloud dependency cache save failed/,
      );
      await assert.rejects(
        lease.release(),
        /Cloud dependency cache save failed/,
      );
      assert.equal(stopped, 2);
      await assert.rejects(lease.invoke({ executable: "true" }), /closed/);
    },
  );
}

for (const name of ["vercel", "daytona"] as const) {
  test(
    `${name} cache metadata is independent of the user output retention limit`,
    { skip: process.platform === "win32" },
    async (t) => {
      const root = await repository(t);
      const transport = createLocalTransport({
        directory: join(root, "store"),
      });
      const provider = await cloudCacheSandbox(
        name,
        join(root, "cloud"),
        [{ name: "npm", key: "v1", transport }],
        "v1",
        async () => {},
        1,
      );
      const lease = await provider.acquire({
        repository: root,
        directory: root,
        gitDirectories: [],
        variables: {},
      });
      const result = await lease.invoke({
        executable: "printf",
        arguments: ["hello"],
      });
      assert.equal(result.stdout, "o");
      await lease.release();
    },
  );
}
