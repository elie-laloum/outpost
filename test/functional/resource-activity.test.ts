import assert from "node:assert/strict";
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import {
  createSandbox,
  inspectRecovery,
  openWorkspace,
  planRecoveryRetention,
  pruneRecoveryRetention,
  reserveRecoveryStorage,
} from "../../src/index.ts";
import { local } from "../../src/providers/local.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { localProcessIdentity } from "../../src/infrastructure/git/process-identity.ts";
import { registerResourceActivity } from "../../src/infrastructure/resource-activity.ts";
import { resourceActivityDefaults } from "../../src/infrastructure/resource-activity.constants.ts";
import { repository } from "../helpers.ts";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

const inspect = async (root: string) =>
  (await inspectRecovery({ repository: root, resources: true })).resources!;

test("real owned commands publish live operation ownership and preserve exclusivity, cancellation, exit status and warm reuse", async (t) => {
  const root = await repository(t);
  const entered = deferred();
  const provider = local();
  const sandbox = await createSandbox({
    repository: root,
    provider: {
      ...provider,
      async acquire(context) {
        const lease = await provider.acquire(context);
        return {
          ...lease,
          invoke(command) {
            entered.resolve();
            return lease.invoke(command);
          },
        };
      },
    },
  });
  t.after(() => sandbox.close());
  const initial = (await inspect(root)).entries[0]!;
  assert.equal(initial.record?.phase, "ready");
  assert.equal(initial.record?.pid, process.pid);
  assert.equal(
    initial.ownership.status,
    (await localProcessIdentity()) ? "active" : "unknown",
  );
  const stop = new AbortController();
  const command = sandbox.command({
    executable: process.execPath,
    arguments: ["-e", "setInterval(() => {}, 1000)"],
    signal: stop.signal,
    variables: { PRIVATE_VALUE: "never-record-this" },
  });
  const rejected = assert.rejects(command);
  await entered.promise;
  const running = (await inspect(root)).entries[0]!.record!;
  assert.deepEqual(
    running.operations.map((operation) => operation.kind),
    ["command", "invoke"],
  );
  assert.throws(
    () => sandbox.command({ executable: "invalid" }),
    /active operation/,
  );
  assert.doesNotMatch(
    await readFile(initial.path, "utf8"),
    /setInterval|PRIVATE_VALUE|never-record-this/,
  );
  stop.abort(new Error("cancel command"));
  await rejected;
  const failed = (await inspect(root)).entries[0]!.record!;
  assert.equal(failed.operations.length, 0);
  assert.equal(failed.lastFailure?.kind, "command");
  assert.equal(
    (
      await sandbox.command({
        executable: process.execPath,
        arguments: ["-e", "process.stdout.write('done'); process.exitCode=7"],
      })
    ).status,
    7,
  );
  assert.equal(
    (await inspect(root)).entries[0]!.record!.lastOperation?.outcome,
    "completed",
  );
  await sandbox.close();
  assert.equal((await inspect(root)).entries.length, 0);
});

test("owned diagnostics expose in-flight transfers and complete without losing the reusable lease", async (t) => {
  const root = await repository(t);
  const entered = deferred();
  const proceed = deferred();
  const provider = local();
  const sandbox = await createSandbox({
    repository: root,
    provider: {
      ...provider,
      async acquire(context) {
        const lease = await provider.acquire(context);
        return {
          ...lease,
          async upload(source, destination, options) {
            entered.resolve();
            await proceed.promise;
            await lease.upload(source, destination, options);
          },
        };
      },
    },
  });
  t.after(() => sandbox.close());
  const pending = sandbox.diagnose({ transfers: true });
  await entered.promise;
  assert.deepEqual(
    (await inspect(root)).entries[0]!.record!.operations.map(
      (operation) => operation.kind,
    ),
    ["diagnose", "upload"],
  );
  proceed.resolve();
  assert.equal((await pending).hasFailures, false);
  assert.equal((await inspect(root)).entries[0]!.record!.operations.length, 0);
  assert.equal(
    (
      await sandbox.command({
        executable: process.execPath,
        arguments: ["--version"],
      })
    ).status,
    0,
  );
});

