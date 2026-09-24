import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chmod,
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readlink,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { TestContext } from "node:test";
import {
  planRecoveryRestore,
  restoreRecoveryTransfer,
} from "../../src/index.ts";
import { captureRecoveryChecksums } from "../../src/application/recovery-checksum-capture.ts";
import { git } from "../../src/infrastructure/git/command.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { repository } from "../helpers.ts";

async function fixture(t: TestContext) {
  const root = await repository(t);
  const destinations = await realpath(
    await mkdtemp(join(tmpdir(), "outpost-restored-test-")),
  );
  t.after(() =>
    rm(destinations, { recursive: true, force: true, maxRetries: 5 }),
  );
  const transfer = join(root, ".outpost", "recovery", "transfer");
  await mkdir(join(transfer, "previous-files"), { recursive: true });
  await mkdir(join(transfer, "incoming"));
  const previous = (await git(root, ["rev-parse", "HEAD"])).trim();
  await writeFile(join(root, "base.txt"), "staged\n");
  await git(root, ["add", "base.txt"]);
  await git(root, [
    "diff",
    "--cached",
    "--binary",
    `--output=${join(transfer, "previous-index.patch")}`,
  ]);
  await writeFile(join(root, "base.txt"), "unstaged\n");
  await git(root, [
    "diff",
    "HEAD",
    "--binary",
    `--output=${join(transfer, "previous.patch")}`,
  ]);
  await writeFile(
    join(transfer, "previous-files", "draft.bin"),
    Buffer.from([0, 255, 1, 128]),
  );
  await chmod(join(transfer, "previous-files", "draft.bin"), 0o755);
  await git(root, ["reset", "--hard", previous]);
  await writeFile(join(root, "next.txt"), "remote committed\n");
  await git(root, ["add", "next.txt"]);
  await git(root, ["commit", "-m", "remote"]);
  const next = (await git(root, ["rev-parse", "HEAD"])).trim();
  await git(root, [
    "bundle",
    "create",
    join(transfer, "commits.bundle"),
    "HEAD",
  ]);
  await writeFile(join(root, "base.txt"), "remote unstaged\n");
  await git(root, [
    "diff",
    "HEAD",
    "--binary",
    `--output=${join(transfer, "remote.patch")}`,
  ]);
  await writeFile(
    join(transfer, "incoming", "remote.bin"),
    Buffer.from([128, 0, 255]),
  );
  const state = {
    previous,
    next,
    previousExtras: ["draft.bin"],
    incoming: ["remote.bin"],
  };
  await writeFile(join(transfer, "state.json"), JSON.stringify(state));
  await captureRecoveryChecksums(transfer, state);
  return {
    root,
    transfer,
    destinations,
    state,
    options: {
      directory: transfer,
      repository: root,
      destination: join(destinations, "checkout"),
      side: "previous" as const,
    },
  };
}

test("restoration preserves staged/unstaged differences, binary payloads and permissions without changing host metadata", async (t) => {
  const { root, transfer, options, state } = await fixture(t);
  const before = await Promise.all(
    ["HEAD", "index", "logs/HEAD"].map((name) =>
      readFile(join(root, ".git", name)),
    ),
  );
  const beforeStatus = await git(root, ["status", "--porcelain"]);
  const plan = await planRecoveryRestore(options);
  await assert.rejects(lstat(options.destination), { code: "ENOENT" });
  const result = await restoreRecoveryTransfer(plan);
  assert.equal(result.commit, state.previous);
  assert.equal(result.staging, "preserved");
  assert.equal(
    await readFile(join(result.directory, "base.txt"), "utf8"),
    "unstaged\n",
  );
  assert.equal(await git(result.directory, ["show", ":base.txt"]), "staged\n");
  assert.equal(
    await git(result.directory, ["show", "HEAD:base.txt"]),
    "base\n",
  );
  assert.deepEqual(
    await readFile(join(result.directory, "draft.bin")),
    Buffer.from([0, 255, 1, 128]),
  );
  if (process.platform !== "win32")
    assert.equal(
      (await lstat(join(result.directory, "draft.bin"))).mode & 0o777,
      0o755,
    );
  assert.equal(await git(result.directory, ["remote"]), "");
  assert.match(
    await git(result.directory, ["status", "--porcelain"]),
    /MM base.txt/,
  );
  assert.deepEqual(
    await Promise.all(
      ["HEAD", "index", "logs/HEAD"].map((name) =>
        readFile(join(root, ".git", name)),
      ),
    ),
    before,
  );
  assert.equal(await git(root, ["status", "--porcelain"]), beforeStatus);
  await lstat(join(transfer, "checksums.json"));
  await assert.rejects(restoreRecoveryTransfer(plan), /already exists/);
});

