import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chmod,
  lstat,
  mkdir,
  readFile,
  readdir,
  readlink,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { openWorkspace, OutpostError } from "../../src/index.ts";
import { seedRemote } from "../../src/application/remote-workspace.ts";
import { local } from "../../src/providers/local.ts";
import { fileBatches } from "../../src/providers/file-batches.ts";
import { git } from "../../src/infrastructure/git.ts";
import { repository } from "../helpers.ts";

test("incremental remote batches reuse verified bytes and preserve binary, mode, links, deletions and type changes", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "batch-sync" },
  });
  t.after(() => workspace.close({ preserve: true }));
  const remote = join(root, ".outpost", "recovery", "remote");
  await mkdir(remote, { recursive: true });
  const localLease = await local().acquire({
    repository: remote,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => localLease.release());
  const downloads: string[] = [];
  const lease = {
    ...localLease,
    download: async (...args: Parameters<typeof localLease.download>) => {
      downloads.push(args[0]);
      await localLease.download(...args);
    },
  };
  const sync = await seedRemote(workspace, {
    ...lease,
    fileTransfers: fileBatches(lease),
  });
  t.after(() => sync.close());
  const binary = Buffer.from(Array.from({ length: 262144 }, (_, i) => i % 256));
  await writeFile(join(remote, "binary"), binary);
  await mkdir(join(remote, "nested"));
  await writeFile(join(remote, "nested", "file"), "nested data");
  if (process.platform !== "win32")
    await symlink("binary", join(remote, "link"));
  await sync.pull();
  assert.deepEqual(await readFile(join(workspace.directory, "binary")), binary);
  const first = downloads.length;
  assert.equal(downloads.filter((path) => path.endsWith(".json.gz")).length, 1);
  await sync.pull();
  assert.equal(
    downloads.length - first,
    1,
    "unchanged pull downloads only its Git patch",
  );
  if (process.platform !== "win32") {
    assert.equal(await readlink(join(workspace.directory, "link")), "binary");
    await chmod(join(remote, "binary"), 0o755);
    await rm(join(remote, "link"));
    await writeFile(join(remote, "link"), "now a regular file");
  }
  await rm(join(remote, "nested"), { recursive: true });
  await writeFile(join(remote, "nested"), "directory became file");
  await sync.pull();
  assert.equal(
    await readFile(join(workspace.directory, "nested"), "utf8"),
    "directory became file",
  );
  if (process.platform !== "win32") {
    assert.equal(
      (await lstat(join(workspace.directory, "binary"))).mode & 0o777,
      0o755,
    );
    assert.equal(
      await readFile(join(workspace.directory, "link"), "utf8"),
      "now a regular file",
    );
    await rm(join(remote, "link"));
    await symlink("nested", join(remote, "link"));
    await sync.pull();
    assert.equal(await readlink(join(workspace.directory, "link")), "nested");
    await rm(join(remote, "link"));
    await mkdir(join(remote, "link"));
    await writeFile(join(remote, "link", "child"), "link became directory");
    await sync.pull();
    assert.equal(
      await readFile(join(workspace.directory, "link", "child"), "utf8"),
      "link became directory",
    );
  }
  await rm(join(remote, "binary"));
  await sync.pull();
  await sync.pull();
  await assert.rejects(lstat(join(workspace.directory, "binary")), {
    code: "ENOENT",
  });
  await writeFile(join(remote, "nested"), "changed bytes");
  await sync.pull();
  assert.equal(
    await readFile(join(workspace.directory, "nested"), "utf8"),
    "changed bytes",
  );
  await git(remote, ["add", "."]);
  await git(remote, ["commit", "-m", "Commit transferred payloads"]);
  await sync.pull();
  assert.equal(
    await git(remote, ["rev-parse", "HEAD"]),
    await git(workspace.directory, ["rev-parse", "HEAD"]),
  );
});

test("partial batch failure retains recovery artifacts, leaves the host intact and can retry", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "batch-failure" },
  });
  t.after(() => workspace.close({ preserve: true }));
  const remote = join(root, ".outpost", "recovery", "remote");
  await mkdir(remote, { recursive: true });
  const base = await local().acquire({
    repository: remote,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  let batches = 0,
    fail = true;
  const lease = {
    ...base,
    download: async (...args: Parameters<typeof base.download>) => {
      if (args[0].endsWith(".json.gz") && ++batches === 2 && fail)
        throw new Error("injected second batch failure");
      await base.download(...args);
    },
  };
  const sync = await seedRemote(workspace, {
    ...lease,
    fileTransfers: fileBatches(lease),
  });
  await writeFile(join(remote, "base.txt"), "remote dirty\n");
  for (let i = 0; i < 130; i++)
    await writeFile(
      join(remote, `file-${String(i).padStart(3, "0")}`),
      Buffer.from([0, i, 255]),
    );
  let recovery = "";
  await assert.rejects(sync.pull(), (error) => {
    assert.ok(error instanceof OutpostError);
    assert.equal(typeof error.details.recovery, "string");
    recovery = String(error.details.recovery);
    return true;
  });
  assert.ok(recovery);
  assert.equal(
    await readFile(join(workspace.directory, "base.txt"), "utf8"),
    "base\n",
  );
  await assert.rejects(lstat(join(workspace.directory, "file-000")), {
    code: "ENOENT",
  });
  assert.equal((await readdir(join(recovery, "incoming"))).length, 128);
  assert.equal(
    JSON.parse(await readFile(join(recovery, "manifest.json"), "utf8")).length,
    130,
  );
  fail = false;
  await sync.pull();
  assert.deepEqual(
    await readFile(join(workspace.directory, "file-129")),
    Buffer.from([0, 129, 255]),
  );
  await sync.close();
  assert.ok(
    await lstat(recovery),
    "failed-attempt recovery survives successful retry and close",
  );
});

