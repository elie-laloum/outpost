import assert from "node:assert/strict";
import { fork } from "node:child_process";
import { once } from "node:events";
import { mkdir, readFile, readdir, symlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { reserveRecoveryStorage } from "../../src/application/storage-reservation.ts";
import { openWorkspace } from "../../src/application/workspace.ts";
import { createSandbox } from "../../src/application/sandbox.ts";
import { lock } from "../../src/infrastructure/git/lock.ts";
import { localProcessIdentity } from "../../src/infrastructure/git/process-identity.ts";
import { storageMutationLockDefaults } from "../../src/infrastructure/storage-mutation-lock.constants.ts";
import { storageReservationDefaults } from "../../src/infrastructure/storage-reservations.constants.ts";
import { repository } from "../helpers.ts";
import { local } from "../../src/providers/local.ts";

const options = { maxBytes: 1_100_000, reserveBytes: 1_000_000 };
const records = (root: string) =>
  join(root, ".outpost", "locks", "storage-reservations");

test("reservations charge concurrent headroom and release idempotently without deleting recovery data", async (t) => {
  const root = await repository(t);
  const recovery = join(root, ".outpost", "recovery");
  await mkdir(recovery, { recursive: true });
  await writeFile(join(recovery, "backup"), "valuable");
  const first = await reserveRecoveryStorage({ repository: root, ...options });
  await assert.rejects(
    reserveRecoveryStorage({ repository: root, ...options }),
    /reservation admission refused/,
  );
  const data: unknown = JSON.parse(
    await readFile(join(records(root), `${first.id}.json`), "utf8"),
  );
  assert.ok(
    data &&
      typeof data === "object" &&
      "pid" in data &&
      data.pid === process.pid,
  );
  await Promise.all([first.release(), first.release()]);
  await first[Symbol.asyncDispose]();
  const second = await reserveRecoveryStorage({ repository: root, ...options });
  await second.release();
  assert.equal(await readFile(join(recovery, "backup"), "utf8"), "valuable");
  assert.deepEqual(await readdir(records(root)), []);
});

test(
  "separate Node processes cannot both consume the same available quota",
  { timeout: 20_000 },
  async (t) => {
    const root = await repository(t);
    const children = Array.from({ length: 2 }, () =>
      fork(resolve("test/fixtures/storage-reservations.ts"), [root], {
        stdio: ["ignore", "ignore", "inherit", "ipc"],
      }),
    );
    try {
      const replies = await Promise.all(
        children.map(async (child) => {
          const reply = once(child, "message");
          child.send("acquire");
          return (await reply)[0];
        }),
      );
      assert.equal(
        replies.filter((reply) => reply.status === "acquired").length,
        1,
      );
      assert.equal(
        replies.filter((reply) => reply.status === "refused").length,
        1,
      );
      assert.match(
        replies.find((reply) => reply.status === "refused").message,
        /reservation admission refused/,
      );
      const winner =
        children[replies.findIndex((reply) => reply.status === "acquired")]!;
      const released = once(winner, "message");
      winner.send("release");
      assert.equal((await released)[0].status, "released");
    } finally {
      await Promise.all(
        children.map(async (child) => {
          const exited = once(child, "exit");
          child.kill();
          await exited;
        }),
      );
    }
  },
);

test(
  "a crashed local owner is reclaimed only when process identity establishes inactivity",
  { timeout: 20_000 },
  async (t) => {
    if (!(await localProcessIdentity()))
      return t.skip("Local identity unavailable");
    const root = await repository(t);
    const child = fork(
      resolve("test/fixtures/storage-reservations.ts"),
      [root],
      { stdio: ["ignore", "ignore", "inherit", "ipc"] },
    );
    try {
      const reply = once(child, "message");
      child.send("acquire");
      assert.equal((await reply)[0].status, "acquired");
    } finally {
      const exited = once(child, "exit");
      child.kill("SIGKILL");
      await exited;
    }
    assert.equal((await readdir(records(root))).length, 1);
    const replacement = await reserveRecoveryStorage({
      repository: root,
      ...options,
    });
    assert.deepEqual(await readdir(records(root)), [`${replacement.id}.json`]);
    await replacement.release();
  },
);

test("uncertain owners remain charged and malformed records fail closed", async (t) => {
  const root = await repository(t);
  const first = await reserveRecoveryStorage({ repository: root, ...options });
  const path = join(records(root), `${first.id}.json`);
  const record = JSON.parse(await readFile(path, "utf8"));
  await writeFile(path, JSON.stringify({ ...record, identity: undefined }));
  await assert.rejects(
    reserveRecoveryStorage({ repository: root, ...options }),
    /admission refused/,
  );
  await writeFile(path, "{}");
  await assert.rejects(
    reserveRecoveryStorage({ repository: root, ...options }),
    /invalid; admission refused/,
  );
  await assert.rejects(first.release(), /invalid/);
  await writeFile(path, "{");
  await assert.rejects(
    reserveRecoveryStorage({ repository: root, ...options }),
    /unreadable; admission refused/,
  );
  await writeFile(path, JSON.stringify(record));
  await first.release();
});

test("partial inventory and invalid bounds refuse admission without creating claims", async (t) => {
  const root = await repository(t);
  await assert.rejects(
    reserveRecoveryStorage({ repository: root, ...options, maxEntries: 1 }),
    /admission refused/,
  );
  assert.deepEqual(await readdir(records(root)), []);
  await assert.rejects(
    reserveRecoveryStorage({ repository: root, ...options, maxBytes: -1 }),
    /nonnegative/,
  );
  await assert.rejects(
    reserveRecoveryStorage({ repository: root, ...options, reserveBytes: NaN }),
    /nonnegative/,
  );
  await assert.rejects(
    reserveRecoveryStorage({
      repository: root,
      ...options,
      reserveBytes: Number.MAX_SAFE_INTEGER,
    }),
    /admission refused/,
  );
});

test("cancellation interrupts lock waiting without creating a reservation", async (t) => {
  const root = await repository(t);
  const release = await lock(root, storageMutationLockDefaults.lockKey);
  try {
    await assert.rejects(
      reserveRecoveryStorage({
        repository: root,
        ...options,
        signal: AbortSignal.timeout(50),
      }),
      /abort/i,
    );
  } finally {
    await release();
  }
  await assert.rejects(
    reserveRecoveryStorage({
      repository: root,
      ...options,
      signal: AbortSignal.abort(new Error("cancelled")),
    }),
    /cancelled/,
  );
  const reservation = await reserveRecoveryStorage({
    repository: root,
    ...options,
  });
  await reservation.release();
});

test("workspace reservations span warm ownership and release on close while preserving dirty content", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "reserved" },
    storageQuota: options,
  });
  assert.equal((await readdir(records(root))).length, 1);
  await assert.rejects(
    reserveRecoveryStorage({ repository: root, ...options }),
    /admission refused/,
  );
  await assert.rejects(
    createSandbox({ workspace, storageQuota: options }),
    /owns its repository/,
  );
  const sandbox = await workspace.sandbox({ provider: local() });
  await assert.rejects(workspace.close(), /Close the sandbox/);
  assert.equal((await readdir(records(root))).length, 1);
  await sandbox.close();
  assert.equal((await readdir(records(root))).length, 1);
  const content = join(workspace.directory, "important");
  await writeFile(content, "preserve");
  assert.equal(
    (await workspace.close()).retainedDirectory,
    workspace.directory,
  );
  await workspace.close();
  assert.deepEqual(await readdir(records(root)), []);
  assert.equal(await readFile(content, "utf8"), "preserve");
});

