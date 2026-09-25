import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { test } from "node:test";
import {
  chmod,
  lstat,
  mkdtemp,
  mkdir,
  readFile,
  readlink,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { firecrackerSandboxProvider } from "../../src/providers/firecracker.ts";
import {
  firecrackerCommand,
  firecrackerSsh,
} from "../../src/providers/firecracker-command.ts";
import { firecrackerFiles } from "../../src/providers/firecracker-files.ts";
import { firecrackerMachine } from "../../src/providers/firecracker-machine.ts";
import type { FirecrackerOptions } from "../../src/providers/firecracker.types.ts";

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "firecracker-simulated-"));
  const ssh = join(root, "ssh");
  await writeFile(
    ssh,
    '#!/bin/sh\nfor script do :; done\nexec sh -c "$script"\n',
    { mode: 0o700 },
  );
  const options: FirecrackerOptions = {
    binary: join(root, "vm"),
    kernel: join(root, "kernel"),
    rootfs: join(root, "disk"),
    tap: `op-${root.slice(-6)}`,
    guestMac: "06:00:00:00:00:01",
    bootArgs: "console=ttyS0",
    home: process.env.HOME!,
    root,
    ssh: {
      host: `test-${root.slice(-6)}`,
      user: "outpost",
      identity: join(root, "identity"),
      knownHosts: join(root, "known_hosts"),
      binary: ssh,
    },
    bootDeadlineMs: 1000,
  };
  await Promise.all(
    ["kernel", "disk", "identity", "known_hosts"].map((name) =>
      writeFile(join(root, name), "fixture"),
    ),
  );
  await writeFile(options.binary, "#!/bin/sh\nexec sleep 60\n", {
    mode: 0o700,
  });
  const runtime = {
    options,
    root,
    variables: { SAMPLE: "quoted ' value" },
    executor: executeProcess,
    isClosed: () => false,
  };
  return {
    root,
    options,
    runtime,
    cleanup: () => rm(root, { recursive: true, force: true }),
  };
}

