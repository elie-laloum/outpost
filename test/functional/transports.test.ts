import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdir,
  mkdtemp,
  realpath,
  rm,
  readFile,
  writeFile,
  symlink,
  readlink,
  stat,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import type { TestContext } from "node:test";
import {
  localTransport,
  TransportConflict,
  fileArtifactStore,
  fileWorkflowCheckpointStore,
  workflowCheckpointStore,
  recoverWorkflowCheckpoint,
  artifact,
  publishArtifact,
  readStoredArtifact,
  workflow,
  task,
  readJournal,
  inspectRecovery,
  assertRecoveryQuota,
  planRecoveryRetention,
  pruneRecoveryRetention,
  archiveRecovery,
  materializeRecoveryArchive,
  transportConversations,
  conversations,
  dispatch,
  createSandbox,
} from "../../src/index.ts";
import type { Transport, WorkflowCheckpoint } from "../../src/index.ts";
import { journal } from "../../src/infrastructure/journal.ts";
import { registerResourceActivity } from "../../src/infrastructure/resource-activity.ts";
import { reserveTransportStorage } from "../../src/infrastructure/transport-reservations.ts";
import { captureRecoveryChecksums } from "../../src/application/recovery-checksum-capture.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { s3Fixture } from "../fixtures/s3-transport-server.ts";
import { repository, scripted, emit } from "../helpers.ts";

