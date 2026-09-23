import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chmod,
  lstat,
  mkdir,
  readFile,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { containerFiles } from "../../src/providers/container-files.ts";
import {
  copyTransfer,
  transferDestination,
} from "../../src/infrastructure/transfer-copy.ts";
import { repository } from "../helpers.ts";
import type { ContainerRuntime } from "../../src/providers/container.types.ts";

test("container transfer plans use live archives and preserve copy destinations", async (t) => {
  const root = await repository(t);
  const calls: readonly string[][] = [];
  let closed = false;
  const runtime: ContainerRuntime = {
    engine: "docker",
    config: {},
    root: "/workspace",
    name: "fixture",
    env: {},
    isClosed: () => closed,
    executor: async () => ({ status: 0, stdout: "", stderr: "" }),
    call: async (args) => {
      (calls as string[][]).push([...args]);
      return { status: 0, stdout: "", stderr: "" };
    },
  };
  const files = containerFiles(
    runtime,
    async (_runtime, local, remote, upload, signal) => {
      signal.throwIfAborted();
      assert.equal(local.executable, "tar");
      assert.equal(remote.executable, "tar");
      if (!upload) {
        const stage = local.arguments!.at(-1)!;
        await mkdir(join(stage, "tree"));
        await writeFile(join(stage, "tree", "file"), "content");
      }
    },
  );
  await files.upload(join(root, "base.txt"), "/home/agent/new name");
  await files.upload(root + "/.", "/home/agent/existing");
  assert.ok(calls.some((args) => args.some((arg) => arg.includes("rm -rf"))));
  assert.ok(!calls.some((args) => args[0] === "cp"));
  await files.download("/home/agent/tree", join(root, "renamed"));
  assert.equal(
    await readFile(join(root, "renamed", "file"), "utf8"),
    "content",
  );
  await files.download("/home/agent/tree", join(root, "renamed"));
  assert.equal(
    await readFile(join(root, "renamed", "tree", "file"), "utf8"),
    "content",
  );
  await files.download("/home/agent/tree/.", join(root, "renamed"));
  const failing = containerFiles(runtime, async () => {
    throw new Error("archive failure");
  });
  await assert.rejects(
    failing.upload(join(root, "base.txt"), "/tmp/file"),
    /archive failure/,
  );
  await assert.rejects(
    failing.download("/tmp/tree", join(root, "failure")),
    /archive failure/,
  );
  await assert.rejects(
    files.upload(root, "/tmp/file", {
      signal: AbortSignal.abort(new Error("cancel")),
    }),
    /cancel/,
  );
  closed = true;
  await assert.rejects(files.upload(root, "/tmp/file"), /closed/);
  await assert.rejects(files.download("/tmp/tree", root), /closed/);
});

test("transfer copying preserves files and refuses destination symlink traversal", async (t) => {
  const root = await repository(t);
  const source = join(root, "source");
  await mkdir(source);
  await writeFile(join(source, "file"), "value");
  await chmod(join(source, "file"), 0o640);
  const signal = new AbortController().signal;
  await copyTransfer(source, join(root, "copy"), signal);
  assert.equal(await readFile(join(root, "copy", "file"), "utf8"), "value");
  if (process.platform !== "win32")
    assert.equal((await lstat(join(root, "copy", "file"))).mode & 0o777, 0o640);
  await symlink(
    source,
    join(root, "redirect"),
    process.platform === "win32" ? "junction" : "dir",
  );
  await assert.rejects(
    transferDestination(join(root, "redirect", "file")),
    /symlink/,
  );
  await assert.rejects(
    copyTransfer(
      source,
      join(root, "cancel"),
      AbortSignal.abort(new Error("cancel")),
    ),
    /cancel/,
  );
  if (process.platform !== "win32") {
    await symlink("file", join(source, "link"));
    await copyTransfer(source, join(root, "linked"), signal);
    assert.ok((await lstat(join(root, "linked", "link"))).isSymbolicLink());
  }
});
