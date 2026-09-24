import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  readlink,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join, resolve, dirname, basename } from "node:path";
import { captureRecoveryChecksums } from "../../src/application/recovery-checksum-capture.ts";
import { verifyRecoveryTransfer } from "../../src/application/recovery-verification.ts";
import { recoveryChecksumDefaults } from "../../src/application/recovery-checksums.constants.ts";
import { hashInspectionEntry } from "../../src/infrastructure/inspection-hash.ts";
import { inspectionHashChunkBytes } from "../../src/infrastructure/inspection-hash.constants.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { git } from "../../src/infrastructure/git/command.ts";
import { openWorkspace, OutpostError } from "../../src/index.ts";
import { seedRemote } from "../../src/application/remote-workspace.ts";
import { local } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

const cli = resolve("src/cli/main.ts");
const state = {
  previous: "a".repeat(40),
  next: "b".repeat(40),
  previousExtras: ["draft.bin"],
  incoming: [],
};

async function transfer(root: string): Promise<string> {
  const path = join(root, ".outpost", "recovery", "session", "transfer");
  await mkdir(join(path, "previous-files"), { recursive: true });
  await writeFile(join(path, "state.json"), JSON.stringify(state));
  for (const name of ["remote.patch", "previous.patch", "previous-index.patch"])
    await writeFile(join(path, name), "");
  await writeFile(join(path, "commits.bundle"), "synthetic bundle");
  await writeFile(
    join(path, "previous-files", "draft.bin"),
    Buffer.alloc(inspectionHashChunkBytes * 3 + 7, 255),
  );
  return path;
}

test("captured SHA-256 covers binary chunks and detects same-size payload changes and changed state", async (t) => {
  const path = await transfer(await repository(t));
  await captureRecoveryChecksums(path, state);
  const report = await verifyRecoveryTransfer(path, { checksums: true });
  assert.equal(report.complete, true);
  assert.equal(report.integrity, "checksums-match");
  assert.equal(report.checksums?.checks.length, 6);
  const payload = join(path, "previous-files", "draft.bin");
  const digest = await hashInspectionEntry(payload);
  assert.equal(
    digest.sha256,
    createHash("sha256")
      .update(await readFile(payload))
      .digest("hex"),
  );
  const beforeManifest = await readFile(join(path, "checksums.json"));
  await writeFile(payload, Buffer.alloc(digest.bytes, 254));
  const corrupt = await verifyRecoveryTransfer(path, { checksums: true });
  assert.equal(corrupt.complete, false);
  assert.equal(corrupt.integrity, "checksums-mismatch");
  assert.ok(
    corrupt.checks.some(
      (check) => check.path === payload && check.code === "CHECKSUM_MISMATCH",
    ),
  );
  assert.equal((await verifyRecoveryTransfer(path)).complete, true);
  assert.deepEqual(
    await readFile(join(path, "checksums.json")),
    beforeManifest,
  );
  await writeFile(
    join(path, "state.json"),
    JSON.stringify({ ...state, extra: "private-content" }),
  );
  const changedState = await verifyRecoveryTransfer(path, { checksums: true });
  assert.ok(
    changedState.checks.some(
      (check) =>
        check.path === join(path, "state.json") &&
        check.code === "CHECKSUM_MISMATCH",
    ),
  );
  assert.doesNotMatch(
    JSON.stringify(changedState),
    /private-content|synthetic bundle/,
  );
});

test("legacy, malformed, incomplete and redirected checksum manifests are never assumed verified", async (t) => {
  const path = await transfer(await repository(t));
  assert.equal((await verifyRecoveryTransfer(path)).complete, true);
  const legacy = await verifyRecoveryTransfer(path, { checksums: true });
  assert.equal(legacy.complete, false);
  assert.equal(legacy.integrity, "unverified");
  assert.equal(legacy.checks.at(-1)?.code, "CHECKSUMS_UNAVAILABLE");
  await captureRecoveryChecksums(path, state);
  const original = JSON.parse(
    await readFile(join(path, "checksums.json"), "utf8"),
  );
  for (const manifest of [
    null,
    {},
    { ...original, version: 2 },
    { ...original, algorithm: "md5" },
    { ...original, entries: original.entries.slice(1) },
    {
      ...original,
      entries: [original.entries[0], ...original.entries.slice(0, -1)],
    },
    {
      ...original,
      entries: [
        { ...original.entries[0], path: "../outside" },
        ...original.entries.slice(1),
      ],
    },
    {
      ...original,
      entries: [
        { ...original.entries[0], sha256: "invalid" },
        ...original.entries.slice(1),
      ],
    },
    {
      ...original,
      entries: [
        { ...original.entries[0], bytes: -1 },
        ...original.entries.slice(1),
      ],
    },
  ]) {
    await writeFile(join(path, "checksums.json"), JSON.stringify(manifest));
    const report = await verifyRecoveryTransfer(path, { checksums: true });
    assert.equal(report.complete, false);
    assert.equal(report.integrity, "unverified");
    assert.equal(report.checksums?.bytesChecked, 0);
    assert.equal(report.checks.at(-1)?.code, "INVALID_CHECKSUM_MANIFEST");
  }
  for (const contents of [
    "{ private-manifest",
    "x".repeat(recoveryChecksumDefaults.maxManifestBytes + 1),
  ]) {
    await writeFile(join(path, "checksums.json"), contents);
    const report = await verifyRecoveryTransfer(path, { checksums: true });
    assert.equal(report.checks.at(-1)?.code, "CHECKSUMS_UNAVAILABLE");
    assert.doesNotMatch(JSON.stringify(report), /private-manifest/);
  }
});

