import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  chmod,
  lstat,
  mkdir,
  readFile,
  readlink,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { gzipSync, gunzipSync } from "node:zlib";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { fileBatches } from "../../src/providers/file-batches.ts";
import { fileBatchLimits } from "../../src/providers/file-batches.constants.ts";
import {
  fileManifest,
  parseManifest,
} from "../../src/infrastructure/file-manifest.ts";
import { boundedTransfers } from "../../src/infrastructure/transfer.ts";
import type { FileManifestEntry } from "../../src/domain/sandbox.types.ts";
import { repository } from "../helpers.ts";

test("batches compress binary payloads, preserve links/modes, and transfer oversized inputs through the fallback", async (t) => {
  const root = await repository(t);
  const base = await localSandboxProvider().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  const compressed: number[] = [],
    direct: string[] = [];
  const batches = fileBatches({
    ...base,
    download: async (...args) => {
      if (args[0].endsWith(".json.gz")) {
        const archive = await readFile(args[0]);
        compressed.push(archive.length);
        if (compressed.length === 1)
          assert.ok(gunzipSync(archive).length > archive.length * 10);
      } else direct.push(args[0]);
      await base.download(...args);
    },
  });
  const binary = Buffer.alloc(128 * 1024, 0xff);
  await writeFile(join(root, "bytes"), binary);
  const large = Buffer.alloc(fileBatchLimits.bytes + 1, 0x80);
  await writeFile(join(root, "large"), large);
  const paths = ["bytes", "large"];
  if (process.platform !== "win32") {
    await chmod(join(root, "bytes"), 0o751);
    await symlink("bytes", join(root, "link"));
    paths.push("link");
  }
  const manifest = await batches.manifest(root, paths);
  const destination = join(root, "output");
  await batches.downloadBatch(root, manifest, destination);
  assert.equal(compressed.length, process.platform === "win32" ? 1 : 2);
  assert.deepEqual(direct, [`${root}/large`]);
  assert.deepEqual(await readFile(join(destination, "bytes")), binary);
  assert.deepEqual(await readFile(join(destination, "large")), large);
  if (process.platform !== "win32") {
    assert.equal((await lstat(join(destination, "bytes"))).mode & 0o777, 0o751);
    assert.equal(await readlink(join(destination, "link")), "bytes");
  }
  await assert.rejects(
    batches.downloadBatch(root, manifest, destination),
    /already exists/,
  );
});

test("remote manifest and batch reject traversal, unsupported files and source mutation", async (t) => {
  const root = await repository(t);
  const base = await localSandboxProvider().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  const batches = fileBatches(base);
  for (const path of [
    "../escape",
    "/absolute",
    ".git/config",
    "dir/../../escape",
    ".",
    "dir/./file",
    "dir\\file",
    "bad\0name",
  ])
    await assert.rejects(batches.manifest(root, [path]), /Unsafe/);
  await assert.rejects(
    batches.manifest(root, ["base.txt", "base.txt"]),
    /duplicate/,
  );
  await mkdir(join(root, "folder"));
  await assert.rejects(
    batches.manifest(root, ["folder"]),
    /manifest or batch failed/,
  );
  if (process.platform !== "win32") {
    await symlink(root, join(root, "alias"));
    await assert.rejects(
      batches.manifest(root, ["alias/base.txt"]),
      /manifest or batch failed/,
    );
  }
  const manifest = await batches.manifest(root, ["base.txt"]);
  await writeFile(join(root, "base.txt"), "mutated");
  await assert.rejects(
    batches.downloadBatch(root, manifest, join(root, "output")),
    /manifest or batch failed/,
  );
  await assert.rejects(lstat(join(root, "output", "base.txt")), {
    code: "ENOENT",
  });
  const large = Buffer.alloc(fileBatchLimits.bytes + 1);
  await writeFile(join(root, "large"), large);
  const largeManifest = await batches.manifest(root, ["large"]);
  await writeFile(join(root, "large"), Buffer.alloc(large.length, 1));
  await assert.rejects(
    batches.downloadBatch(root, largeManifest, join(root, "output")),
    /changed during transfer/,
  );
});