test("incoming restoration imports bundle commits absent from source and reports unavailable original staging", async (t) => {
  const { root, options, state } = await fixture(t);
  await git(root, ["reset", "--hard", state.previous]);
  await git(root, ["reflog", "expire", "--expire=now", "--all"]);
  await git(root, ["gc", "--prune=now"]);
  await assert.rejects(git(root, ["cat-file", "-e", state.next]));
  const result = await restoreRecoveryTransfer(
    await planRecoveryRestore({ ...options, side: "incoming" }),
  );
  assert.equal(result.commit, state.next);
  assert.equal(result.staging, "unavailable");
  assert.equal(
    await readFile(join(result.directory, "next.txt"), "utf8"),
    "remote committed\n",
  );
  assert.equal(
    await readFile(join(result.directory, "base.txt"), "utf8"),
    "remote unstaged\n",
  );
  assert.deepEqual(
    await readFile(join(result.directory, "remote.bin")),
    Buffer.from([128, 0, 255]),
  );
  assert.equal(await git(result.directory, ["diff", "--cached"]), "");
});

test("a changed plan, transfer, corrupt payload, missing manifest or insufficient budget cannot create a destination", async (t) => {
  const { options, transfer, state } = await fixture(t);
  const plan = await planRecoveryRestore(options);
  await assert.rejects(
    restoreRecoveryTransfer({ ...plan, side: "incoming" }),
    /plan changed/,
  );
  await writeFile(join(transfer, "previous-files", "draft.bin"), "changed");
  await assert.rejects(
    restoreRecoveryTransfer(plan),
    /integrity verification failed/,
  );
  await captureRecoveryChecksums(transfer, state);
  await assert.rejects(restoreRecoveryTransfer(plan), /changed since planning/);
  await assert.rejects(
    planRecoveryRestore({ ...options, maxBytes: 1 }),
    /byte limit/,
  );
  await rm(join(transfer, "checksums.json"));
  await assert.rejects(planRecoveryRestore(options));
  await assert.rejects(lstat(options.destination), { code: "ENOENT" });
});

test("destination ownership and source boundaries are checked again after planning", async (t) => {
  const { options, root, transfer } = await fixture(t);
  await assert.rejects(
    planRecoveryRestore({ ...options, destination: join(root, "restored") }),
    /outside/,
  );
  await assert.rejects(
    planRecoveryRestore({
      ...options,
      destination: join(transfer, "restored"),
    }),
    /outside/,
  );
  const plan = await planRecoveryRestore(options);
  await mkdir(options.destination);
  await writeFile(join(options.destination, "owned.txt"), "host edit");
  await assert.rejects(restoreRecoveryTransfer(plan), /already exists/);
  assert.equal(
    await readFile(join(options.destination, "owned.txt"), "utf8"),
    "host edit",
  );
});

test(
  "symlink payloads remain links and collisions retain partial destination and original recovery data",
  { skip: process.platform === "win32" },
  async (t) => {
    const { options, transfer, state } = await fixture(t);
    await symlink("draft.bin", join(transfer, "previous-files", "link"));
    state.previousExtras.push("link");
    await writeFile(join(transfer, "state.json"), JSON.stringify(state));
    await captureRecoveryChecksums(transfer, state);
    const result = await restoreRecoveryTransfer(
      await planRecoveryRestore(options),
    );
    assert.equal(await readlink(join(result.directory, "link")), "draft.bin");
    await cp(
      join(transfer, "previous-files", "draft.bin"),
      join(transfer, "previous-files", "base.txt"),
    );
    state.previousExtras.push("base.txt");
    await writeFile(join(transfer, "state.json"), JSON.stringify(state));
    await captureRecoveryChecksums(transfer, state);
    const destination = `${options.destination}-conflict`;
    await assert.rejects(
      restoreRecoveryTransfer(
        await planRecoveryRestore({ ...options, destination }),
      ),
      /partial destination retained/,
    );
    assert.equal(
      await readFile(join(destination, "base.txt"), "utf8"),
      "unstaged\n",
    );
    await lstat(join(transfer, "checksums.json"));
  },
);