test("checksum byte budget uses actual sizes and accepts the exact total", async (t) => {
  const path = await transfer(await repository(t));
  await captureRecoveryChecksums(path, state);
  const full = await verifyRecoveryTransfer(path, { checksums: true });
  const total = full.checksums!.bytesChecked;
  assert.equal(
    (await verifyRecoveryTransfer(path, { checksums: true, maxBytes: total }))
      .integrity,
    "checksums-match",
  );
  const limited = await verifyRecoveryTransfer(path, {
    checksums: true,
    maxBytes: total - 1,
  });
  assert.equal(limited.complete, false);
  assert.equal(limited.integrity, "unverified");
  assert.equal(limited.checks.at(-1)?.code, "CHECKSUM_LIMIT");
  assert.ok(limited.checksums!.bytesChecked < total - 1);
  const manifest = JSON.parse(
    await readFile(join(path, "checksums.json"), "utf8"),
  );
  for (const entry of manifest.entries) entry.bytes = 0;
  await writeFile(join(path, "checksums.json"), JSON.stringify(manifest));
  const forgedSize = await verifyRecoveryTransfer(path, {
    checksums: true,
    maxBytes: 1,
  });
  assert.equal(forgedSize.checks.at(-1)?.code, "CHECKSUM_LIMIT");
  assert.equal(forgedSize.checksums?.bytesChecked, 0);
});

test("symlink checksums cover link text and kind without reading targets", async (t) => {
  const root = await repository(t);
  const path = await transfer(root);
  const outside = join(root, "outside");
  await mkdir(outside);
  await writeFile(join(outside, "private"), "initial target");
  const payload = join(path, "previous-files", "draft.bin");
  await rm(payload);
  await symlink(outside, payload, "junction");
  await captureRecoveryChecksums(path, state);
  await writeFile(join(outside, "private"), "modified target");
  assert.equal(
    (await verifyRecoveryTransfer(path, { checksums: true })).integrity,
    "checksums-match",
  );
  const linkText = await readlink(payload, { encoding: "buffer" });
  await rm(payload);
  await writeFile(payload, linkText);
  const changedKind = await verifyRecoveryTransfer(path, { checksums: true });
  assert.equal(changedKind.integrity, "checksums-mismatch");
  assert.equal(
    await readFile(join(outside, "private"), "utf8"),
    "modified target",
  );
});

test("capture failure leaves recovery sources and does not publish a partial manifest", async (t) => {
  const path = await transfer(await repository(t));
  await rm(join(path, "remote.patch"));
  await assert.rejects(captureRecoveryChecksums(path, state));
  await assert.rejects(lstat(join(path, "checksums.json")), { code: "ENOENT" });
  await writeFile(join(path, "remote.patch"), "");
  await mkdir(join(path, "checksums.json"));
  await assert.rejects(captureRecoveryChecksums(path, state));
  assert.ok((await lstat(join(path, "previous-files", "draft.bin"))).isFile());
  assert.ok(
    (await readdir(path)).every((name) => !name.startsWith(".checksums-")),
  );
});

test("checksum capture failure aborts synchronization before host apply and retains recovery files", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "checksums" },
  });
  t.after(() => workspace.close({ preserve: true }));
  const remote = join(root, ".outpost", "recovery", "remote");
  await mkdir(remote, { recursive: true });
  const lease = await local().acquire({
    repository: remote,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  let retained = "";
  const sync = await seedRemote(workspace, {
    ...lease,
    async download(source, destination, options) {
      await lease.download(source, destination, options);
      if (basename(destination) === "remote.patch") {
        retained = dirname(destination);
        await mkdir(join(retained, "checksums.json"));
      }
    },
  });
  t.after(() => sync.close());
  const before = await readFile(join(workspace.directory, "base.txt"));
  const head = await git(workspace.directory, ["rev-parse", "HEAD"]);
  await writeFile(join(remote, "base.txt"), "incoming edit");
  await assert.rejects(
    sync.pull(),
    (error) => error instanceof OutpostError && error.code === "workspace",
  );
  assert.deepEqual(
    await readFile(join(workspace.directory, "base.txt")),
    before,
  );
  assert.equal(await git(workspace.directory, ["rev-parse", "HEAD"]), head);
  assert.ok((await lstat(join(retained, "state.json"))).isFile());
  assert.ok((await lstat(join(retained, "remote.patch"))).isFile());
  assert.ok(
    (await readdir(retained)).every((name) => !name.startsWith(".checksums-")),
  );
});

test("checksum CLI exposes explicit results, budget failures and argument validation", async (t) => {
  const path = await transfer(await repository(t));
  await captureRecoveryChecksums(path, state);
  const run = (args: string[]) =>
    executeProcess({
      executable: process.execPath,
      arguments: [cli, "recovery", "verify", "--directory", path, ...args],
    });
  const success = await run(["--checksums", "--json"]);
  assert.equal(success.status, 0, success.stderr);
  assert.equal(JSON.parse(success.stdout).integrity, "checksums-match");
  assert.equal((await run(["--checksums", "--max-bytes", "1"])).status, 1);
  await writeFile(join(path, "commits.bundle"), "corrupt bundle");
  const corrupt = await run(["--checksums"]);
  assert.equal(corrupt.status, 1);
  assert.match(corrupt.stdout, /CHECKSUM_MISMATCH/);
  assert.match(corrupt.stdout, /Checksums: checksums-mismatch/);
  assert.doesNotMatch(corrupt.stdout, /corrupt bundle/);
  for (const args of [
    ["--max-bytes", "1"],
    ["--checksums", "--max-bytes", "0"],
    ["--checksums", "--max-bytes=-1"],
    ["--checksums", "--max-bytes", "NaN"],
  ]) {
    const invalid = await run(args);
    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr, /requires|positive integer/);
  }
});
