import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chmod,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { fileBatches } from "../../src/providers/file-batches.ts";
import { fileBatchLimits } from "../../src/providers/file-batches.constants.ts";
import { fileManifest } from "../../src/infrastructure/file-manifest.ts";
import { boundedTransfers } from "../../src/infrastructure/transfer.ts";
import { uploadFiles } from "../../src/application/remote-upload.ts";
import { seedRemote } from "../../src/application/remote-workspace.ts";
import { createSandbox, openWorkspace } from "../../src/index.ts";
import { repository } from "../helpers.ts";

test("uploads verify reuse and destination changes through a sandbox process, preserving binary, modes and links", async (t) => {
  const root = await repository(t),
    source = join(root, "source"),
    remote = join(root, "remote");
  await mkdir(source);
  await mkdir(remote);
  const base = await localSandboxProvider().acquire({
    repository: root,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  const uploads: string[] = [];
  const lease = {
    ...base,
    upload: async (...args: Parameters<typeof base.upload>) => {
      uploads.push(args[0]);
      await base.upload(...args);
    },
  };
  const batches = fileBatches(lease);
  const bounded = boundedTransfers(
    { ...lease, fileTransfers: batches },
    { deadlineMs: 10_000 },
  );
  const binary = Buffer.from(
    Array.from({ length: 256 * 1024 }, (_, i) => i % 256),
  );
  await mkdir(join(source, "nested"));
  await writeFile(join(source, "nested/bytes"), binary);
  const paths = ["nested/bytes"];
  if (process.platform !== "win32") {
    await chmod(join(source, "nested/bytes"), 0o751);
    await symlink("nested/bytes", join(source, "link"));
    paths.push("link");
  }
  await uploadFiles(bounded, source, paths);
  assert.equal(uploads.length, 1);
  const verified = await base.invoke({
    executable: "node",
    arguments: [
      "-e",
      "const f=require('node:fs'),c=require('node:crypto'); console.log(JSON.stringify({hash:c.createHash('sha256').update(f.readFileSync('nested/bytes')).digest('hex'), mode:f.statSync('nested/bytes').mode&511, link:f.existsSync('link')?f.readlinkSync('link'):null}))",
    ],
  });
  assert.equal(verified.status, 0);
  const result = JSON.parse(verified.stdout);
  assert.equal(result.hash, createHash("sha256").update(binary).digest("hex"));
  if (process.platform !== "win32") {
    assert.equal(result.mode, 0o751);
    assert.equal(result.link, "nested/bytes");
  }
  await uploadFiles(bounded, source, paths);
  assert.equal(uploads.length, 1, "verified unchanged files send no payload");
  await writeFile(join(remote, "nested/bytes"), "tampered destination");
  await uploadFiles(bounded, source, paths);
  assert.equal(uploads.length, 2, "destination edits invalidate reuse");
  await writeFile(join(source, "nested/bytes"), "changed source");
  await uploadFiles(bounded, source, paths);
  assert.equal(uploads.length, 3);
  if (process.platform !== "win32") {
    await chmod(join(source, "nested/bytes"), 0o640);
    await rm(join(source, "link"));
    await writeFile(join(source, "link"), "now file");
    await uploadFiles(bounded, source, paths);
    assert.equal(await readFile(join(remote, "link"), "utf8"), "now file");
    await rm(join(source, "link"));
    await symlink("missing-target", join(source, "link"));
    await uploadFiles(bounded, source, paths);
  }
  assert.deepEqual(
    (await readdir(remote)).filter((name) =>
      name.startsWith(".outpost-upload-"),
    ),
    [],
  );
});

test("uploads split batches and verify oversized staged files", async (t) => {
  const root = await repository(t),
    source = join(root, "source"),
    remote = join(root, "remote");
  await mkdir(source);
  await mkdir(remote);
  const base = await localSandboxProvider().acquire({
    repository: root,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  const sizes: number[] = [];
  const batches = fileBatches({
    ...base,
    upload: async (...args) => {
      sizes.push((await readFile(args[0])).length);
      await base.upload(...args);
    },
  });
  const paths = Array.from(
    { length: fileBatchLimits.entries + 1 },
    (_, i) => `f${i}`,
  );
  for (const path of paths) await writeFile(join(source, path), path);
  await writeFile(
    join(source, "large"),
    Buffer.alloc(fileBatchLimits.bytes + 1, 0xff),
  );
  if (process.platform !== "win32") await chmod(join(source, "large"), 0o751);
  paths.push("large");
  const entries = await Promise.all(
    paths.map((path) => fileManifest(source, path)),
  );
  await batches.uploadBatch!(source, entries, remote);
  assert.equal(sizes.length, 3);
  assert.equal(sizes[2], fileBatchLimits.bytes + 1);
  const result = await base.invoke({
    executable: "node",
    arguments: [
      "-e",
      "const f=require('node:fs'); if(f.readFileSync('large').some(x=>x!==255)||f.statSync('large').size!==8388609||f.readFileSync('f128','utf8')!=='f128')process.exit(3)",
    ],
  });
  assert.equal(result.status, 0);
  await batches.uploadBatch!(source, entries, remote);
  assert.equal(sizes.length, 3);
});

test("upload failures reject source mutations, corrupted payloads and symlink traversal, then permit reuse", async (t) => {
  const root = await repository(t),
    source = join(root, "source"),
    remote = join(root, "remote");
  await mkdir(source);
  await mkdir(remote);
  const base = await localSandboxProvider().acquire({
    repository: root,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  await writeFile(join(source, "file"), "original");
  const entry = await fileManifest(source, "file");
  await writeFile(join(source, "file"), "mutation");
  await assert.rejects(
    fileBatches(base).uploadBatch!(source, [entry], remote),
    /source changed/,
  );
  await writeFile(join(source, "file"), "original");
  const corrupt = fileBatches({
    ...base,
    upload: async (...args) => {
      await base.upload(...args);
      await writeFile(args[1], "corrupt");
    },
  });
  await assert.rejects(
    corrupt.uploadBatch!(source, [entry], remote),
    /Remote file upload failed/,
  );
  assert.deepEqual(await readdir(remote), []);
  const failing = fileBatches({
    ...base,
    upload: async () => {
      throw new Error("network failure");
    },
  });
  await assert.rejects(
    failing.uploadBatch!(source, [entry], remote),
    /network failure/,
  );
  assert.deepEqual(await readdir(remote), []);
  const mutate = fileBatches({
    ...base,
    upload: async (...args) => {
      await base.upload(...args);
      await writeFile(join(source, "file"), "mutation");
    },
  });
  await assert.rejects(
    mutate.uploadBatch!(source, [entry], remote),
    /source changed/,
  );
  await writeFile(join(source, "file"), "original");
  if (process.platform !== "win32") {
    await symlink(source, join(remote, "nested"));
    const nested = { ...entry, path: "nested/file" };
    await mkdir(join(source, "nested"));
    await writeFile(join(source, "nested/file"), "original");
    await assert.rejects(
      fileBatches(base).uploadBatch!(source, [nested], remote),
      /Remote file upload failed/,
    );
    await rm(join(remote, "nested"));
  }
  for (const path of [
    "../escape",
    ".git/config",
    "/absolute",
    "dir/./file",
    "dir\\file",
  ])
    await assert.rejects(
      fileBatches(base).uploadBatch!(source, [{ ...entry, path }], remote),
      /Unsafe/,
    );
  await fileBatches(base).uploadBatch!(source, [entry], remote);
  assert.equal(await readFile(join(remote, "file"), "utf8"), "original");
});

test("cancelled upload cleans remote staging and leaves the lease reusable", async (t) => {
  const root = await repository(t),
    source = join(root, "source"),
    remote = join(root, "remote");
  await mkdir(source);
  await mkdir(remote);
  const base = await localSandboxProvider().acquire({
    repository: root,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  await writeFile(join(source, "file"), "payload");
  const entry = await fileManifest(source, "file"),
    stop = new AbortController();
  let cleaned!: () => void;
  const cleanup = new Promise<void>((resolve) => {
    cleaned = resolve;
  });
  const batches = fileBatches({
    ...base,
    invoke: async (command) => {
      const result = await base.invoke(command);
      if (command.arguments?.[2] === "cleanup") cleaned();
      return result;
    },
    upload: async (...args) => {
      await base.upload(...args);
      stop.abort(new Error("cancel upload"));
    },
  });
  await assert.rejects(
    batches.uploadBatch!(source, [entry], remote, { signal: stop.signal }),
    /cancel upload/,
  );
  await cleanup;
  assert.deepEqual(await readdir(remote), []);
  const stageStop = new AbortController();
  let stageCleaned!: () => void;
  const stageCleanup = new Promise<void>((resolve) => {
    stageCleaned = resolve;
  });
  const cancelledStage = fileBatches({
    ...base,
    invoke: async (command) => {
      const result = await base.invoke(command);
      if (command.arguments?.[2] === "stage")
        stageStop.abort(new Error("cancel stage"));
      if (command.arguments?.[2] === "cleanup") stageCleaned();
      return result;
    },
  });
  await assert.rejects(
    cancelledStage.uploadBatch!(source, [entry], remote, {
      signal: stageStop.signal,
    }),
    /cancel stage/,
  );
  await stageCleanup;
  assert.deepEqual(await readdir(remote), []);

  await fileBatches(base).uploadBatch!(source, [entry], remote);
  assert.equal(
    (
      await base.invoke({
        executable: "node",
        arguments: [
          "-e",
          "if(require('node:fs').readFileSync('file','utf8')!=='payload')process.exit(2)",
        ],
      })
    ).status,
    0,
  );
});

test("initial untracked inputs reuse verified preseeded payloads while legacy leases still upload", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "initial-uploads" },
  });
  t.after(() => workspace.close({ preserve: true }));
  await writeFile(join(workspace.directory, "extra"), "preseeded");
  const remote = join(root, ".outpost", "upload-remote");
  await mkdir(remote, { recursive: true });
  await writeFile(join(remote, "extra"), "preseeded");
  const base = await localSandboxProvider().acquire({
    repository: root,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  const uploads: string[] = [];
  const lease = {
    ...base,
    upload: async (...args: Parameters<typeof base.upload>) => {
      uploads.push(args[0]);
      await base.upload(...args);
    },
  };
  const sync = await seedRemote(
    workspace,
    { ...lease, fileTransfers: fileBatches(lease) },
    { includeUncommitted: true },
  );
  t.after(() => sync.close());
  assert.equal(uploads.length, 1, "only history bundle is uploaded");
  await uploadFiles(lease, workspace.directory, ["extra"]);
  assert.equal(uploads.length, 2, "legacy provider fallback uploads the file");
});

test("provisioning batches explicit files and preserves directory-copy semantics", async (t) => {
  const root = await repository(t),
    remote = join(root, ".outpost", "copies-remote");
  await mkdir(remote, { recursive: true });
  await writeFile(join(root, "input"), "copied input");
  await mkdir(join(root, "inputs", "empty"), { recursive: true });
  await writeFile(join(root, "inputs", "nested"), "nested input");
  const base = await localSandboxProvider().acquire({
    repository: root,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  const uploads: string[] = [];
  const lease = {
    ...base,
    upload: async (...args: Parameters<typeof base.upload>) => {
      uploads.push(args[0]);
      await base.upload(...args);
    },
  };
  const box = await createSandbox({
    repository: root,
    branch: { mode: "named", name: "copied-inputs" },
    copies: ["input", "input", "inputs", "absent"],
    sandboxProvider: {
      name: "fixture",
      placement: "remote",
      acquire: async () => ({ ...lease, fileTransfers: fileBatches(lease) }),
    },
  });
  t.after(() => box.close({ preserve: true }));
  assert.equal(uploads.length, 3, "history, directory and one file batch");
  assert.ok(uploads.some((path) => path.endsWith("inputs")));
  const verified = await base.invoke({
    executable: "node",
    arguments: [
      "-e",
      "const f=require('node:fs');if(f.readFileSync('input','utf8')!=='copied input'||f.readFileSync('inputs/nested','utf8')!=='nested input'||!f.statSync('inputs/empty').isDirectory())process.exit(2)",
    ],
  });
  assert.equal(verified.status, 0);
});

test("upload rejects changes after manifest inspection and invalid remote responses", async (t) => {
  const root = await repository(t),
    source = join(root, "source"),
    remote = join(root, "remote");
  await mkdir(source);
  await mkdir(remote);
  const base = await localSandboxProvider().acquire({
    repository: root,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  await writeFile(join(source, "file"), "original");
  const entry = await fileManifest(source, "file");
  const growth = fileBatches({
    ...base,
    invoke: async (command) => {
      const result = await base.invoke(command);
      if (command.arguments?.[2] === "missing")
        await writeFile(
          join(source, "file"),
          Buffer.alloc(fileBatchLimits.bytes + 1),
        );
      return result;
    },
  });
  await assert.rejects(
    growth.uploadBatch!(source, [entry], remote),
    /source changed/,
  );
  assert.deepEqual(await readdir(remote), []);
  await writeFile(join(source, "file"), "original");
  for (const [operation, stdout, pattern] of [
    ["missing", '["unknown"]', /Invalid destination/],
    ["stage", root, /Invalid remote upload staging/],
  ] as const) {
    const invalid = fileBatches({
      ...base,
      invoke: async (command) =>
        command.arguments?.[2] === operation
          ? { status: 0, stdout, stderr: "" }
          : base.invoke(command),
    });
    await assert.rejects(
      invalid.uploadBatch!(source, [entry], remote),
      pattern,
    );
  }
  await assert.rejects(
    fileBatches(base).uploadBatch!(
      source,
      [{ ...entry, path: "a".repeat(fileBatchLimits.argumentBytes) }],
      remote,
    ),
    /command size limit/,
  );
  await mkdir(join(remote, "file"));
  await assert.rejects(
    fileBatches(base).uploadBatch!(source, [entry], remote),
    /Remote file upload failed/,
  );
  assert.ok((await readdir(remote)).includes("file"));
});