test("allocation and closure are observable while independent workspaces outlive successful sandbox disposal", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({ repository: root });
  const acquiring = deferred();
  const acquired = deferred();
  const releasing = deferred();
  const released = deferred();
  const provider = local();
  const pending = workspace.sandbox({
    provider: {
      ...provider,
      async acquire(context) {
        acquiring.resolve();
        await acquired.promise;
        const lease = await provider.acquire(context);
        return {
          ...lease,
          async release() {
            releasing.resolve();
            await released.promise;
            await lease.release();
          },
        };
      },
    },
  });
  await acquiring.promise;
  assert.equal((await inspect(root)).entries[0]!.record?.phase, "allocating");
  acquired.resolve();
  const sandbox = await pending;
  const closing = sandbox.close();
  await releasing.promise;
  assert.equal((await inspect(root)).entries[0]!.record?.phase, "closing");
  assert.equal(sandbox.close(), closing);
  released.resolve();
  await closing;
  const replacement = await workspace.sandbox({ provider: local() });
  await replacement.close();
  await workspace.close();
  assert.equal((await inspect(root)).entries.length, 0);
});

test("failed provider cleanup keeps bounded records and protects the associated workspace from retention", async (t) => {
  const root = await repository(t);
  const provider = local();
  const sandbox = await createSandbox({
    repository: root,
    branch: { mode: "named", name: "retained-provider" },
    provider: {
      ...provider,
      async acquire(context) {
        const lease = await provider.acquire(context);
        return {
          ...lease,
          async release() {
            await lease.release();
            throw new Error("cleanup failed");
          },
        };
      },
    },
  });
  await assert.rejects(sandbox.close(), /cleanup failed/);
  const report = await inspect(root);
  assert.equal(report.entries[0]!.record?.phase, "cleanup-failed");
  assert.equal((await lstat(sandbox.workspace.directory)).isDirectory(), true);
  if (process.platform !== "win32")
    assert.equal((await lstat(report.entries[0]!.path)).mode & 0o777, 0o600);
  const plan = await planRecoveryRetention({
    repository: root,
    policy: {
      version: 1,
      scopes: ["clean-workspaces", "closed-logs"],
      minAgeMs: 0,
    },
  });
  assert.equal(
    plan.entries.find((entry) => entry.path === sandbox.workspace.directory)
      ?.reason,
    "RESOURCE_ACTIVITY_RECORDED",
  );
  assert.equal(
    plan.entries.find((entry) => entry.path.endsWith("resource-activity"))
      ?.reason,
    "OWNERSHIP_RECORD_PROTECTED",
  );
  await pruneRecoveryRetention(plan);
  assert.equal((await inspect(root)).entries.length, 1);
  assert.ok(await readFile(report.entries[0]!.path));
});

test("startup failure retains uncertain allocations and failed releases while pre-allocation failures clean up", async (t) => {
  const root = await repository(t);
  await assert.rejects(
    createSandbox({
      repository: root,
      branch: { mode: "named", name: "before-allocation" },
      provider: {
        ...local(),
        name: "x".repeat(resourceActivityDefaults.maxText + 1),
        async acquire() {
          assert.fail("must not acquire");
        },
      },
    }),
    /size limit/,
  );
  assert.equal((await inspect(root)).entries.length, 0);
  for (const cause of [
    new Error("acquire failed"),
    new AggregateError(
      [new Error("allocation failed"), new Error("cleanup failed")],
      "allocation and cleanup failed",
    ),
  ]) {
    await assert.rejects(
      createSandbox({
        repository: root,
        branch: {
          mode: "named",
          name: `uncertain-${cause instanceof AggregateError ? "aggregate" : "plain"}`,
        },
        provider: {
          ...local(),
          async acquire() {
            throw cause;
          },
        },
      }),
      (error) => error === cause,
    );
  }
  const uncertain = (await inspect(root)).entries;
  assert.equal(uncertain.length, 2);
  for (const entry of uncertain) {
    assert.equal(entry.record?.phase, "allocation-uncertain");
    assert.equal((await lstat(entry.record!.workspace)).isDirectory(), true);
  }
  const provider = local();
  await assert.rejects(
    createSandbox({
      repository: root,
      branch: { mode: "named", name: "failed-setup" },
      hooks: {
        sandboxReady: [
          {
            executable: process.execPath,
            arguments: ["-e", "process.exit(3)"],
          },
        ],
      },
      provider: {
        ...provider,
        async acquire(context) {
          const lease = await provider.acquire(context);
          return {
            ...lease,
            async release() {
              await lease.release();
              throw new Error("release failed");
            },
          };
        },
      },
    }),
  );
  const retained = (await inspect(root)).entries.find(
    (entry) => entry.record?.phase === "cleanup-failed",
  )!.record!;
  assert.equal((await lstat(retained.workspace)).isDirectory(), true);
});