async function temporary(t: TestContext) {
  const root = await realpath(
    await mkdtemp(join(tmpdir(), "outpost-transports-")),
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
const adapters = {
  local: async (t: TestContext) =>
    localTransport({ directory: join(await temporary(t), "store") }),
  s3: async (t: TestContext) => (await s3Fixture(t)).transporter,
};
async function collect<T>(values: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const value of values) result.push(value);
  return result;
}
const bytes = (value: string) => Buffer.from(value);

test("local transport creates nested storage beneath an existing filesystem root", async (t) => {
  const directory = join(await temporary(t), "missing", "nested", "store");
  const alias =
    process.platform === "win32" ? directory.toUpperCase() : directory;
  const transporter = localTransport({ directory: alias });
  const input = Uint8Array.of(0, 255, 128, 10);
  const entry = await transporter.write("nested/payload", input, {
    ifRevision: null,
  });
  const restored = await localTransport({ directory }).read("nested/payload");
  assert.ok(restored);
  assert.equal(restored.revision, entry.revision);
  assert.deepEqual([...restored.bytes], [...input]);
  await transporter.remove("nested/payload", { ifRevision: entry.revision });
  assert.equal(await transporter.read("nested/payload"), undefined);
});

for (const [name, factory] of Object.entries(adapters)) {
  test(`${name}: binary writes, versions, concurrent creates, stale deletes and bounded reads`, async (t) => {
    const transporter = await factory(t);
    assert.equal(await transporter.read("artifacts/missing"), undefined);
    const input = Uint8Array.of(0, 255, 128, 10);
    const results = await Promise.allSettled([
      transporter.write("artifacts/a", input, { ifRevision: null }),
      transporter.write("artifacts/a", bytes("conflict"), { ifRevision: null }),
    ]);
    assert.equal(
      results.filter((value) => value.status === "fulfilled").length,
      1,
    );
    const original = await transporter.read("artifacts/a");
    assert.ok(original);
    await assert.rejects(transporter.read("artifacts/a", { maxBytes: 0 }));
    const updated = await transporter.write("artifacts/a", input, {
      ifRevision: original.revision,
    });
    assert.notEqual(updated.revision, original.revision);
    await assert.rejects(
      transporter.remove("artifacts/a", { ifRevision: original.revision }),
      TransportConflict,
    );
    for (const key of ["artifacts/b", "artifacts/c", "checkpoints/d"])
      await transporter.write(key, bytes(key), { ifRevision: null });
    const listed = await collect(transporter.list("artifacts/"));
    assert.deepEqual(listed.map((value) => value.key).sort(), [
      "artifacts/a",
      "artifacts/b",
      "artifacts/c",
    ]);
    await transporter.remove("artifacts/a", { ifRevision: updated.revision });
    assert.equal(await transporter.read("artifacts/a"), undefined);
    const signal = AbortSignal.abort(new Error("cancelled"));
    await assert.rejects(
      transporter.write("artifacts/e", input, { ifRevision: null, signal }),
      /cancelled/,
    );
    await assert.rejects(
      transporter.read("artifacts/b", { signal }),
      /cancelled/,
    );
    await assert.rejects(
      collect(transporter.list("", { signal })),
      /cancelled/,
    );
    for (const key of ["../outside", "/root", "a//b", "a/../../b", "a\\b"])
      await assert.rejects(transporter.read(key));
  });

  test(`${name}: artifact publication and workflow restart preserve values and ownership`, async (t) => {
    const transporter = await factory(t);
    const store = fileArtifactStore({ transporter });
    const contract = artifact.binary({ name: "result", version: "1" });
    const options = {
      producer: { executionId: "run", taskKey: "build", attempt: 1 },
    };
    const refs = await Promise.all([
      publishArtifact(store, contract, Uint8Array.of(0, 255), options),
      publishArtifact(store, contract, Uint8Array.of(0, 255), options),
    ]);
    assert.deepEqual(refs[0], refs[1]);
    assert.deepEqual(
      [...(await readStoredArtifact(store, contract, refs[0]!))],
      [0, 255],
    );
    await assert.rejects(
      fileArtifactStore({ transporter, maxBytes: 1 }).put(
        "a".repeat(64),
        Uint8Array.of(1, 2),
      ),
      /maxBytes/,
    );
    let calls = 0;
    const graph = workflow("transport", [
      task({
        key: "build",
        perform: () => {
          calls++;
          return { nested: [1, null] };
        },
      }),
    ]);
    const checkpoint = {
      store: fileWorkflowCheckpointStore({ transporter }),
      runId: "run",
      version: "1",
    };
    (await graph.start({ checkpoint })).unwrap();
    (
      await graph.start({
        checkpoint: {
          ...checkpoint,
          store: workflowCheckpointStore({ transporter }),
        },
      })
    ).unwrap();
    assert.equal(calls, 1);
    const lease = await checkpoint.store.acquire("exclusive");
    await assert.rejects(
      checkpoint.store.acquire("exclusive"),
      /already in use/,
    );
    const key =
      "checkpoints/" +
      createHash("sha256").update("exclusive").digest("hex") +
      ".json";
    const current = await transporter.read(key);
    assert.ok(current);
    await recoverWorkflowCheckpoint({
      transporter,
      runId: "exclusive",
      revision: current.revision,
    });
    await assert.rejects(
      lease.write({
        format: 1,
        identity: "",
        executionId: "",
        records: [],
        values: {},
        usage: { attempts: 0, tokens: { input: 0, output: 0, cached: 0 } },
      }),
      TransportConflict,
    );
    const replacement = await checkpoint.store.acquire("exclusive");
    await assert.rejects(lease.release(), TransportConflict);
    await replacement.release();
    await replacement.release();
    await assert.rejects(replacement.read(), /released/);
  });

  test(`${name}: journals retain order, revisions, partial history and explicit retention`, async (t) => {
    const transporter = await factory(t);
    const log = await journal("", { transporter });
    log.record({ kind: "text", text: "first" });
    log.record({ kind: "raw", value: "hidden" });
    log.record({ kind: "text", text: "second" });
    await log.close();
    assert.ok(log.reference);
    const events = await readJournal({ transporter, reference: log.reference });
    assert.deepEqual(
      events.map((value) => (value as { kind: string }).kind),
      ["dispatch-start", "text", "text"],
    );
    const open = await journal("", { transporter });
    const policy = {
      version: 1 as const,
      scopes: ["closed-logs" as const],
      minAgeMs: 0,
    };
    const plan = await planRecoveryRetention({ transporter, policy });
    assert.equal(plan.entries.filter((entry) => entry.eligible).length, 1);
    await assert.rejects(pruneRecoveryRetention(plan), /transporter/);
    const result = await pruneRecoveryRetention(plan, { transporter });
    assert.equal(result.removed.length, 1);
    assert.ok(open.reference);
    assert.equal(
      (await readJournal({ transporter, reference: open.reference })).length,
      1,
    );
    await open.close();
    const modifiedPlan = await planRecoveryRetention({ transporter, policy });
    const entry = modifiedPlan.entries.find((entry) => entry.eligible);
    assert.ok(entry?.revision);
    await transporter.write(
      entry.path,
      bytes(JSON.stringify({ closed: false, head: null })),
      { ifRevision: entry.revision },
    );
    assert.equal(
      (await pruneRecoveryRetention(modifiedPlan, { transporter })).removed
        .length,
      0,
    );
    await assert.rejects(
      assertRecoveryQuota({ transporter, maxBytes: 0 }),
      /quota/,
    );
    assert.equal(
      (await inspectRecovery({ transporter, maxEntries: 1 })).complete,
      false,
    );
  });

  test(`${name}: reservations serialize admission and remain releasable after cancellation`, async (t) => {
    const transporter = await factory(t);
    const controller = new AbortController();
    const attempts = await Promise.allSettled([
      reserveTransportStorage(transporter, "", {
        maxBytes: 10,
        reserveBytes: 6,
        signal: controller.signal,
      }),
      reserveTransportStorage(transporter, "", {
        maxBytes: 10,
        reserveBytes: 6,
      }),
    ]);
    const succeeded = attempts.filter((value) => value.status === "fulfilled");
    assert.equal(succeeded.length, 1);
    controller.abort();
    for (const result of succeeded) {
      await result.value.release();
      await result.value.release();
    }
    const next = await reserveTransportStorage(transporter, "", {
      maxBytes: 10,
      reserveBytes: 10,
    });
    await next[Symbol.asyncDispose]();
  });

  test(`${name}: resource activity protects concurrent edits and never infers remote liveness`, async (t) => {
    const transporter = await factory(t);
    const activity = await registerResourceActivity({
      transporter,
      repository: "",
      workspace: "/workspace",
      sandboxProvider: "test",
      placement: "remote",
    });
    await activity.phase("ready");
    await activity.run("command", async () => {
      const report = await inspectRecovery({ transporter, resources: true });
      assert.equal(report.resources?.entries[0]?.ownership.status, "unknown");
      assert.equal(report.resources?.entries[0]?.record?.operations.length, 1);
      await assert.rejects(activity.remove(), /unsettled/);
    });
    assert.equal(await activity.idle(), true);
    await activity.remove();
    await activity.remove();
    assert.equal(
      (await inspectRecovery({ transporter, resources: true })).resources
        ?.entries.length,
      0,
    );
    const changed = await registerResourceActivity({
      transporter,
      repository: "",
      workspace: "/workspace",
      sandboxProvider: "test",
      placement: "remote",
    });
    const [entry] = await collect(transporter.list("resources/"));
    assert.ok(entry);
    const object = await transporter.read(entry.key);
    assert.ok(object);
    await transporter.write(entry.key, object.bytes, {
      ifRevision: entry.revision,
    });
    await assert.rejects(changed.phase("ready"), TransportConflict);
    await assert.rejects(changed.remove(), TransportConflict);
  });

  test(`${name}: recovery archives restore binary data, permissions and links after source loss`, async (t) => {
    const root = await temporary(t),
      source = join(root, "source"),
      destination = join(root, "restored");
    await mkdir(join(source, "previous-files"), { recursive: true });
    await writeFile(
      join(source, "previous-files/data"),
      Uint8Array.of(0, 255, 128),
      { mode: 0o755 },
    );
    const extras = ["data"];
    if (process.platform !== "win32") {
      await symlink("data", join(source, "previous-files/link"));
      extras.push("link");
    }
    for (const name of [
      "remote.patch",
      "previous.patch",
      "previous-index.patch",
    ])
      await writeFile(join(source, name), "");
    const state = {
      previous: "a".repeat(40),
      next: "a".repeat(40),
      previousExtras: extras,
      incoming: [],
    };
    await writeFile(join(source, "state.json"), JSON.stringify(state));
    await captureRecoveryChecksums(source, state);
    const transporter = await factory(t);
    const reference = await archiveRecovery({ transporter, directory: source });
    await rm(source, { recursive: true });
    await materializeRecoveryArchive({ transporter, reference, destination });
    assert.deepEqual(
      [...(await readFile(join(destination, "previous-files/data")))],
      [0, 255, 128],
    );
    if (process.platform !== "win32") {
      assert.equal(
        (await stat(join(destination, "previous-files/data"))).mode & 0o777,
        0o755,
      );
      assert.equal(
        await readlink(join(destination, "previous-files/link")),
        "data",
      );
    }
    await assert.rejects(
      materializeRecoveryArchive({ transporter, reference, destination }),
    );
    await assert.rejects(
      materializeRecoveryArchive({
        transporter,
        reference,
        destination: join(root, "bounded"),
        maxBytes: 1,
      }),
      /limit/,
    );
  });

  test(`${name}: transported conversations restore transcripts and child files across repositories`, async (t) => {
    const root = await temporary(t),
      home = join(root, "home"),
      repo = join(root, "repository"),
      stage = join(root, "staging");
    await mkdir(repo);
    const native = conversations.claudePath("conversation-id", repo, home);
    await mkdir(join(native.slice(0, -".jsonl".length), "subagents"), {
      recursive: true,
    });
    await writeFile(
      native,
      JSON.stringify({ cwd: repo, text: "parent" }) + "\n",
    );
    await writeFile(
      join(native.slice(0, -".jsonl".length), "subagents/child.jsonl"),
      JSON.stringify({ cwd: repo, text: "child" }) + "\n",
    );
    const transporter = await factory(t);
    const store = transportConversations("claude", {
      transporter,
      namespace: "shared-project",
    });
    const sandboxProvider = localSandboxProvider();
    const lease = await sandboxProvider.acquire({
      repository: repo,
      directory: repo,
      gitDirectories: [],
      variables: {},
    });
    const sandbox = { ...lease, home };
    const captured = await store.capture("conversation-id", {
      repository: repo,
      sandbox,
      staging: stage,
      local: true,
    });
    assert.ok(captured.reference);
    assert.deepEqual(
      JSON.parse(
        await readFile(
          join(
            captured.file.slice(0, -".jsonl".length),
            "subagents/child.jsonl",
          ),
          "utf8",
        ),
      ),
      { cwd: repo, text: "child" },
    );
    await rm(home, { recursive: true });
    const elsewhere = join(root, "elsewhere");
    await mkdir(elsewhere);
    const located = await store.locate("conversation-id", elsewhere);
    await store.restore(located, {
      repository: elsewhere,
      sandbox: { ...sandbox, root: elsewhere },
      staging: stage,
    });
    const restored = conversations.claudePath(
      "conversation-id",
      elsewhere,
      home,
    );
    assert.deepEqual(JSON.parse(await readFile(restored, "utf8")), {
      cwd: elsewhere,
      text: "parent",
    });
    assert.deepEqual(
      JSON.parse(
        await readFile(
          join(restored.slice(0, -".jsonl".length), "subagents/child.jsonl"),
          "utf8",
        ),
      ),
      { cwd: elsewhere, text: "child" },
    );
    await lease.release();
  });
}

test("dispatch integrates transport journals, activity and workspace reservations", async (t) => {
  const root = await repository(t),
    transporter = localTransport({
      directory: join(await temporary(t), "store"),
    });
  const sandbox = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: scripted(emit("ok")),
    activityTransport: transporter,
    storageQuota: { transporter, maxBytes: 1_000_000, reserveBytes: 100 },
    logging: { transporter },
  });
  const result = await sandbox.dispatch({ brief: { text: "run" } });
  assert.equal(result.log, undefined);
  assert.ok(result.logReference);
  assert.ok(
    (await readJournal({ transporter, reference: result.logReference }))
      .length > 1,
  );
  assert.equal(
    (await inspectRecovery({ transporter, resources: true })).resources?.entries
      .length,
    1,
  );
  await sandbox.close();
  assert.equal(
    (await inspectRecovery({ transporter, resources: true })).resources?.entries
      .length,
    0,
  );
});

