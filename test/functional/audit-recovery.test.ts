import assert from "node:assert/strict";
import { test } from "node:test";
import { basename, dirname, join } from "node:path";
import { mkdir, readFile, writeFile, symlink } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { repository } from "../helpers.ts";
import {
  createLocalTransport,
  inspectStorageReservations,
  recoverStorageReservation,
  TransportConflict,
} from "../../src/index.ts";
import { lock, lockPath } from "../../src/infrastructure/git/lock.ts";
import {
  inspectLocalLock,
  recoverLocalLock,
} from "../../src/infrastructure/git/lock-recovery.ts";
import { reserveTransportStorage } from "../../src/infrastructure/transport-reservations.ts";
import type { Transport } from "../../src/index.ts";

test("a terminated owner leaves recoverable locks and reservations while another owner's reservation survives", async (t) => {
  const root = await repository(t);
  const storage = join(root, "crash-storage");
  const child = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
    import { lock } from './src/infrastructure/git/lock.ts';
    import { createLocalTransport } from './src/infrastructure/local-transport.ts';
    import { reserveTransportStorage } from './src/infrastructure/transport-reservations.ts';
    const [root, storage] = process.argv.slice(1);
    await lock(root, 'crashed');
    const held = await reserveTransportStorage(createLocalTransport({ directory: storage }), root, { maxBytes: 100, reserveBytes: 40 });
    process.stdout.write(JSON.stringify({ pid: process.pid, id: held.id }));
    process.exitCode = 19;
  `,
      root,
      storage,
    ],
    { encoding: "utf8" },
  );
  assert.equal(child.status, 19, child.stderr);
  const dead = JSON.parse(child.stdout);
  const transporter = createLocalTransport({ directory: storage });
  const live = await reserveTransportStorage(transporter, root, {
    maxBytes: 100,
    reserveBytes: 40,
  });
  const inspected = await inspectStorageReservations(transporter);
  assert.equal(inspected.reservations[dead.id]?.owner?.pid, dead.pid);
  assert.notEqual(
    inspected.reservations[dead.id]?.owner?.id,
    inspected.reservations[live.id]?.owner?.id,
  );
  await recoverStorageReservation(transporter, {
    id: dead.id,
    revision: inspected.revision!,
    processesStopped: true,
  });
  assert.deepEqual(
    Object.keys((await inspectStorageReservations(transporter)).reservations),
    [live.id],
  );
  const path = lockPath(root, "crashed");
  const snapshot = await inspectLocalLock(dirname(path), basename(path));
  await recoverLocalLock(dirname(path), basename(path), {
    revision: snapshot.revision,
    processesStopped: true,
  });
  await (
    await lock(root, "crashed")
  )();
  await live.release();
});

test("explicit lock recovery handles empty, malformed, legacy and orphan reclaim files without automatic stealing", async (t) => {
  const root = await repository(t);
  const path = lockPath(root, "abandoned");
  const directory = dirname(path);
  await mkdir(directory, { recursive: true });
  for (const contents of ["", "{", JSON.stringify({ pid: 2147483647 })]) {
    await writeFile(path, contents);
    await assert.rejects(lock(root, "abandoned"), /ownership is unknown/);
    const snapshot = await inspectLocalLock(directory, basename(path));
    await recoverLocalLock(directory, basename(path), {
      revision: snapshot.revision,
      processesStopped: true,
    });
    const release = await lock(root, "abandoned");
    await release();
  }
  await writeFile(path, "");
  await writeFile(`${path}.reclaim`, "");
  await assert.rejects(lock(root, "abandoned"), /ownership is unknown/);
  for (const target of [`${path}.reclaim`, path]) {
    const snapshot = await inspectLocalLock(directory, basename(target));
    await recoverLocalLock(directory, basename(target), {
      revision: snapshot.revision,
      processesStopped: true,
    });
  }
  await (
    await lock(root, "abandoned")
  )();
});

test("lock recovery refuses changed snapshots, live owners, symlinks and path traversal", async (t) => {
  const root = await repository(t);
  const release = await lock(root, "guarded");
  const path = lockPath(root, "guarded");
  const directory = dirname(path);
  const name = basename(path);
  const live = await inspectLocalLock(directory, name);
  await assert.rejects(
    recoverLocalLock(directory, name, {
      revision: live.revision,
      processesStopped: true,
    }),
    /still active/,
  );
  await release();
  await writeFile(path, "");
  const empty = await inspectLocalLock(directory, name);
  await writeFile(path, '{"pid":2147483647}');
  await assert.rejects(
    recoverLocalLock(directory, name, {
      revision: empty.revision,
      processesStopped: true,
    }),
    /changed since inspection/,
  );
  assert.equal(await readFile(path, "utf8"), '{"pid":2147483647}');
  await assert.rejects(
    inspectLocalLock(directory, "../base.txt"),
    /Invalid lock name/,
  );
  await assert.rejects(inspectLocalLock(root, name), /Lock directory/);
  if (process.platform !== "win32") {
    const linked = `${path}.reclaim`;
    await symlink(path, linked);
    await assert.rejects(
      inspectLocalLock(directory, basename(linked)),
      /Inspection path/,
    );
  }
});

test("recovery unlock CLI previews revisions and requires explicit stopped-process application", async (t) => {
  const root = await repository(t);
  const path = lockPath(root, "cli");
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, "");
  const args = [
    "src/cli/main.ts",
    "recovery",
    "unlock",
    "--directory",
    dirname(path),
    "--lock",
    basename(path),
    "--json",
  ];
  const run = (...extra: string[]) =>
    spawnSync(process.execPath, [...args, ...extra], { encoding: "utf8" });
  const preview = run();
  assert.equal(preview.status, 0, preview.stderr);
  const snapshot = JSON.parse(preview.stdout);
  assert.equal(await readFile(path, "utf8"), "");
  assert.notEqual(run("--apply", "--revision", snapshot.revision).status, 0);
  const applied = run(
    "--apply",
    "--revision",
    snapshot.revision,
    "--processes-stopped",
  );
  assert.equal(applied.status, 0, applied.stderr);
  assert.deepEqual(JSON.parse(applied.stdout), { recovered: true });
  await assert.rejects(readFile(path), { code: "ENOENT" });
});

test("reservation owners survive inspection and recovery is fenced by the exact ledger revision", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "store") });
  assert.deepEqual(await inspectStorageReservations(transporter), {
    reservations: {},
  });
  const first = await reserveTransportStorage(transporter, root, {
    maxBytes: 100,
    reserveBytes: 40,
  });
  const before = await inspectStorageReservations(transporter);
  const record = before.reservations[first.id]!;
  assert.equal(record.bytes, 40);
  assert.equal(record.owner?.pid, process.pid);
  assert.equal(record.owner?.repository, root);
  assert.ok(record.owner?.host && record.owner.createdAt && record.owner.id);
  const second = await reserveTransportStorage(transporter, root, {
    maxBytes: 100,
    reserveBytes: 30,
  });
  await assert.rejects(
    recoverStorageReservation(transporter, {
      id: first.id,
      revision: before.revision!,
      processesStopped: true,
    }),
    TransportConflict,
  );
  const current = await inspectStorageReservations(transporter);
  assert.equal(current.reservations[second.id]?.owner?.id, record.owner?.id);
  await recoverStorageReservation(transporter, {
    id: first.id,
    revision: current.revision!,
    processesStopped: true,
  });
  const after = await inspectStorageReservations(transporter);
  assert.deepEqual(Object.keys(after.reservations), [second.id]);
  await first.release();
  assert.deepEqual(
    Object.keys((await inspectStorageReservations(transporter)).reservations),
    [second.id],
  );
  await second.release();
});

test("legacy reservations stay counted and identifiable as unknown owners during migration", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({ directory: join(root, "legacy") });
  const id = randomUUID();
  await transporter.write(
    "reservations/ledger",
    Buffer.from(JSON.stringify({ format: 1, reservations: { [id]: 60 } })),
    { ifRevision: null },
  );
  await assert.rejects(
    reserveTransportStorage(transporter, root, {
      maxBytes: 100,
      reserveBytes: 50,
    }),
    /admission refused/,
  );
  const next = await reserveTransportStorage(transporter, root, {
    maxBytes: 100,
    reserveBytes: 30,
  });
  const inspected = await inspectStorageReservations(transporter);
  assert.deepEqual(inspected.reservations[id], { bytes: 60 });
  assert.equal(
    JSON.parse(
      Buffer.from(
        (await transporter.read("reservations/ledger"))!.bytes,
      ).toString(),
    ).format,
    2,
  );
  await recoverStorageReservation(transporter, {
    id,
    revision: inspected.revision!,
    processesStopped: true,
  });
  await next.release();
});

test("reservation recovery preserves a concurrent writer even when it races after the read", async (t) => {
  const root = await repository(t);
  const base = createLocalTransport({ directory: join(root, "race") });
  const first = await reserveTransportStorage(base, root, {
    maxBytes: 100,
    reserveBytes: 10,
  });
  const inspected = await inspectStorageReservations(base);
  let raced = false;
  const transporter: Transport = {
    ...base,
    async write(key, bytes, options) {
      if (!raced) {
        raced = true;
        await reserveTransportStorage(base, root, {
          maxBytes: 100,
          reserveBytes: 10,
        });
      }
      return base.write(key, bytes, options);
    },
  };
  await assert.rejects(
    recoverStorageReservation(transporter, {
      id: first.id,
      revision: inspected.revision!,
      processesStopped: true,
    }),
    TransportConflict,
  );
  assert.equal(
    Object.keys((await inspectStorageReservations(base)).reservations).length,
    2,
  );
});

test("reservation recovery requires stopped-owner authorization and rejects corrupt owner records", async (t) => {
  const root = await repository(t);
  const transporter = createLocalTransport({
    directory: join(root, "validation"),
  });
  const held = await reserveTransportStorage(transporter, root, {
    maxBytes: 100,
    reserveBytes: 10,
  });
  const snapshot = await inspectStorageReservations(transporter);
  await assert.rejects(
    Reflect.apply(recoverStorageReservation, undefined, [
      transporter,
      { id: held.id, revision: snapshot.revision },
    ]),
    /stopped-owner authorization/,
  );
  assert.equal(
    (await inspectStorageReservations(transporter)).revision,
    snapshot.revision,
  );
  for (const owner of [
    {},
    { ...snapshot.reservations[held.id]!.owner, identity: { host: "host" } },
  ]) {
    const current = await transporter.read("reservations/ledger");
    await transporter.write(
      "reservations/ledger",
      Buffer.from(
        JSON.stringify({
          format: 2,
          reservations: { [held.id]: { bytes: 10, owner } },
        }),
      ),
      { ifRevision: current!.revision },
    );
    await assert.rejects(
      inspectStorageReservations(transporter),
      /Invalid reservation (owner|identity)/,
    );
  }
});
