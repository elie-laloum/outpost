import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import type { TestContext } from "node:test";
import {
  mkdtemp,
  readdir,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, parse } from "node:path";
import {
  defineBinaryArtifact,
  defineJsonArtifact,
  defineArtifactTask,
  createArtifactStore,
  publishArtifact,
  readArtifact,
  readStoredArtifact,
  defineTask,
  defineWorkflow,
  createLocalTransport,
} from "../../src/index.ts";
import type { ArtifactStore } from "../../src/index.ts";

const producer = { executionId: "run", taskKey: "build", attempt: 1 };
const binary = defineBinaryArtifact({ name: "bundle", version: "1" });
const json = defineJsonArtifact({
  name: "number",
  version: "1",
  schema(value) {
    if (typeof value !== "number") throw new Error("Expected number");
    return value;
  },
});
async function directory(t: TestContext) {
  const path = await realpath(
    await mkdtemp(join(tmpdir(), "outpost-artifact-")),
  );
  t.after(() => rm(path, { recursive: true, force: true }));
  return path;
}

test("binary and JSON artifacts have immutable identities, lineage and portable references", async (t) => {
  const path = await directory(t),
    store = createArtifactStore({
      transporter: createLocalTransport({ directory: path }),
    });
  const parent = await publishArtifact(store, json, 4, { producer });
  const bytes = Uint8Array.of(0, 255, 128, 13, 10);
  const reference = await publishArtifact(store, binary, bytes, {
    producer,
    parents: [parent],
  });
  assert.deepEqual(reference.parents, [parent.id]);
  assert.equal(reference.size, 5);
  assert.ok(Object.isFrozen(reference));
  assert.ok(Object.isFrozen(reference.parents));
  assert.ok(Object.isFrozen(reference.contract));
  assert.deepEqual(
    await readStoredArtifact(
      store,
      binary,
      JSON.parse(JSON.stringify(reference)),
      { producer, parents: [parent] },
    ),
    bytes,
  );
  assert.equal(await readStoredArtifact(store, json, parent), 4);
  const duplicate = await publishArtifact(store, binary, bytes, {
    producer,
    parents: [parent],
  });
  assert.deepEqual(duplicate, reference);
  const different = await publishArtifact(store, binary, bytes, {
    producer: { ...producer, attempt: 2 },
  });
  assert.notEqual(different.id, reference.id);
  assert.equal(different.digest, reference.digest);
  await assert.rejects(
    readStoredArtifact(store, binary, reference, { parents: [] }),
    /lineage mismatch/,
  );
  await assert.rejects(
    readStoredArtifact(store, binary, reference, {
      producer: { ...producer, attempt: 2 },
    }),
    /producer mismatch/,
  );
  await assert.rejects(
    readStoredArtifact(store, json, reference),
    /contract mismatch/,
  );
  await assert.rejects(
    readStoredArtifact(
      store,
      defineBinaryArtifact({ name: "bundle", version: "2" }),
      reference,
    ),
    /contract mismatch/,
  );
  await assert.rejects(
    publishArtifact(store, binary, bytes, {
      producer,
      parents: [parent, parent],
    }),
    /lineage/,
  );
});

test("schema validation runs on publish and read, including Standard Schema and lossless JSON", async (t) => {
  const store = createArtifactStore({
    transporter: createLocalTransport({ directory: await directory(t) }),
  });
  const reference = await publishArtifact(store, json, 5, { producer });
  const rejected = defineJsonArtifact({
    name: "number",
    version: "1",
    schema: { "~standard": { validate: () => ({ issues: ["rejected"] }) } },
  });
  await assert.rejects(
    readStoredArtifact(store, rejected, reference),
    /schema validation failed/,
  );
  await assert.rejects(
    publishArtifact(store, rejected, undefined, { producer }),
    /schema validation failed/,
  );
  const standard = defineJsonArtifact({
    name: "number",
    version: "1",
    schema: { "~standard": { validate: () => ({ value: 5 }) } },
  });
  assert.equal(
    await readStoredArtifact(
      store,
      standard,
      await publishArtifact(store, standard, 5, { producer }),
    ),
    5,
  );
  const arbitrary = defineJsonArtifact({
    name: "any",
    version: "1",
    schema: (value: unknown) => value,
  });
  await assert.rejects(
    publishArtifact(store, arbitrary, undefined, { producer }),
    /must be JSON/,
  );
  await assert.rejects(
    publishArtifact(store, arbitrary, { bad: undefined }, { producer }),
    /lossless JSON/,
  );
  await assert.rejects(
    publishArtifact(store, json, NaN, { producer }),
    /lossless JSON/,
  );
  assert.throws(
    () => defineBinaryArtifact({ name: "", version: "1" }),
    /nonempty/,
  );
  await assert.rejects(
    binary.encode("bad" as unknown as Uint8Array),
    /Uint8Array/,
  );
  await assert.rejects(json.decode(Buffer.from('"bad"')), /Expected number/);
});