test("compressed payload corruption, invalid metadata and local symlink traversal fail before acceptance", async (t) => {
  const root = await repository(t);
  const base = await localSandboxProvider().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  const entry = await fileManifest(root, "base.txt");
  const invalid: unknown[] = [
    null,
    {},
    [{ ...entry, mode: -1 }],
    [{ ...entry, size: 1.5 }],
    [{ ...entry, sha256: "wrong" }],
    [{ ...entry, kind: "directory" }],
    [{ ...entry, path: "other" }],
  ];
  for (const value of invalid)
    assert.throws(() => parseManifest(value, [entry.path]), /manifest/);
  for (const record of [
    { ...entry, data: 0 },
    { ...entry, data: Buffer.from("bad").toString("base64") },
    {
      ...entry,
      mode: entry.mode ^ 1,
      data: Buffer.from("base\n").toString("base64"),
    },
  ]) {
    const batches = fileBatches({
      ...base,
      download: async (_source, destination) => {
        await writeFile(destination, gzipSync(JSON.stringify([record])));
      },
    });
    await assert.rejects(
      batches.downloadBatch(root, [entry], join(root, "output")),
      /payload|checksum/,
    );
  }
  if (process.platform !== "win32") {
    await symlink(root, join(root, "output"));
    await assert.rejects(
      fileBatches(base).downloadBatch(root, [entry], join(root, "output")),
      /symlink/,
    );
  }
  const missing: FileManifestEntry = {
    ...entry,
    path: "../escape",
    sha256: createHash("sha256").update("base\n").digest("hex"),
  };
  await assert.rejects(
    fileBatches(base).downloadBatch(root, [missing], join(root, "other")),
    /Unsafe/,
  );
});

test("batch cancellation and bounded lease deadlines propagate without losing the reusable lease", async (t) => {
  const root = await repository(t);
  const base = await localSandboxProvider().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  const controller = new AbortController();
  const batches = fileBatches({
    ...base,
    download: async (...args) => {
      await base.download(...args);
      controller.abort(new Error("stop batch"));
    },
  });
  const manifest = await batches.manifest(root, ["base.txt"]);
  await assert.rejects(
    batches.downloadBatch(root, manifest, join(root, "output"), {
      signal: controller.signal,
    }),
    /stop batch/,
  );
  await assert.rejects(
    batches.manifest(root, ["base.txt"], { signal: controller.signal }),
    /stop batch/,
  );
  assert.equal(
    (
      await base.invoke({
        executable: process.execPath,
        arguments: ["-e", "process.exit(0)"],
      })
    ).status,
    0,
  );
  const bounded = boundedTransfers(
    { ...base, fileTransfers: fileBatches(base) },
    { deadlineMs: 10_000 },
  );
  assert.ok(bounded.fileTransfers);
  await bounded.fileTransfers.downloadBatch(
    root,
    await bounded.fileTransfers.manifest(root, ["base.txt"]),
    join(root, "retry"),
  );
  assert.equal(
    await readFile(join(root, "retry", "base.txt"), "utf8"),
    "base\n",
  );
  await assert.rejects(
    bounded.fileTransfers.manifest(root, ["base.txt"], { deadlineMs: 0 }),
    /positive/,
  );
});

test("batches split at the data limit and reject oversized compressed envelopes", async (t) => {
  const root = await repository(t);
  const base = await localSandboxProvider().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  const paths = ["one", "two", "three"];
  for (const path of paths)
    await writeFile(join(root, path), Buffer.alloc(3 * 1024 * 1024, 255));
  let downloads = 0;
  const batches = fileBatches({
    ...base,
    download: async (...args) => {
      downloads++;
      await base.download(...args);
    },
  });
  await batches.downloadBatch(
    root,
    await batches.manifest(root, paths),
    join(root, "output"),
  );
  assert.equal(downloads, 2);
  assert.equal(
    (await readFile(join(root, "output", "three"))).length,
    3 * 1024 * 1024,
  );
  const oversized = fileBatches({
    ...base,
    download: async (_source, destination) => {
      await writeFile(
        destination,
        gzipSync(Buffer.alloc(fileBatchLimits.decodedBytes + 1)),
      );
    },
  });
  await assert.rejects(
    oversized.downloadBatch(
      root,
      await batches.manifest(root, ["base.txt"]),
      join(root, "invalid"),
    ),
    /larger than/,
  );
});
