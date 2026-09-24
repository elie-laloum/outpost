import assert from "node:assert/strict";
import { test } from "node:test";
import {
  lstat,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { verifyRecoveryTransfer } from "../../src/application/recovery-verification.ts";
import { recoveryVerificationDefaults } from "../../src/application/recovery-verification.constants.ts";
import { backupHost } from "../../src/application/remote-backup.ts";
import { git } from "../../src/infrastructure/git/command.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { repository } from "../helpers.ts";

const cli = resolve("src/cli/main.ts");
const oid = "a".repeat(40);
const state = { previous: oid, next: oid, previousExtras: [], incoming: [] };

async function transfer(root: string): Promise<string> {
  const path = join(root, ".outpost", "recovery", "session", "transfer");
  await mkdir(path, { recursive: true });
  await writeFile(join(path, "state.json"), JSON.stringify(state));
  for (const name of ["remote.patch", "previous.patch", "previous-index.patch"])
    await writeFile(join(path, name), "");
  return path;
}

test("verification accepts the state and backups produced by the real host backup writer without changing Git or file content", async (t) => {
  const root = await repository(t);
  const path = await transfer(root);
  await writeFile(join(root, "base.txt"), "private-staged");
  await git(root, ["add", "base.txt"]);
  await writeFile(join(root, "base.txt"), "private-unstaged");
  await writeFile(join(root, "draft.txt"), "private-draft");
  const head = (await git(root, ["rev-parse", "HEAD"])).trim();
  const unused = async (): Promise<never> => {
    throw new Error("Unused remote operation");
  };
  await backupHost(
    {
      workspace: {
        repository: root,
        directory: root,
        branch: "main",
        baseBranch: "main",
        baseline: head,
        gitDirectories: [join(root, ".git")],
        policy: { mode: "current" },
      },
      lease: {
        root,
        home: root,
        invoke: unused,
        upload: unused,
        download: unused,
        release: unused,
      },
      options: {},
      recovery: path,
      remoteBundle: "unused",
      run: unused,
      protectedFiles: [],
      originalHead: head,
      initialPatch: "unused",
      initialIndex: "unused",
    },
    { head, incoming: [], patch: join(path, "remote.patch") },
    head,
    path,
  );
  const index = await readFile(join(root, ".git", "index"));
  const patch = await readFile(join(path, "previous.patch"));
  const report = await verifyRecoveryTransfer(path);
  assert.equal(report.complete, true);
  assert.equal(report.scope, "transfer-structure");
  assert.equal(report.integrity, "unverified");
  assert.equal(report.checks.length, 5);
  const checksummed = await verifyRecoveryTransfer(path, { checksums: true });
  assert.equal(checksummed.complete, true);
  assert.equal(checksummed.integrity, "checksums-match");
  assert.deepEqual(await readFile(join(root, ".git", "index")), index);
  assert.deepEqual(await readFile(join(path, "previous.patch")), patch);
  assert.equal(
    await readFile(join(path, "previous-files", "draft.txt"), "utf8"),
    "private-draft",
  );
  assert.doesNotMatch(
    JSON.stringify(report),
    /private-(staged|unstaged|draft)/,
  );
});

test("changed heads require a bundle and all referenced payloads; presence never certifies their contents", async (t) => {
  const path = await transfer(await repository(t));
  await writeFile(
    join(path, "state.json"),
    JSON.stringify({
      ...state,
      next: "b".repeat(40),
      incoming: ["folder/remote.txt"],
      previousExtras: ["old.txt"],
    }),
  );
  const missing = await verifyRecoveryTransfer(path);
  assert.equal(missing.complete, false);
  assert.equal(
    missing.checks.filter((check) => check.status === "fail").length,
    3,
  );
  await writeFile(join(path, "commits.bundle"), "not a real bundle");
  await mkdir(join(path, "incoming", "folder"), { recursive: true });
  await mkdir(join(path, "previous-files"));
  await writeFile(
    join(path, "incoming", "folder", "remote.txt"),
    "private-remote",
  );
  await writeFile(join(path, "previous-files", "old.txt"), "private-old");
  const present = await verifyRecoveryTransfer(path);
  assert.equal(present.complete, true);
  assert.equal(present.integrity, "unverified");
  assert.doesNotMatch(
    JSON.stringify(present),
    /not a real bundle|private-(remote|old)/,
  );
  await rm(join(path, "previous.patch"));
  await mkdir(join(path, "previous.patch"));
  assert.ok(
    (await verifyRecoveryTransfer(path)).checks.some(
      (check) => check.code === "UNEXPECTED_TYPE",
    ),
  );
});

test("invalid schemas, unsafe paths and excess path counts fail before inspecting references", async (t) => {
  const path = await transfer(await repository(t));
  const invalid: unknown[] = [
    null,
    [],
    {},
    { ...state, previous: "not-an-oid" },
    { ...state, next: "b".repeat(64) },
    { ...state, incoming: "file" },
    { ...state, previousExtras: ["duplicate", "duplicate"] },
    {
      ...state,
      incoming: Array.from(
        { length: recoveryVerificationDefaults.maxPaths + 1 },
        (_, index) => `${index}`,
      ),
    },
  ];
  for (const incoming of [
    [null],
    [""],
    ["../private"],
    ["a/../../private"],
    ["/private"],
    ["C:/private"],
    ["C:private"],
    ["a\\..\\private"],
    [".GIT/config"],
    ["a//file"],
    ["./file"],
    ["a\0b"],
  ])
    invalid.push({ ...state, incoming });
  for (const record of invalid) {
    await writeFile(join(path, "state.json"), JSON.stringify(record));
    const report = await verifyRecoveryTransfer(path);
    assert.equal(report.complete, false);
    assert.equal(report.checks.length, 1);
    assert.equal(report.checks[0]?.code, "INVALID_STATE");
  }
  await writeFile(
    join(path, "state.json"),
    JSON.stringify({
      ...state,
      previous: "a".repeat(64),
      next: "a".repeat(64),
    }),
  );
  assert.equal((await verifyRecoveryTransfer(path)).complete, true);
});

test("missing, malformed and oversized state records produce reports without reading patches", async (t) => {
  const path = await transfer(await repository(t));
  for (const contents of [
    "{ private-json",
    "x".repeat(recoveryVerificationDefaults.maxStateBytes + 1),
  ]) {
    await writeFile(join(path, "state.json"), contents);
    const report = await verifyRecoveryTransfer(path);
    assert.equal(report.complete, false);
    assert.equal(report.checks[0]?.code, "STATE_UNAVAILABLE");
    assert.doesNotMatch(JSON.stringify(report), /private-json/);
  }
  await rm(join(path, "state.json"));
  assert.equal(
    (await verifyRecoveryTransfer(path)).checks[0]?.code,
    "STATE_UNAVAILABLE",
  );
  await assert.rejects(
    verifyRecoveryTransfer(join(path, "missing")),
    /Directory is unavailable/,
  );
});

test("payload leaf symlinks are preserved without following targets and parent or metadata symlinks are refused", async (t) => {
  const root = await repository(t);
  const path = await transfer(root);
  const outside = join(root, "outside");
  await mkdir(outside);
  await writeFile(join(outside, "private-target"), "private-content");
  await mkdir(join(path, "incoming"));
  await symlink(outside, join(path, "incoming", "link"), "junction");
  await writeFile(
    join(path, "state.json"),
    JSON.stringify({ ...state, incoming: ["link"] }),
  );
  const leaf = await verifyRecoveryTransfer(path);
  assert.equal(leaf.complete, true);
  assert.equal(leaf.checks.at(-1)?.code, "SYMLINK_PRESENT");
  assert.doesNotMatch(JSON.stringify(leaf), /private-target|private-content/);
  await writeFile(
    join(path, "state.json"),
    JSON.stringify({ ...state, incoming: ["link/private-target"] }),
  );
  assert.equal(
    (await verifyRecoveryTransfer(path)).checks.at(-1)?.code,
    "FILE_UNAVAILABLE",
  );
  await rm(join(path, "state.json"));
  await symlink(outside, join(path, "state.json"), "junction");
  assert.equal(
    (await verifyRecoveryTransfer(path)).checks[0]?.code,
    "STATE_UNAVAILABLE",
  );
  assert.equal(
    await readFile(join(outside, "private-target"), "utf8"),
    "private-content",
  );
});

test(
  "special state and patch files do not block verification",
  { skip: process.platform === "win32", timeout: 5000 },
  async (t) => {
    const path = await transfer(await repository(t));
    await rm(join(path, "remote.patch"));
    let result = await executeProcess({
      executable: "mkfifo",
      arguments: [join(path, "remote.patch")],
    });
    assert.equal(result.status, 0);
    assert.equal(
      (await verifyRecoveryTransfer(path)).checks[1]?.code,
      "UNEXPECTED_TYPE",
    );
    await rm(join(path, "state.json"));
    result = await executeProcess({
      executable: "mkfifo",
      arguments: [join(path, "state.json")],
    });
    assert.equal(result.status, 0);
    assert.equal(
      (await verifyRecoveryTransfer(path)).checks[0]?.code,
      "STATE_UNAVAILABLE",
    );
  },
);

test("verify CLI requires a transfer path and reports structure separately from integrity", async (t) => {
  const path = await transfer(await repository(t));
  const run = (args: string[]) =>
    executeProcess({
      executable: process.execPath,
      arguments: [cli, "recovery", "verify", ...args],
    });
  const success = await run(["--directory", path, "--json"]);
  assert.equal(success.status, 0, success.stderr);
  assert.equal(JSON.parse(success.stdout).complete, true);
  assert.equal(JSON.parse(success.stdout).integrity, "unverified");
  const text = await run(["--directory", path]);
  assert.match(text.stdout, /Requested transfer checks passed/);
  assert.match(text.stdout, /restorability are unverified/);
  await rm(join(path, "previous-index.patch"));
  const failure = await run(["--directory", path]);
  assert.equal(failure.status, 1);
  assert.equal(failure.stderr, "");
  assert.match(failure.stdout, /\[FAIL\] FILE_UNAVAILABLE/);
  for (const args of [
    [],
    ["--directory", path, "extra"],
    ["--directory", path, "--git"],
    ["--directory", path, "--repository", path],
  ]) {
    const result = await run(args);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Usage|Unsupported|requires/);
  }
  assert.ok((await lstat(path)).isDirectory());
});