test("missing, corrupt and forged artifacts fail before decoding", async (t) => {
  const path = await directory(t),
    store = createArtifactStore({
      transporter: createLocalTransport({ directory: path }),
    });
  const reference = await publishArtifact(store, binary, Uint8Array.of(1), {
    producer,
  });
  for (const changed of [
    null,
    {},
    { ...reference, format: 2 },
    { ...reference, size: -1 },
    { ...reference, producer: { ...producer, attempt: 0 } },
    { ...reference, producer: { ...producer, taskKey: "forged" } },
    { ...reference, parents: ["../bad"] },
    { ...reference, contract: { ...reference.contract, name: "" } },
  ]) {
    await assert.rejects(
      readStoredArtifact(store, binary, changed),
      /Invalid artifact reference/,
    );
  }
  const transporter = createLocalTransport({ directory: path });
  const object = (await transporter.read(`artifacts/${reference.id}.blob`))!;
  await transporter.write(object.key, Uint8Array.of(2), {
    ifRevision: object.revision,
  });
  await assert.rejects(
    readStoredArtifact(store, binary, reference),
    /integrity mismatch/,
  );
  await assert.rejects(
    publishArtifact(store, binary, Uint8Array.of(1), { producer }),
    /integrity mismatch/,
  );
  assert.ok(
    !(await readdir(path, { recursive: true })).some((name) =>
      name.endsWith(".tmp"),
    ),
  );
  await rm(join(path, "objects", "artifacts", `${reference.id}.blob.object`));
  await assert.rejects(
    readStoredArtifact(store, binary, reference),
    /does not exist/,
  );
});

test("storage bounds, unsafe IDs, symlinks and cancellation do not publish partial files", async (t) => {
  const path = await directory(t),
    store = createArtifactStore({
      transporter: createLocalTransport({ directory: path }),
      maxBytes: 2,
    });
  assert.throws(
    () =>
      createArtifactStore({
        transporter: createLocalTransport({ directory: path }),
        maxBytes: 0,
      }),
    /positive/,
  );
  await assert.rejects(store.get("../outside"), /storage ID/);
  await assert.rejects(store.put("../outside", Uint8Array.of(1)), /storage ID/);
  await assert.rejects(
    publishArtifact(store, binary, Uint8Array.of(1, 2, 3), { producer }),
    /maxBytes/,
  );
  await assert.rejects(
    publishArtifact(store, binary, Uint8Array.of(1), {
      producer,
      signal: AbortSignal.abort(),
    }),
    { name: "AbortError" },
  );
  const reference = await publishArtifact(store, binary, Uint8Array.of(1), {
    producer,
  });
  await assert.rejects(store.get(reference.id, AbortSignal.abort()), {
    name: "AbortError",
  });
  await assert.rejects(
    store.put(reference.id, Uint8Array.of(1), AbortSignal.abort()),
    { name: "AbortError" },
  );
  await assert.rejects(
    readStoredArtifact(store, binary, reference, {
      signal: AbortSignal.abort(),
    }),
    { name: "AbortError" },
  );
  const controller = new AbortController();
  const delayed = defineJsonArtifact({
    name: "delayed",
    version: "1",
    schema(value) {
      controller.abort();
      return value;
    },
  });
  await assert.rejects(
    publishArtifact(store, delayed, 1, { producer, signal: controller.signal }),
    { name: "AbortError" },
  );
  const transporter = createLocalTransport({ directory: path });
  const object = (await transporter.read(`artifacts/${reference.id}.blob`))!;
  await transporter.write(object.key, Buffer.from("large"), {
    ifRevision: object.revision,
  });
  await assert.rejects(
    readStoredArtifact(store, binary, reference),
    /too large|limit/,
  );
  if (process.platform === "win32") return;
  await rm(join(path, "objects", "artifacts", `${reference.id}.blob.object`));
  await writeFile(join(path, "outside"), "x");
  await symlink(
    join(path, "outside"),
    join(path, "objects", "artifacts", `${reference.id}.blob.object`),
  );
  await assert.rejects(
    readStoredArtifact(store, binary, reference),
    /Inspection path/,
  );
  await assert.rejects(
    publishArtifact(store, binary, Uint8Array.of(1), { producer }),
    /Inspection path/,
  );
  await symlink(path, join(path, "alias"));
  const alias = createArtifactStore({
    transporter: createLocalTransport({
      directory: join(path, "alias", "nested"),
    }),
  });
  await assert.rejects(
    publishArtifact(alias, binary, Uint8Array.of(1), { producer }),
    /symlinks/,
  );
});