test("parallel sandboxes and storage reservations keep distinct private ownership records", async (t) => {
  const root = await repository(t);
  const reservation = await reserveRecoveryStorage({
    repository: root,
    maxBytes: 1_000_000,
    reserveBytes: 1000,
  });
  const sandboxes = await Promise.all(
    ["first", "second"].map((name) =>
      createSandbox({
        repository: root,
        provider: local(),
        branch: { mode: "named", name },
      }),
    ),
  );
  const records = (await inspect(root)).entries;
  assert.equal(records.length, 2);
  assert.notEqual(records[0]!.record?.id, records[1]!.record?.id);
  assert.equal(
    (await readdir(join(root, ".outpost", "locks", "storage-reservations")))
      .length,
    1,
  );
  await Promise.all(sandboxes.map((sandbox) => sandbox.close()));
  await reservation.release();
  assert.equal((await inspect(root)).entries.length, 0);
});

test("resource inspection is read-only, bounded and conservative for stale, foreign, malformed and symlinked ownership", async (t) => {
  const root = await repository(t);
  assert.equal((await inspect(root)).complete, true);
  await assert.rejects(lstat(join(root, ".outpost")), { code: "ENOENT" });
  const handle = await registerResourceActivity({
    repository: root,
    workspace: root,
    provider: "fixture",
    placement: "remote",
  });
  const entry = (await inspect(root)).entries[0]!;
  const original = JSON.parse(await readFile(entry.path, "utf8"));
  const identity = await localProcessIdentity();
  for (const changed of [
    { ...original, identity: undefined },
    { ...original, identity: { ...identity, host: "another-host" } },
    { ...original, identity: { ...identity, started: "0" } },
  ]) {
    await writeFile(entry.path, JSON.stringify(changed));
    assert.equal((await inspect(root)).entries[0]!.ownership.status, "unknown");
  }
  if (identity) {
    await writeFile(
      entry.path,
      JSON.stringify({ ...original, pid: 2_147_483_647 }),
    );
    assert.equal(
      (await inspect(root)).entries[0]!.ownership.status,
      "inactive",
    );
    assert.ok(await readFile(entry.path));
  }
  const directory = join(root, ".outpost", "locks", "resource-activity");
  await writeFile(join(directory, "bad.json"), "private-malformed-content");
  const report = await inspect(root);
  assert.equal(report.complete, false);
  assert.equal(
    report.entries.find((entry) => entry.path.endsWith("bad.json"))?.ownership
      .status,
    "unknown",
  );
  assert.doesNotMatch(JSON.stringify(report), /private-malformed-content/);
  assert.equal(
    (
      await inspectRecovery({
        repository: root,
        resources: true,
        maxEntries: 1,
      })
    ).resources?.complete,
    false,
  );
  const outside = join(root, "outside.json");
  await writeFile(outside, JSON.stringify(original));
  await symlink(outside, join(directory, "symlink.json"));
  assert.equal(
    (await inspect(root)).entries.find((entry) =>
      entry.path.endsWith("symlink.json"),
    )?.record,
    undefined,
  );
  await writeFile(entry.path, JSON.stringify(original));
  await handle.remove();
});

test("resource CLI reports live records in JSON and text and fails honestly on malformed records", async (t) => {
  const root = await repository(t);
  const sandbox = await createSandbox({ repository: root, provider: local() });
  t.after(() => sandbox.close());
  const run = (...args: string[]) =>
    executeProcess({
      executable: process.execPath,
      arguments: [
        resolve("src/cli/main.ts"),
        "recovery",
        "inspect",
        "--repository",
        root,
        "--resources",
        ...args,
      ],
    });
  const json = await run("--json");
  assert.equal(json.status, 0, json.stderr);
  assert.equal(
    JSON.parse(json.stdout).resources.entries[0].record.phase,
    "ready",
  );
  const text = await run();
  assert.equal(text.status, 0, text.stderr);
  assert.match(text.stdout, /Recorded sandbox activity/);
  assert.match(text.stdout, /ready \| idle/);
  await writeFile(
    join(root, ".outpost", "locks", "resource-activity", "invalid.json"),
    "invalid",
  );
  const invalid = await run();
  assert.equal(invalid.status, 1);
  assert.match(invalid.stdout, /RESOURCE_RECORD_UNREADABLE/);
});

