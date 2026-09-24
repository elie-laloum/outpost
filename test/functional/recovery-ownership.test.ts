import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, writeFile } from "node:fs/promises";
import { lock, lockPath } from "../../src/infrastructure/git/lock.ts";
import {
  localProcessIdentity,
  observeOwnership,
} from "../../src/infrastructure/git/process-identity.ts";
import { repository } from "../helpers.ts";

test("local identity distinguishes active ownership from legacy, remote and reused PIDs", async () => {
  assert.equal(
    (await observeOwnership(process.pid, undefined)).status,
    "unknown",
  );
  assert.equal((await observeOwnership(process.pid, {})).status, "unknown");
  const identity = await localProcessIdentity();
  if (!identity) return;
  assert.equal(
    (await observeOwnership(process.pid, identity)).status,
    "active",
  );
  assert.equal(
    (await observeOwnership(process.pid, { ...identity, host: "remote" }))
      .reason,
    "OTHER_HOST",
  );
  assert.equal(
    (await observeOwnership(process.pid, { ...identity, boot: "older" }))
      .reason,
    "OTHER_BOOT",
  );
  assert.equal(
    (
      await observeOwnership(process.pid, {
        ...identity,
        namespace: "different",
      })
    ).reason,
    "OTHER_PID_NAMESPACE",
  );
  assert.equal(
    (await observeOwnership(process.pid, { ...identity, started: "0" })).reason,
    "PID_REUSED",
  );
});

test("unknown ownership never authorizes stealing locks, and release never removes another owner's replacement", async (t) => {
  const root = await repository(t);
  const release = await lock(root, "owned");
  const path = lockPath(root, "owned");
  const original = await readFile(path, "utf8");
  const identity = await localProcessIdentity();
  for (const record of [
    { pid: 2147483647 },
    { pid: -1 },
    { pid: 0 },
    { pid: "bad" },
    { pid: 2147483647, identity: { ...identity, host: "elsewhere" } },
  ]) {
    const contents = JSON.stringify(record);
    await writeFile(path, contents);
    await assert.rejects(lock(root, "owned"), /ownership is unknown/);
    assert.equal(await readFile(path, "utf8"), contents);
    await release();
    assert.equal(await readFile(path, "utf8"), contents);
  }
  await writeFile(path, original);
  await release();
  await release();
  await assert.rejects(readFile(path), { code: "ENOENT" });
});

test(
  "only a confirmed exited local owner permits stale lock reclamation",
  { skip: process.platform !== "linux" },
  async (t) => {
    const root = await repository(t);
    const release = await lock(root, "exited");
    const path = lockPath(root, "exited");
    const identity = await localProcessIdentity();
    if (!identity) {
      await release();
      return;
    }
    await writeFile(path, JSON.stringify({ pid: 2147483647, identity }));
    const replacement = await lock(root, "exited");
    await release();
    assert.ok(await readFile(path));
    await replacement();
    await assert.rejects(readFile(path), { code: "ENOENT" });
  },
);

test(
  "concurrent stale-lock contenders cannot unlink a replacement owner",
  { skip: process.platform !== "linux" },
  async (t) => {
    const root = await repository(t);
    const identity = await localProcessIdentity();
    if (!identity) return;
    const first = await lock(root, "race");
    await first();
    const path = lockPath(root, "race");
    for (let iteration = 0; iteration < 10; iteration++) {
      await writeFile(
        path,
        JSON.stringify({ pid: 2147483647, identity, nonce: "stale" }),
      );
      const results = await Promise.allSettled(
        Array.from({ length: 12 }, () => lock(root, "race")),
      );
      const winners = results.filter((result) => result.status === "fulfilled");
      assert.equal(winners.length, 1);
      const before = await readFile(path, "utf8");
      await assert.rejects(lock(root, "race"), /already in use/);
      assert.equal(await readFile(path, "utf8"), before);
      await winners[0]!.value();
    }
  },
);