test("incremental reuse rejects concurrent host edits and ignored-file overlaps", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "batch-protection" },
  });
  t.after(() => workspace.close({ preserve: true }));
  const remote = join(root, ".outpost", "recovery", "remote");
  await mkdir(remote, { recursive: true });
  const base = await local().acquire({
    repository: remote,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  const sync = await seedRemote(workspace, {
    ...base,
    fileTransfers: fileBatches(base),
  });
  t.after(() => sync.close());
  await writeFile(join(remote, "payload"), "original");
  await sync.pull();
  await writeFile(join(workspace.directory, "payload"), "concurrent edit");
  await assert.rejects(sync.pull(), (error) => {
    assert.match(String((error as Error).cause), /Host workspace changed/);
    return true;
  });
  assert.equal(
    await readFile(join(workspace.directory, "payload"), "utf8"),
    "concurrent edit",
  );
  await writeFile(join(workspace.directory, "payload"), "original");
  await git(workspace.directory, [
    "config",
    "core.excludesFile",
    join(root, "ignores"),
  ]);
  await writeFile(join(root, "ignores"), "private\n");
  await writeFile(join(workspace.directory, "private"), "host ignored data");
  await writeFile(join(remote, "private"), "remote content");
  await assert.rejects(sync.pull(), (error) => {
    assert.match(String((error as Error).cause), /ignored host files/);
    return true;
  });
  assert.equal(
    await readFile(join(workspace.directory, "private"), "utf8"),
    "host ignored data",
  );
});

test("a failed apply retains complete checksummed recovery including reused payloads", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "batch-recovery" },
  });
  t.after(() => workspace.close({ preserve: true }));
  const remote = join(root, ".outpost", "recovery", "remote");
  await mkdir(remote, { recursive: true });
  const base = await local().acquire({
    repository: remote,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  let blockApply = false;
  const index = (
    await git(workspace.directory, [
      "rev-parse",
      "--path-format=absolute",
      "--git-path",
      "index.lock",
    ])
  ).trim();
  t.after(() => rm(index, { force: true }));
  const lease = {
    ...base,
    download: async (...args: Parameters<typeof base.download>) => {
      await base.download(...args);
      if (blockApply && args[1].endsWith("remote.patch"))
        await writeFile(index, "injected lock");
    },
  };
  const sync = await seedRemote(workspace, {
    ...lease,
    fileTransfers: fileBatches(lease),
  });
  t.after(() => sync.close());
  await writeFile(join(remote, "payload"), Buffer.from([0, 255, 1]));
  await sync.pull();
  blockApply = true;
  let retained = "";
  await assert.rejects(sync.pull(), (error) => {
    assert.ok(error instanceof OutpostError);
    retained = String(error.details.recovery);
    return true;
  });
  const { verifyRecoveryTransfer } =
    await import("../../src/application/recovery-verification.ts");
  const report = await verifyRecoveryTransfer(retained, { checksums: true });
  assert.equal(report.complete, true);
  assert.equal(report.integrity, "checksums-match");
  assert.deepEqual(
    await readFile(join(retained, "incoming", "payload")),
    Buffer.from([0, 255, 1]),
  );
  assert.deepEqual(
    await readFile(join(retained, "previous-files", "payload")),
    Buffer.from([0, 255, 1]),
  );
});

test("a truncated remote file listing fails safely before any host mutation", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "batch-listing-limit" },
  });
  t.after(() => workspace.close({ preserve: true }));
  const remote = join(root, ".outpost", "recovery", "remote");
  await mkdir(remote, { recursive: true });
  const base = await local().acquire({
    repository: remote,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => base.release());
  const sync = await seedRemote(workspace, {
    ...base,
    invoke: async (command) => {
      if (command.arguments?.[0] === "ls-files")
        return { status: 0, stdout: "x".repeat(command.retain!), stderr: "" };
      return base.invoke(command);
    },
  });
  t.after(() => sync.close());
  await assert.rejects(sync.pull(), (error) => {
    assert.match(
      String((error as Error).cause),
      /output exceeds synchronization limit/,
    );
    return true;
  });
  assert.equal(
    await readFile(join(workspace.directory, "base.txt"), "utf8"),
    "base\n",
  );
});
