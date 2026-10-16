import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdir,
  readFile,
  writeFile,
  symlink,
  lstat,
  chmod,
} from "node:fs/promises";
import { join, relative } from "node:path";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { repository } from "../helpers.ts";

test("local completion preserves the parent's status when a descendant keeps output open", async (t) => {
  let descendant = 0;
  t.after(() => {
    if (descendant) {
      try {
        process.kill(descendant, "SIGKILL");
      } catch {}
    }
  });
  const child =
    "process.send(process.pid);process.stdout.on('error',()=>{});setInterval(()=>{},1000)";
  const result = await executeProcess({
    executable: process.execPath,
    arguments: [
      "-e",
      `const {spawn}=require('node:child_process');const c=spawn(process.execPath,['-e',${JSON.stringify(child)}],{stdio:['ignore','inherit','inherit','ipc']});c.on('message',pid=>{console.log(pid);process.exit(3)})`,
    ],
    deadlineMs: 3000,
    observe(channel, text) {
      if (channel === "stdout") descendant = Number(text.trim());
    },
  });
  assert.ok(descendant > 0);
  assert.equal(result.status, 3);
});

test("local transfers resolve sandbox paths against root and preserve directory and contents semantics", async (t) => {
  const root = await repository(t);
  const sandbox = join(root, "sandbox"),
    host = join(root, "host");
  await mkdir(sandbox);
  await mkdir(join(host, "tree"), { recursive: true });
  await writeFile(join(host, "tree", "binary"), Buffer.from([0, 255, 128]));
  const lease = await createLocalSandboxProvider().acquire({
    repository: root,
    directory: sandbox,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  const destination = join(sandbox, "existing");
  await mkdir(destination);
  await lease.upload(relative(process.cwd(), join(host, "tree")), "existing");
  const inspected = await lease.invoke({
    executable: process.execPath,
    arguments: [
      "-e",
      "process.stdout.write(require('node:fs').readFileSync('existing/tree/binary').toString('hex'))",
    ],
  });
  assert.equal(inspected.status, 0, inspected.stderr);
  assert.equal(inspected.stdout, "00ff80");
  await lease.upload(join(host, "tree") + "/.", "existing");
  assert.deepEqual(
    await readFile(join(destination, "binary")),
    Buffer.from([0, 255, 128]),
  );
  await lease.download("existing/tree", host);
  assert.deepEqual(
    await readFile(join(host, "tree", "binary")),
    Buffer.from([0, 255, 128]),
  );
  await lease.download("existing/tree/.", host);
  assert.deepEqual(
    await readFile(join(host, "binary")),
    Buffer.from([0, 255, 128]),
  );
  await lease.download("existing/tree/binary", host);
  assert.deepEqual(
    await readFile(join(host, "binary")),
    Buffer.from([0, 255, 128]),
  );
  await lease.upload(join(host, "binary"), "renamed");
  await lease.download("renamed", join(host, "renamed"));
  assert.deepEqual(
    await readFile(join(host, "renamed")),
    Buffer.from([0, 255, 128]),
  );
});

test("local transfers refuse symlink destinations and preserve source links", async (t) => {
  const root = await repository(t);
  const sandbox = join(root, "sandbox"),
    outside = join(root, "outside");
  await mkdir(sandbox);
  await mkdir(outside);
  await writeFile(join(outside, "keep"), "original");
  await symlink(
    outside,
    join(sandbox, "redirect"),
    process.platform === "win32" ? "junction" : "dir",
  );
  const lease = await createLocalSandboxProvider().acquire({
    repository: root,
    directory: sandbox,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  await assert.rejects(
    lease.upload(join(root, "base.txt"), join(sandbox, "redirect", "keep")),
    /symlink/,
  );
  await assert.rejects(
    lease.download(join(root, "base.txt"), join(sandbox, "redirect", "keep")),
    /symlink/,
  );
  assert.equal(await readFile(join(outside, "keep"), "utf8"), "original");
  if (process.platform !== "win32") {
    await symlink("base.txt", join(root, "link"));
    await lease.upload(join(root, "link"), "link");
    assert.ok((await lstat(join(sandbox, "link"))).isSymbolicLink());
  }
});

test("local commands wait after output closes, drain final output, cancel and remain reusable", async (t) => {
  const root = await repository(t);
  const lease = await createLocalSandboxProvider().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  const result = await lease.invoke({
    executable: process.execPath,
    arguments: [
      "-e",
      "process.stdout.destroy();process.stderr.destroy();setTimeout(()=>{require('node:fs').writeFileSync('completed','done');process.exit(7)},100)",
    ],
  });
  assert.equal(result.status, 7);
  assert.equal(await readFile(join(root, "completed"), "utf8"), "done");
  const large = await lease.invoke({
    executable: process.execPath,
    arguments: [
      "-e",
      "process.stdout.write('é'.repeat(100000));process.stderr.write('last');process.exitCode=9",
    ],
    retain: 200000,
  });
  assert.equal(large.status, 9);
  assert.equal(large.stdout, "é".repeat(100000));
  assert.equal(large.stderr, "last");
  await assert.rejects(
    lease.invoke({
      executable: process.execPath,
      arguments: ["-e", "setInterval(()=>{},1000)"],
      deadlineMs: 100,
    }),
    /exceeded/,
  );
  const controller = new AbortController();
  await assert.rejects(
    lease.invoke({
      executable: process.execPath,
      arguments: ["-e", "console.log('ready');setInterval(()=>{},1000)"],
      signal: controller.signal,
      observe() {
        controller.abort(new Error("stop command"));
      },
    }),
    /stop command/,
  );
  assert.equal(
    (
      await lease.invoke({
        executable: process.execPath,
        arguments: ["-e", "process.exitCode=4"],
      })
    ).status,
    4,
  );
});

test(
  "local cancellation escalates against descendants even after the parent and its pipes exit",
  { skip: process.platform === "win32" },
  async (t) => {
    const root = await repository(t),
      heartbeat = join(root, "heartbeat");
    let descendant = 0;
    t.after(() => {
      if (descendant) {
        try {
          process.kill(descendant, "SIGKILL");
        } catch {}
      }
    });
    const child = `const fs=require('node:fs');process.on('SIGTERM',()=>fs.writeFileSync(${JSON.stringify(join(root, "term"))},'term'));setInterval(()=>fs.writeFileSync(${JSON.stringify(heartbeat)},String(Date.now())),20);process.send(process.pid)`;
    const stop = new AbortController();
    await assert.rejects(
      executeProcess({
        executable: process.execPath,
        arguments: [
          "-e",
          `const {spawn}=require('node:child_process');const c=spawn(process.execPath,['-e',${JSON.stringify(child)}],{stdio:['ignore','ignore','ignore','ipc']});c.on('message',pid=>console.log(pid));setInterval(()=>{},1000)`,
        ],
        signal: stop.signal,
        observe(channel, text) {
          if (channel === "stdout") {
            descendant = Number(text.trim());
            stop.abort(new Error("cancel tree"));
          }
        },
      }),
      /cancel tree/,
    );
    assert.equal(await readFile(join(root, "term"), "utf8"), "term");
    const last = await readFile(heartbeat, "utf8");
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(await readFile(heartbeat, "utf8"), last);
  },
);

test("local transfers preserve modes and reject cancellation, recursion and use after release", async (t) => {
  const root = await repository(t);
  const lease = await createLocalSandboxProvider().acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
  });
  t.after(() => lease.release());
  await chmod(join(root, "base.txt"), 0o640);
  await lease.upload(join(root, "base.txt"), "copy");
  if (process.platform !== "win32")
    assert.equal((await lstat(join(root, "copy"))).mode & 0o777, 0o640);
  await lease.upload(join(root, "base.txt"), "base.txt");
  await assert.rejects(lease.upload(root, join(root, "nested")), /into itself/);
  await assert.rejects(
    lease.upload(join(root, "base.txt"), "cancelled", {
      signal: AbortSignal.abort(new Error("cancel transfer")),
    }),
    /cancel transfer/,
  );
  await lease.release();
  await assert.rejects(lease.download("copy", join(root, "closed")), /closed/);
});