test("transport failures preserve host recovery and do not apply incoming changes", async (t) => {
  const root = await repository(t);
  const { openWorkspace } = await import("../../src/index.ts");
  const { seedRemote } =
    await import("../../src/application/remote-workspace.ts");
  const workspace = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "transport-recovery" },
  });
  t.after(() => workspace.close({ preserve: true }));
  const remote = join(await temporary(t), "remote");
  await mkdir(remote);
  const lease = await localSandboxProvider().acquire({
    repository: remote,
    directory: remote,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  const transporter = await adapters.local(t);
  let fail = true;
  const failing: Transport = {
    ...transporter,
    async write(key, bytes, options) {
      if (fail && key.endsWith("/manifest"))
        throw new Error("storage unavailable");
      return transporter.write(key, bytes, options);
    },
  };
  const sync = await seedRemote(workspace, lease, {
    recoveryTransport: failing,
  });
  t.after(() => sync.close());
  const before = await readFile(join(workspace.directory, "base.txt"), "utf8");
  await writeFile(join(remote, "base.txt"), "incoming");
  await assert.rejects(sync.pull(), /recovery files retained/);
  assert.equal(
    await readFile(join(workspace.directory, "base.txt"), "utf8"),
    before,
  );
  assert.equal(
    (await collect(transporter.list("recovery/"))).some((entry) =>
      entry.key.endsWith("/manifest"),
    ),
    false,
  );
  fail = false;
  await sync.pull();
  assert.equal(
    await readFile(join(workspace.directory, "base.txt"), "utf8"),
    "incoming",
  );
  assert.equal(
    (await collect(transporter.list("recovery/"))).filter((entry) =>
      entry.key.endsWith("/manifest"),
    ).length,
    1,
  );
});