test("cancellation during a file write removes temporary files", async (t) => {
  const path = await directory(t),
    store = createArtifactStore({
      transporter: createLocalTransport({ directory: path }),
      maxBytes: 32 * 1024 * 1024,
    });
  const controller = new AbortController();
  const pending = store.put(
    "a".repeat(64),
    new Uint8Array(32 * 1024 * 1024),
    controller.signal,
  );
  // Abort once staging exists, before the asynchronous write completes.
  let staged = false;
  for (let attempt = 0; attempt < 1000 && !staged; attempt++) {
    staged = (await readdir(path, { recursive: true })).some((name) =>
      name.endsWith(".tmp"),
    );
    if (!staged) await new Promise((resolve) => setImmediate(resolve));
  }
  assert.ok(staged, "Expected to observe staging before publication");
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
  assert.equal(
    await createLocalTransport({ directory: path }).read(
      "artifacts/" + "a".repeat(64) + ".blob",
    ),
    undefined,
  );
  assert.ok(
    !(await readdir(path, { recursive: true })).some((name) =>
      name.endsWith(".tmp"),
    ),
  );
});

test("artifact tasks enforce dependency declarations and producer execution identity", async () => {
  const saved = new Map<string, Uint8Array>();
  const store: ArtifactStore = {
    async put(id, bytes) {
      saved.set(id, bytes);
    },
    async get(id) {
      return saved.get(id)!;
    },
  };
  const source = defineArtifactTask({
    key: "source",
    contract: json,
    store,
    produce: () => 8,
  });
  const derived = defineArtifactTask({
    key: "derived",
    after: [source],
    contract: json,
    store,
    parents: (context) => [context.value(source)],
    produce: async (context) =>
      (await readArtifact(context, source, json, store)) * 2,
  });
  const good = await defineWorkflow("lineage", [source, derived]).start();
  good.unwrap();
  assert.deepEqual(good.value(derived).parents, [good.value(source).id]);
  assert.equal(await readStoredArtifact(store, json, good.value(derived)), 16);
  const undeclared = defineTask({
    key: "undeclared",
    perform: (context) => readArtifact(context, source, json, store),
  });
  const failed = await defineWorkflow("undeclared", [
    source,
    undeclared,
  ]).start();
  assert.match(
    failed.tasks.find((item) => item.key === "undeclared")?.error ?? "",
    /undeclared dependency/,
  );
  const forged = defineTask({
    key: "forged",
    perform: () => good.value(source),
  });
  const consumer = defineTask({
    key: "consumer",
    after: [forged],
    perform: (context) => readArtifact(context, forged, json, store),
  });
  const rejected = await defineWorkflow("producer", [forged, consumer]).start();
  assert.match(rejected.tasks[1]?.error ?? "", /producer mismatch/);
});

test("concurrent publishers never replace committed data and binary payloads are copied", async (t) => {
  const path = await directory(t);
  const store = createArtifactStore({
    transporter: createLocalTransport({ directory: path }),
  });
  const options = { producer };
  const [first, second] = await Promise.all([
    publishArtifact(store, binary, Uint8Array.of(255, 0), options),
    publishArtifact(
      createArtifactStore({
        transporter: createLocalTransport({ directory: path }),
      }),
      binary,
      Uint8Array.of(255, 0),
      options,
    ),
  ]);
  assert.deepEqual(first, second);
  assert.deepEqual(await readdir(join(path, "objects", "artifacts")), [
    `${first.id}.blob.object`,
  ]);
  const bytes = await readStoredArtifact(store, binary, first);
  bytes[0] = 0;
  assert.deepEqual(
    await readStoredArtifact(store, binary, first),
    Uint8Array.of(255, 0),
  );
  const empty = await publishArtifact(store, binary, new Uint8Array(), options);
  assert.equal((await readStoredArtifact(store, binary, empty)).byteLength, 0);
});

test("artifact publication validates filesystem roots without recreating them", async (t) => {
  const path = await directory(t);
  const mkdir = fs.mkdir;
  t.mock.method(fs, "mkdir", async (...args: Parameters<typeof mkdir>) => {
    if (args[0] === parse(path).root)
      throw Object.assign(new Error("Drive root cannot be created"), {
        code: "EPERM",
      });
    return mkdir(...args);
  });
  syncBuiltinESMExports();
  try {
    const store = createArtifactStore({
      transporter: createLocalTransport({
        directory: join(path, "nested", "artifacts"),
      }),
    });
    const reference = await publishArtifact(store, binary, Uint8Array.of(9), {
      producer,
    });
    assert.deepEqual(
      await readStoredArtifact(store, binary, reference),
      Uint8Array.of(9),
    );
  } finally {
    t.mock.restoreAll();
    syncBuiltinESMExports();
  }
});
