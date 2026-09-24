import { test } from "node:test";
import assert from "node:assert/strict";
import { symlink } from "node:fs/promises";
import { join } from "node:path";
import { cacheMounts } from "../../src/providers/container-cache.ts";
import { containerProvider } from "../../src/providers/container.ts";
import type { Command } from "../../src/index.ts";
import { repository } from "../helpers.ts";

test("dependency caches require explicit safe names, keys and disjoint mounts", () => {
  for (const name of ["", "../.codex", "UPPER", "a/b", "a".repeat(49)])
    assert.throws(
      () => containerProvider("docker", { caches: [{ name, key: "v1" }] }),
      /Cache names/,
    );
  for (const key of ["", "  ", "x".repeat(1025)])
    assert.throws(
      () => containerProvider("docker", { caches: [{ name: "npm", key }] }),
      /Cache keys/,
    );
  assert.throws(
    () =>
      containerProvider("docker", {
        caches: [
          { name: "npm", key: "v1" },
          { name: "npm", key: "v2" },
        ],
      }),
    /Duplicate/,
  );
  for (const target of [
    "/",
    "/outpost",
    "/outpost/cache",
    "/outpost/cache/npm",
    "/outpost/other/../cache/npm",
  ])
    assert.throws(
      () =>
        containerProvider("docker", {
          caches: [{ name: "npm", key: "v1" }],
          volumes: [{ source: ".", target }],
        }),
      /overlap/,
    );
  assert.doesNotThrow(() =>
    containerProvider("docker", {
      caches: [{ name: "npm", key: "v1" }],
      volumes: [{ source: ".", target: "/inputs" }],
    }),
  );
});

test("cache identity isolates repository, image, user, name and key; canonical aliases reuse it", async (t) => {
  const root = await repository(t),
    other = await repository(t);
  const caches = [{ name: "npm", key: "lock-v1" }],
    user = { uid: 1000, gid: 1000 };
  const base = await cacheMounts(caches, root, "image@sha256:a", user);
  assert.deepEqual(
    await cacheMounts(caches, root, "image@sha256:a", user),
    base,
  );
  assert.deepEqual(await cacheMounts([], "/missing", "image", user), []);
  for (const different of [
    await cacheMounts(caches, other, "image@sha256:a", user),
    await cacheMounts(caches, root, "image@sha256:b", user),
    await cacheMounts(caches, root, "image@sha256:a", { uid: 1001, gid: 1000 }),
    await cacheMounts(caches, root, "image@sha256:a", { uid: 1000, gid: 1001 }),
    await cacheMounts(
      [{ name: "pip", key: "lock-v1" }],
      root,
      "image@sha256:a",
      user,
    ),
    await cacheMounts(
      [{ name: "npm", key: "lock-v2" }],
      root,
      "image@sha256:a",
      user,
    ),
  ])
    assert.notEqual(different[0]!.volume, base[0]!.volume);
  const alias = join(other, "alias");
  await symlink(root, alias, process.platform === "win32" ? "junction" : "dir");
  assert.deepEqual(
    await cacheMounts(caches, alias, "image@sha256:a", user),
    base,
  );
});

test("engines mount only opted-in persistent caches and retain them after disposal", async (t) => {
  const root = await repository(t);
  for (const engine of ["docker", "podman"] as const) {
    const calls: Command[] = [];
    const caches = [{ name: "npm", key: "lock-v1" }];
    const provider = containerProvider(
      engine,
      { caches, user: { uid: 1000, gid: 1000 } },
      async (command) => {
        calls.push(command);
        return { status: 0, stdout: "1000:1000", stderr: "" };
      },
      "linux",
    );
    caches[0]!.key = "mutated";
    const lease = await provider.acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    });
    const create = calls.find(
      (command) => command.arguments?.[0] === "create",
    )!.arguments!;
    assert.ok(create.includes("CHOWN"));
    assert.ok(
      create.some((arg) =>
        /^outpost-cache-npm-[a-f0-9]{64}:\/outpost\/cache\/npm:nocopy$/.test(
          arg,
        ),
      ),
    );
    assert.ok(create.includes("--tmpfs"));
    assert.equal(
      calls.filter((command) => command.arguments?.[0] === "volume").length,
      1,
    );
    assert.ok(
      calls.some((command) =>
        command.arguments?.includes("io.outpost.cache=true"),
      ),
    );
    assert.ok(
      calls.some(
        (command) =>
          command.arguments?.includes("chown") &&
          command.arguments.includes("/outpost/cache/npm"),
      ),
    );
    assert.ok(
      calls.some(
        (command) =>
          command.arguments?.includes("chmod") &&
          command.arguments.includes("700"),
      ),
    );
    await lease.release();
    await lease.release();
    assert.equal(
      calls.filter((command) => command.arguments?.[0] === "rm").length,
      1,
    );
    assert.equal(
      calls.filter((command) => command.arguments?.[0] === "volume").length,
      1,
    );
  }
});

test("cancelling cache initialization releases the container but keeps persistent volumes", async (t) => {
  const root = await repository(t);
  for (const operation of ["chown", "chmod"]) {
    const calls: Command[] = [];
    const controller = new AbortController();
    await assert.rejects(
      containerProvider(
        "docker",
        { caches: [{ name: "npm", key: "v1" }] },
        async (command) => {
          calls.push(command);
          if (command.arguments?.includes(operation)) {
            assert.equal(command.signal, controller.signal);
            controller.abort(new Error("cancel cache initialization"));
            command.signal?.throwIfAborted();
          }
          return { status: 0, stdout: "", stderr: "" };
        },
      ).acquire({
        repository: root,
        directory: root,
        gitDirectories: [],
        variables: {},
        signal: controller.signal,
      }),
      /cancel cache initialization/,
    );
    assert.equal(
      calls.filter((call) => call.arguments?.[0] === "rm").length,
      1,
    );
    assert.equal(
      calls.filter((call) => call.arguments?.[0] === "volume").length,
      1,
    );
  }
});

test("Podman reuses an existing cache volume without recreating or deleting it", async (t) => {
  const root = await repository(t);
  const volumes = new Set<string>();
  const provider = containerProvider(
    "podman",
    {
      caches: [{ name: "npm", key: "stable" }],
      user: { uid: 1000, gid: 1000 },
    },
    async (command) => {
      const args = command.arguments ?? [];
      if (args[0] === "volume" && args[1] === "create") {
        const name = args.at(-1)!;
        if (volumes.has(name) && !args.includes("--ignore"))
          return { status: 125, stdout: "", stderr: "volume already exists" };
        volumes.add(name);
      }
      assert.notDeepEqual(args.slice(0, 2), ["volume", "rm"]);
      return { status: 0, stdout: "1000:1000", stderr: "" };
    },
    "linux",
  );
  for (let attempt = 0; attempt < 2; attempt++) {
    const lease = await provider.acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    });
    await lease.release();
  }
  assert.equal(volumes.size, 1);
});