test("journal publication failure preserves the last committed prefix", async (t) => {
  const transporter = await adapters.local(t);
  let fail = false;
  const failing: Transport = {
    ...transporter,
    async write(key, bytes, options) {
      if (fail && key.endsWith("/index")) throw new Error("index unavailable");
      return transporter.write(key, bytes, options);
    },
  };
  const log = await journal("", { transporter: failing, verbose: true });
  assert.ok(log.reference);
  const reference = log.reference;
  fail = true;
  log.record({ kind: "text", text: "uncommitted" });
  await assert.rejects(log.close(), /index unavailable/);
  assert.equal((await readJournal({ transporter, reference })).length, 1);
  const plan = await planRecoveryRetention({
    transporter,
    policy: { version: 1, scopes: ["closed-logs"], minAgeMs: 0 },
  });
  assert.equal(
    plan.entries.some((entry) => entry.eligible),
    false,
  );
});

test("local object roots reject symlinks and archive restoration rejects traversal", async (t) => {
  const root = await temporary(t),
    transporter = localTransport({ directory: join(root, "store") });
  const { restoreArchiveFiles } =
    await import("../../src/infrastructure/transport-archive.ts");
  const manifest = await transporter.write(
    "recovery/forged/manifest",
    bytes(
      JSON.stringify({
        format: 1,
        files: [
          {
            path: "../outside",
            kind: "file",
            mode: 0o600,
            size: 0,
            chunks: [],
          },
        ],
      }),
    ),
    { ifRevision: null },
  );
  await assert.rejects(
    restoreArchiveFiles(transporter, manifest, join(root, "destination")),
    /Unsafe/,
  );
  await assert.rejects(stat(join(root, "outside")), { code: "ENOENT" });
  if (process.platform !== "win32") {
    await symlink(join(root, "store"), join(root, "alias"));
    const alias = localTransport({ directory: join(root, "alias") });
    await assert.rejects(
      alias.write("artifacts/x", bytes("x"), { ifRevision: null }),
      /symlink/,
    );
    await assert.rejects(alias.read(manifest.key), /changed/);
  }
});