test("workspace allocation and startup hook failures release reservations", async (t) => {
  const root = await repository(t);
  await assert.rejects(
    openWorkspace({
      repository: root,
      branch: { mode: "named", name: "invalid branch" },
      storageQuota: options,
    }),
  );
  assert.deepEqual(await readdir(records(root)), []);
  await assert.rejects(
    openWorkspace({
      repository: root,
      storageQuota: options,
      hooks: {
        workspaceReady: [
          {
            executable: process.execPath,
            arguments: ["-e", "process.exit(1)"],
          },
        ],
      },
    }),
  );
  assert.deepEqual(await readdir(records(root)), []);
  await assert.rejects(
    createSandbox({
      repository: root,
      storageQuota: options,
      provider: {
        name: "broken",
        placement: "mounted",
        acquire: async () => {
          throw new Error("provider failed");
        },
      },
    }),
    /provider failed/,
  );
  assert.deepEqual(await readdir(records(root)), []);
});

test("reservation directories and records cannot redirect writes through symlinks", async (t) => {
  const root = await repository(t);
  const external = join(root, "external");
  await mkdir(external);
  await mkdir(join(root, ".outpost", "locks"), { recursive: true });
  try {
    await symlink(external, records(root), "junction");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "EPERM"
    )
      return t.skip("Symlink creation unavailable");
    throw error;
  }
  await assert.rejects(
    reserveRecoveryStorage({ repository: root, ...options }),
    /must not use symlinks/,
  );
  assert.deepEqual(await readdir(external), []);
});
