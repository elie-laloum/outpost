import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdir, cp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { SandboxLease, Transport } from "../../src/index.ts";
import type { CloudDependencyCache } from "../../src/providers/cloud-cache.types.ts";
import {
  prepareCloudCaches,
  releaseCloudSandbox,
} from "../../src/providers/cloud-cache.ts";
import { createVercelSandboxProvider } from "../../src/providers/vercel.ts";
import { createDaytonaSandboxProvider } from "../../src/providers/daytona.ts";
import { createLocalTransport } from "../../src/infrastructure/local-transport.ts";
import { repository } from "../helpers.ts";

test("cloud caches validate names, duplicates, keys and required transports at composition", () => {
  const transport = createLocalTransport({
    directory: join(tmpdir(), "unused-cache"),
  });
  for (const create of [
    createVercelSandboxProvider,
    createDaytonaSandboxProvider,
  ]) {
    for (const cache of [
      { name: "../escape", key: "v1", transport },
      { name: "npm", key: "", transport },
    ])
      assert.throws(
        () => create({ caches: [cache] }),
        /Cache names|Cache keys/,
      );
    assert.throws(
      () =>
        create({
          caches: [{ name: "npm", key: "v1" } as CloudDependencyCache],
        }),
      /require a Transport/,
    );
    assert.throws(
      () =>
        create({
          caches: [
            { name: "npm", key: "v1", transport },
            { name: "npm", key: "v2", transport },
          ],
        }),
      /Duplicate/,
    );
  }
});

test("cloud cleanup attempts deletion after cache failure and aggregates simultaneous faults", async () => {
  const save = new Error("save failed"),
    stop = new Error("delete failed");
  let deleted = false;
  await assert.rejects(
    releaseCloudSandbox(
      async () => {
        throw save;
      },
      async () => {
        deleted = true;
      },
    ),
    (error) => error === save,
  );
  assert.equal(deleted, true);
  await assert.rejects(
    releaseCloudSandbox(
      async () => {
        throw save;
      },
      async () => {
        throw stop;
      },
    ),
    (error) =>
      error instanceof AggregateError &&
      error.errors[0] === save &&
      error.errors[1] === stop,
  );
  await assert.rejects(
    releaseCloudSandbox(
      async () => {},
      async () => {
        throw stop;
      },
    ),
    (error) => error === stop,
  );
});

test("cloud caches refuse invalid users, failed setup, invalid archives and cancelled restoration", async (t) => {
  const root = await repository(t);
  const transport = createLocalTransport({ directory: join(root, "store") });
  const context = {
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  };
  const lease: SandboxLease = {
    root,
    home: root,
    invoke: async () => ({ status: 0, stdout: "1000:1000", stderr: "" }),
    upload: async () => {},
    download: async () => {},
    release: async () => {},
  };
  assert.equal(
    await (
      await prepareCloudCaches(lease, [], context, "image")
    )(),
    undefined,
  );
  await assert.rejects(
    prepareCloudCaches(
      {
        ...lease,
        invoke: async () => ({ status: 0, stdout: "oops", stderr: "" }),
      },
      [{ name: "npm", key: "v1", transport }],
      context,
      "image",
    ),
    /invalid cache user/,
  );
  await assert.rejects(
    prepareCloudCaches(
      {
        ...lease,
        invoke: async () => ({
          status: 7,
          stdout: "",
          stderr: "permission denied",
        }),
      },
      [{ name: "npm", key: "v1", transport }],
      context,
      "image",
    ),
    /setup failed/,
  );
  for (const pointer of [
    "{",
    JSON.stringify({ key: "other/manifest", revision: "1" }),
    JSON.stringify({ key: "bad", revision: "" }),
  ]) {
    const invalid: Transport = {
      ...transport,
      read: async (key) => ({
        key,
        revision: "1",
        size: pointer.length,
        modifiedAt: new Date().toISOString(),
        bytes: Buffer.from(pointer),
      }),
    };
    await assert.rejects(
      prepareCloudCaches(
        lease,
        [{ name: "npm", key: "v1", transport: invalid }],
        context,
        "image",
      ),
    );
  }
  const controller = new AbortController();
  const aborted: Transport = {
    ...transport,
    read: async (_key, options) => {
      controller.abort(new Error("cancel restore"));
      options?.signal?.throwIfAborted();
      return undefined;
    },
  };
  await assert.rejects(
    prepareCloudCaches(
      lease,
      [{ name: "npm", key: "v1", transport: aborted }],
      { ...context, signal: controller.signal },
      "image",
    ),
    /cancel restore/,
  );
});

test("cloud cache snapshots preserve every configured cache and save on independent cleanup signals", async (t) => {
  const root = await repository(t);
  const base = createLocalTransport({ directory: join(root, "store") });
  const controller = new AbortController();
  let reads = 0,
    writes = 0;
  const transport: Transport = {
    ...base,
    read: async (key, options) => {
      reads++;
      assert.ok(options?.signal);
      return base.read(key, options);
    },
    write: async (key, bytes, options) => {
      writes++;
      assert.ok(options.signal);
      assert.equal(options.signal.aborted, false);
      return base.write(key, bytes, options);
    },
  };
  const source = join(root, "source");
  await mkdir(source);
  await writeFile(join(source, "download"), Buffer.from([0, 255]));
  const lease: SandboxLease = {
    root,
    home: root,
    invoke: async () => ({ status: 0, stdout: "1000:1000", stderr: "" }),
    upload: async () => {},
    download: async (_source, destination) =>
      cp(source, destination, { recursive: true }),
    release: async () => {},
  };
  const context = {
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
    signal: controller.signal,
  };
  const caches = [
    { name: "npm", key: "v1", transport },
    { name: "pip", key: "v1", transport },
  ];
  const save = await prepareCloudCaches(lease, caches, context, "image");
  controller.abort();
  await save();
  assert.equal(reads, 2);
  assert.equal(writes, 6);
  const next = await prepareCloudCaches(
    lease,
    caches,
    { ...context, signal: new AbortController().signal },
    "image",
  );
  await next();
});

test("root cloud images prepare cache directories without requiring sudo", async (t) => {
  const root = await repository(t);
  const transport = createLocalTransport({ directory: join(root, "store") });
  const elevation: (boolean | undefined)[] = [];
  const lease: SandboxLease = {
    root,
    home: root,
    invoke: async (command) => {
      elevation.push(command.elevated);
      return { status: 0, stdout: "0:0", stderr: "" };
    },
    upload: async () => {},
    download: async () => {},
    release: async () => {},
  };
  await prepareCloudCaches(
    lease,
    [{ name: "npm", key: "v1", transport }],
    {
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    },
    "root-image",
  );
  assert.deepEqual(elevation, [false, false]);
});
