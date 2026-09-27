import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  prepareJailer,
  trustedJailerPath,
  validateJailer,
} from "../../src/providers/firecracker-jailer.ts";
import type { FirecrackerOptions } from "../../src/providers/firecracker.types.ts";

const options: FirecrackerOptions = {
  binary: "/srv/firecracker",
  kernel: "/srv/kernel",
  rootfs: "/srv/rootfs",
  tap: "test-tap",
  guestMac: "06:00:00:00:00:01",
  bootArgs: "console=ttyS0",
  home: "/home/outpost",
  memoryMb: 512,
  ssh: {
    host: "172.30.240.2",
    user: "outpost",
    identity: "/srv/identity",
    knownHosts: "/srv/known_hosts",
  },
  jailer: {
    binary: "/srv/jailer",
    directory: "/srv/jails",
    cgroup: "/sys/fs/cgroup/outpost",
    uid: 1234,
    gid: 1234,
    cpuQuotaUs: 50_000,
    memoryMaxMb: 1024,
    processes: 64,
  },
};

test("jailer rejects root identities, unbounded resources and unsafe paths", () => {
  assert.doesNotThrow(() => validateJailer(options));
  const { jailer, ...direct } = options;
  assert.doesNotThrow(() => validateJailer(direct));
  assert.ok(jailer);
  for (const patch of [
    { uid: 0 },
    { gid: 0 },
    { cpuQuotaUs: 0 },
    { cpuQuotaUs: 999 },
    { cpuQuotaUs: Infinity },
    { cpuQuotaUs: 1000.5 },
    { processes: 1 },
    { memoryMaxMb: 512 },
    { memoryMaxMb: -1 },
    { binary: "jailer" },
    { directory: "/srv/../jails" },
    { directory: "/srv/jails\0" },
    { cgroup: "/sys/fs/cgroup" },
    { cgroup: "/tmp/cgroup" },
  ])
    assert.throws(() =>
      validateJailer({ ...options, jailer: { ...jailer, ...patch } }),
    );
});

test(
  "jailer refuses user-writable ancestors and symlinked inputs",
  { skip: process.platform !== "linux" },
  async () => {
    const root = await mkdtemp(join(tmpdir(), "outpost-jailer-trust-"));
    try {
      await writeFile(join(root, "binary"), "fixture", { mode: 0o700 });
      await symlink(join(root, "binary"), join(root, "link"));
      await assert.rejects(
        trustedJailerPath(join(root, "binary")),
        /root-owned/,
      );
      await assert.rejects(trustedJailerPath(join(root, "link")), /symlinks/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test(
  "jailer does not attempt implicit privilege escalation",
  { skip: process.getuid?.() === 0 },
  async () => {
    await assert.rejects(
      prepareJailer(options, "/unused"),
      /trusted root supervisor/,
    );
  },
);

test(
  "jailer preserves a populated jail and permits cleanup retry after cgroup termination",
  { skip: process.platform !== "linux" },
  async (t) => {
    const fs = await import("node:fs/promises").then(
      (module) => module.default,
    );
    const { syncBuiltinESMExports } = await import("node:module");
    const root = await mkdtemp(join(tmpdir(), "outpost-jailer-lifecycle-"));
    const originalLstat = fs.lstat;
    const originalStatfs = fs.statfs;
    const originalRmdir = fs.rmdir;
    const cgroupParent = join(root, "cgroups");
    const jailParent = join(root, "jails");
    const ownerChanges: string[] = [];
    try {
      await fs.mkdir(cgroupParent);
      await fs.mkdir(jailParent);
      await writeFile(
        join(cgroupParent, "cgroup.subtree_control"),
        "cpu memory pids",
      );
      for (const name of [
        "jailer",
        "firecracker",
        "kernel",
        "rootfs",
        "identity",
        "known_hosts",
        "ssh",
        "rootfs.ext4",
      ])
        await writeFile(join(root, name), "fixture", { mode: 0o700 });
      await writeFile(
        join(root, "config.json"),
        JSON.stringify({
          "boot-source": {},
          drives: [],
          "machine-config": { vcpu_count: 2 },
        }),
      );
      const getuid = process.getuid;
      assert.ok(getuid);
      t.mock.method(Object.assign(process, { getuid }), "getuid", () => 0);
      t.mock.method(
        fs,
        "lstat",
        async (path: Parameters<typeof originalLstat>[0]) => {
          const info = await originalLstat(path);
          info.uid = 0;
          info.mode &= ~0o022;
          return info;
        },
      );
      t.mock.method(
        fs,
        "statfs",
        async (path: Parameters<typeof originalStatfs>[0]) => {
          const info = await originalStatfs(path);
          info.type = 0x63677270;
          return info;
        },
      );
      t.mock.method(
        fs,
        "chown",
        async (path: string, uid: number, gid: number) => {
          assert.equal(uid, 1234);
          assert.equal(gid, 1234);
          ownerChanges.push(path);
        },
      );
      t.mock.method(
        fs,
        "rmdir",
        async (path: Parameters<typeof originalRmdir>[0]) => {
          assert.ok(String(path).startsWith(cgroupParent + "/"));
          await rm(path, { recursive: true });
        },
      );
      syncBuiltinESMExports();
      const staged: FirecrackerOptions = {
        ...options,
        binary: join(root, "firecracker"),
        kernel: join(root, "kernel"),
        rootfs: join(root, "rootfs"),
        ssh: {
          ...options.ssh,
          identity: join(root, "identity"),
          knownHosts: join(root, "known_hosts"),
          binary: join(root, "ssh"),
        },
        jailer: {
          ...options.jailer!,
          binary: join(root, "jailer"),
          directory: jailParent,
          cgroup: cgroupParent,
        },
      };
      const launch = await prepareJailer(staged, root);
      const id = launch.arguments[1]!;
      const jail = join(jailParent, "firecracker", id);
      const cgroup = join(cgroupParent, id);
      assert.equal(ownerChanges.length, 3);
      const config: unknown = JSON.parse(
        await readFile(join(jail, "root", "config.json"), "utf8"),
      );
      assert.deepEqual(config, {
        "boot-source": {
          kernel_image_path: "/kernel",
          boot_args: options.bootArgs,
        },
        drives: [
          {
            drive_id: "rootfs",
            path_on_host: "/rootfs.ext4",
            is_root_device: true,
            is_read_only: false,
          },
        ],
        "machine-config": { vcpu_count: 2 },
      });
      await fs.mkdir(cgroup);
      await writeFile(join(cgroup, "cgroup.events"), "populated 1\n");
      await assert.rejects(launch.cleanup(), /still populated/);
      assert.equal(
        await readFile(join(jail, "root", "rootfs.ext4"), "utf8"),
        "fixture",
      );
      await launch.stop();
      assert.equal(await readFile(join(cgroup, "cgroup.kill"), "utf8"), "1");
      await writeFile(join(cgroup, "cgroup.events"), "populated 0\n");
      await launch.cleanup();
      await launch.cleanup();
      await assert.rejects(fs.lstat(jail), /ENOENT/);
      await launch.stop();
      await assert.rejects(prepareJailer(staged, root, AbortSignal.abort()));
      assert.deepEqual(await fs.readdir(join(jailParent, "firecracker")), []);
    } finally {
      t.mock.restoreAll();
      syncBuiltinESMExports();
      await rm(root, { recursive: true, force: true });
    }
  },
);