test("tracking bounds concurrent operations, rejects replacement ownership and keeps unsettled resources", async (t) => {
  const root = await repository(t);
  const handle = await registerResourceActivity({
    repository: root,
    workspace: root,
    provider: "fixture",
    placement: "host",
  });
  const proceed = deferred();
  const started = deferred();
  let count = 0;
  const operations = Array.from({ length: 80 }, () =>
    handle.run("invoke", async () => {
      if (++count === 80) started.resolve();
      await proceed.promise;
    }),
  );
  await started.promise;
  const running = (await inspect(root)).entries[0]!.record!;
  assert.equal(running.operations.length, 1);
  assert.equal(running.operations[0]!.count, 80);
  assert.ok(
    (await lstat((await inspect(root)).entries[0]!.path)).size <
      resourceActivityDefaults.maxRecordBytes,
  );
  await assert.rejects(handle.remove(), /unsettled/);
  proceed.resolve();
  await Promise.all(operations);
  const entry = (await inspect(root)).entries[0]!;
  const bytes = await readFile(entry.path);
  await writeFile(entry.path, JSON.stringify({ id: "replacement" }));
  await assert.rejects(handle.remove(), /identity changed/);
  await writeFile(entry.path, bytes);
  await handle.remove();
  await handle.remove();
});

test("symlinked activity storage and excessive metadata refuse allocation before calling a provider", async (t) => {
  const root = await repository(t);
  const outside = join(root, "outside");
  await mkdir(outside);
  await mkdir(join(root, ".outpost", "locks"), { recursive: true });
  await symlink(
    outside,
    join(root, ".outpost", "locks", "resource-activity"),
    "junction",
  );
  await assert.rejects(
    createSandbox({
      repository: root,
      provider: {
        ...local(),
        async acquire() {
          assert.fail("should not acquire");
        },
      },
    }),
    /symlinks/,
  );
  assert.equal((await inspect(root)).complete, false);
  assert.deepEqual(await readdir(outside), []);
  await assert.rejects(
    registerResourceActivity({
      repository: root,
      workspace: root,
      provider: "x".repeat(resourceActivityDefaults.maxText + 1),
      placement: "host",
    }),
    /size limit/,
  );
});

test("activity update failure does not replace the primary execution error", async (t) => {
  const root = await repository(t);
  const handle = await registerResourceActivity({
    repository: root,
    workspace: root,
    provider: "fixture",
    placement: "host",
  });
  const entry = (await inspect(root)).entries[0]!;
  const original = new Error("primary execution error");
  await assert.rejects(
    handle.run("command", async () => {
      await writeFile(entry.path, JSON.stringify({ id: "replacement" }));
      throw original;
    }),
    (error) => error === original,
  );
  assert.ok(await readFile(entry.path));
});

test("a timed out transfer that ignores cancellation retains its owned workspace after release", async (t) => {
  const root = await repository(t);
  const provider = local();
  const finish = deferred();
  const entered = deferred();
  const sandbox = await createSandbox({
    repository: root,
    branch: { mode: "named", name: "unsettled-copy" },
    provider: {
      ...provider,
      async acquire(context) {
        const lease = await provider.acquire(context);
        return {
          ...lease,
          async upload() {
            entered.resolve();
            await finish.promise;
          },
        };
      },
    },
  });
  const diagnostic = sandbox.diagnose({ transfers: true, deadlineMs: 500 });
  await entered.promise;
  assert.equal((await diagnostic).hasFailures, true);
  await assert.rejects(sandbox.close(), /unsettled/);
  const entry = (await inspect(root)).entries[0]!;
  assert.equal(entry.record?.phase, "cleanup-failed");
  assert.equal(entry.record?.operations[0]?.kind, "upload");
  assert.equal((await lstat(sandbox.workspace.directory)).isDirectory(), true);
  finish.resolve();
});

test("an abruptly terminated owner leaves inspectable resources without reclamation", async (t) => {
  const root = await repository(t);
  const facade = pathToFileURL(resolve("src/index.ts")).href;
  const provider = pathToFileURL(resolve("src/providers/local.ts")).href;
  const result = await executeProcess({
    executable: process.execPath,
    arguments: [
      "--input-type=module",
      "-e",
      `import { createSandbox } from ${JSON.stringify(facade)}; import { local } from ${JSON.stringify(provider)}; await createSandbox({ repository: ${JSON.stringify(root)}, provider: local(), branch: { mode: "named", name: "crashed-owner" } }); process.kill(process.pid, "SIGKILL");`,
    ],
    deadlineMs: 10_000,
  });
  assert.notEqual(result.status, 0);
  const entry = (await inspect(root)).entries[0]!;
  assert.equal(entry.record?.phase, "ready");
  assert.equal(
    entry.ownership.status,
    (await localProcessIdentity()) ? "inactive" : "unknown",
  );
  const before = await readFile(entry.path);
  await inspect(root);
  assert.deepEqual(await readFile(entry.path), before);
  assert.equal((await lstat(entry.record!.workspace)).isDirectory(), true);
});