test("transport modes reject incompatible configuration and malformed state", async (t) => {
  const transporter = await adapters.local(t);
  assert.throws(
    () => fileArtifactStore({ transporter, directory: "." }),
    /exactly one/,
  );
  assert.throws(
    () => fileWorkflowCheckpointStore({ transporter, directory: "." }),
    /exactly one/,
  );
  await assert.rejects(journal("", { transporter, file: "log" }), /not both/);
  await assert.rejects(
    inspectRecovery({ transporter, git: true }),
    /cannot verify/,
  );
  await assert.rejects(
    planRecoveryRetention({
      transporter,
      policy: { version: 1, scopes: ["clean-workspaces"], minAgeMs: 0 },
    }),
    /cannot inspect/,
  );
  const invalid = await transporter.write(
    "checkpoints/" +
      createHash("sha256").update("invalid").digest("hex") +
      ".json",
    bytes("[]"),
    { ifRevision: null },
  );
  await assert.rejects(
    workflowCheckpointStore({ transporter }).acquire("invalid"),
    /envelope/,
  );
  await assert.rejects(
    recoverWorkflowCheckpoint({
      transporter,
      runId: "invalid",
      revision: invalid.revision,
    }),
    /envelope/,
  );
  await transporter.write("resources/invalid", bytes("{}"), {
    ifRevision: null,
  });
  assert.equal(
    (await inspectRecovery({ transporter, resources: true })).complete,
    false,
  );
  await transporter.write("unknown/file", bytes("x"), { ifRevision: null });
  assert.equal((await inspectRecovery({ transporter })).complete, false);
});