test("CLI plans by default and restores only with explicit apply", async (t) => {
  const { options } = await fixture(t);
  const args = [
    resolve("src/cli/main.ts"),
    "recovery",
    "restore",
    "--directory",
    options.directory,
    "--repository",
    options.repository,
    "--destination",
    options.destination,
    "--side",
    "previous",
  ];
  const planned = await executeProcess({
    executable: process.execPath,
    arguments: [...args, "--json"],
  });
  assert.equal(planned.status, 0, planned.stderr);
  assert.equal(JSON.parse(planned.stdout).staging, "preserved");
  await assert.rejects(lstat(options.destination), { code: "ENOENT" });
  const restored = await executeProcess({
    executable: process.execPath,
    arguments: [...args, "--apply"],
  });
  assert.equal(restored.status, 0, restored.stderr);
  assert.match(restored.stdout, /Restored previous/);
  assert.equal(
    await readFile(join(options.destination, "base.txt"), "utf8"),
    "unstaged\n",
  );
  const invalid = await executeProcess({
    executable: process.execPath,
    arguments: [...args, "--checksums"],
  });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Unsupported recovery restore option/);
});

test("concurrent restorations acquire destination ownership once", async (t) => {
  const { options } = await fixture(t);
  const plan = await planRecoveryRestore(options);
  const results = await Promise.allSettled([
    restoreRecoveryTransfer(plan),
    restoreRecoveryTransfer(JSON.parse(JSON.stringify(plan))),
  ]);
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(
    results.filter((result) => result.status === "rejected").length,
    1,
  );
  assert.equal(
    await readFile(join(options.destination, "base.txt"), "utf8"),
    "unstaged\n",
  );
});

test(
  "invalid state paths and symlink parents cannot escape the transfer snapshot",
  { skip: process.platform === "win32" },
  async (t) => {
    const { options, transfer, state } = await fixture(t);
    await writeFile(
      join(transfer, "state.json"),
      JSON.stringify({ ...state, previousExtras: ["../escape"] }),
    );
    await assert.rejects(
      planRecoveryRestore(options),
      /Invalid recovery transfer state/,
    );
    await symlink("..", join(transfer, "previous-files", "parent"));
    state.previousExtras = ["parent/state.json"];
    await writeFile(join(transfer, "state.json"), JSON.stringify(state));
    await assert.rejects(planRecoveryRestore(options), /traverses a symlink/);
    await assert.rejects(lstat(options.destination), { code: "ENOENT" });
  },
);

test("a transfer with no new commits and empty patches restores a clean independent checkout", async (t) => {
  const { options, transfer, state } = await fixture(t);
  const empty = {
    previous: state.previous,
    next: state.previous,
    previousExtras: [],
    incoming: [],
  };
  await writeFile(join(transfer, "state.json"), JSON.stringify(empty));
  for (const name of ["previous.patch", "previous-index.patch", "remote.patch"])
    await writeFile(join(transfer, name), "");
  await rm(join(transfer, "commits.bundle"));
  await captureRecoveryChecksums(transfer, empty);
  const result = await restoreRecoveryTransfer(
    await planRecoveryRestore(options),
  );
  assert.equal(await git(result.directory, ["status", "--porcelain"]), "");
  assert.equal(
    (await git(result.directory, ["rev-parse", "HEAD"])).trim(),
    state.previous,
  );
  assert.equal(
    await readFile(join(result.directory, "base.txt"), "utf8"),
    "base\n",
  );
});