test(
  "simulated SSH: completion, status, environment, cancellation and reuse",
  { skip: process.platform !== "linux" },
  async () => {
    const f = await fixture();
    try {
      const invoke = firecrackerCommand(f.runtime);
      const started = Date.now();
      const result = await invoke({
        executable: "sh",
        arguments: [
          "-c",
          'printf "%s" "$SAMPLE"; exec 1>&- 2>&-; sleep 0.1; exit 19',
        ],
      });
      assert.equal(result.status, 19);
      assert.equal(result.stdout, "quoted ' value");
      assert.ok(Date.now() - started >= 80);
      await assert.rejects(
        invoke({
          executable: "sh",
          arguments: ["-c", `sleep 0.4; touch '${join(f.root, "orphan")}'`],
          deadlineMs: 60,
        }),
        /exceeded/,
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      await assert.rejects(lstat(join(f.root, "orphan")), /ENOENT/);
      assert.equal(
        (await invoke({ executable: "printf", arguments: ["reused"] })).stdout,
        "reused",
      );
      await assert.rejects(
        invoke({ executable: "true", interactive: true }),
        /does not support/,
      );
      await assert.rejects(
        invoke({ executable: "true", variables: { "bad-key": "value" } }),
        /Invalid environment/,
      );
      await assert.rejects(
        firecrackerCommand({ ...f.runtime, isClosed: () => true })({
          executable: "true",
        }),
        /closed/,
      );
      const delayed = firecrackerCommand({
        ...f.runtime,
        executor: async (command) => {
          await new Promise((resolve) => setTimeout(resolve, 150));
          const { signal: _signal, ...invocation } = command;
          return executeProcess(invocation);
        },
      });
      await assert.rejects(
        delayed({
          executable: "touch",
          arguments: [join(f.root, "late")],
          deadlineMs: 40,
        }),
        /exceeded/,
      );
      await assert.rejects(lstat(join(f.root, "late")), /ENOENT/);
      const flags = firecrackerSsh(f.options, "true").arguments!;
      assert.ok(flags.includes("StrictHostKeyChecking=yes"));
      assert.ok(flags.includes("IdentitiesOnly=yes"));
      assert.ok(
        flags.includes(`UserKnownHostsFile=${f.options.ssh.knownHosts}`),
      );
    } finally {
      await f.cleanup();
    }
  },
);

test(
  "simulated SSH transfers retain binary data, modes, links and directory contents; reject traversal",
  { skip: process.platform !== "linux" },
  async () => {
    const f = await fixture();
    try {
      const files = firecrackerFiles(f.runtime);
      const source = join(f.root, "source"),
        guest = join(f.root, "guest"),
        target = join(f.root, "target");
      await mkdir(source);
      const data = Buffer.from(
        Array.from({ length: 300_000 }, (_, n) => n % 256),
      );
      await writeFile(join(source, "bytes"), data, { mode: 0o750 });
      await symlink("bytes", join(source, "link"));
      await chmod(source, 0o750);
      await files.upload(source + "/.", guest);
      assert.deepEqual(await readFile(join(guest, "bytes")), data);
      assert.equal((await lstat(guest)).mode & 0o777, 0o750);
      await files.download(guest + "/.", target);
      assert.deepEqual(await readFile(join(target, "bytes")), data);
      assert.equal((await lstat(join(target, "bytes"))).mode & 0o777, 0o750);
      assert.equal((await lstat(target)).mode & 0o777, 0o750);
      assert.equal(await readlink(join(target, "link")), "bytes");
      const escape = join(f.root, "escape");
      await symlink(target, escape);
      await assert.rejects(
        files.upload(join(source, "bytes"), join(escape, "written")),
      );
      await assert.rejects(
        files.download(join(guest, "bytes"), join(escape, "written")),
        /symlink/,
      );
      await assert.rejects(
        files.download(join(guest, "missing"), join(f.root, "missing")),
        /manifest/,
      );
      await assert.rejects(
        files.upload(source, guest, { signal: AbortSignal.abort() }),
      );
    } finally {
      await f.cleanup();
    }
  },
);

test(
  "research provider validates explicit paths and options",
  { skip: process.platform !== "linux" },
  async () => {
    const f = await fixture();
    try {
      assert.equal(firecrackerSandboxProvider(f.options).placement, "remote");
      const networkOptions = { ...f.options, egress: { mode: "deny-all" } };
      assert.throws(() => firecrackerSandboxProvider(networkOptions), /egress/);
      assert.throws(
        () => firecrackerSandboxProvider({ ...f.options, kernel: "relative" }),
        /absolute/,
      );
      assert.throws(
        () => firecrackerSandboxProvider({ ...f.options, tap: "invalid name" }),
        /TAP/,
      );
      assert.throws(
        () => firecrackerSandboxProvider({ ...f.options, cpus: 0 }),
        /positive/,
      );
      await assert.rejects(firecrackerMachine(f.options, AbortSignal.abort()));
    } finally {
      await f.cleanup();
    }
  },
);

test(
  "simulated VM allocation owns a private disk and TAP, and release is idempotent",
  { skip: process.platform !== "linux" },
  async (t) => {
    const f = await fixture();
    const access = fs.access;
    t.mock.method(fs, "access", async (...args: Parameters<typeof access>) => {
      if (args[0] === "/dev/kvm") return;
      return access(...args);
    });
    syncBuiltinESMExports();
    try {
      const machine = await firecrackerMachine(f.options);
      try {
        assert.equal(
          await readFile(join(machine.directory, "rootfs.ext4"), "utf8"),
          "fixture",
        );
        await writeFile(join(machine.directory, "rootfs.ext4"), "guest writes");
        assert.equal(await readFile(f.options.rootfs, "utf8"), "fixture");
        const config = JSON.parse(
          await readFile(join(machine.directory, "config.json"), "utf8"),
        );
        assert.equal(
          config["network-interfaces"][0].host_dev_name,
          f.options.tap,
        );
        await assert.rejects(firecrackerMachine(f.options), /EEXIST/);
        await assert.rejects(
          firecrackerMachine({ ...f.options, tap: `alt-${f.root.slice(-6)}` }),
          /EEXIST/,
        );
      } finally {
        await Promise.all([machine.release(), machine.release()]);
      }
      assert.equal(machine.isClosed(), true);
      await assert.rejects(lstat(machine.directory), /ENOENT/);
      const sandboxProvider = firecrackerSandboxProvider(f.options);
      const context = {
        repository: f.root,
        directory: f.root,
        gitDirectories: [],
        variables: {},
      };
      const lease = await sandboxProvider.acquire(context);
      await assert.rejects(sandboxProvider.acquire(context), /already owns/);
      assert.equal((await lease.invoke({ executable: "true" })).status, 0);
      await lease.upload(f.options.kernel, `${lease.root}/uploaded`);
      await lease.download(
        `${lease.root}/uploaded`,
        join(f.root, "downloaded"),
      );
      assert.equal(
        await readFile(join(f.root, "downloaded"), "utf8"),
        "fixture",
      );
      const pending = lease.invoke({ executable: "sleep", arguments: ["10"] });
      const rejected = assert.rejects(pending);
      await new Promise((resolve) => setTimeout(resolve, 30));
      await lease.release();
      await rejected;
      const next = await sandboxProvider.acquire(context);
      await lease.release();
      await assert.rejects(sandboxProvider.acquire(context), /already owns/);
      await next.release();
      await assert.rejects(lease.invoke({ executable: "true" }), /closed/);
      await writeFile(f.options.binary, "#!/bin/sh\nexit 7\n", { mode: 0o700 });
      await assert.rejects(sandboxProvider.acquire(context), /exited|ready/);
    } finally {
      t.mock.restoreAll();
      syncBuiltinESMExports();
      await f.cleanup();
    }
  },
);
