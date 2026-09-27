import { randomUUID } from "node:crypto";
import { constants } from "node:fs";
import {
  access,
  chmod,
  chown,
  copyFile,
  lstat,
  mkdir,
  readFile,
  rm,
  rmdir,
  statfs,
  writeFile,
} from "node:fs/promises";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  normalize,
  relative,
} from "node:path";
import { invariant, OutpostError } from "../domain/errors.ts";
import type {
  FirecrackerOptions,
  FirecrackerLaunch,
} from "./firecracker.types.ts";
import { firecrackerJailerLimits as limits } from "./firecracker-jailer.constants.ts";
import { firecrackerDefaults } from "./firecracker.constants.ts";

export function validateJailer(options: FirecrackerOptions): void {
  const jailer = options.jailer;
  if (!jailer) return;
  for (const path of [jailer.binary, jailer.directory, jailer.cgroup])
    invariant(
      path.startsWith("/") &&
        !path.includes("\0") &&
        !path.split("/").includes(".."),
      "Jailer paths must be absolute without traversal",
    );
  invariant(
    jailer.cgroup.startsWith(`${limits.cgroupRoot}/`) &&
      relative(limits.cgroupRoot, jailer.cgroup) !== "",
    "Jailer requires a dedicated cgroup v2 parent beneath /sys/fs/cgroup",
  );
  for (const value of [
    jailer.uid,
    jailer.gid,
    jailer.cpuQuotaUs,
    jailer.memoryMaxMb,
    jailer.processes,
  ])
    invariant(
      Number.isSafeInteger(value) && value > 0,
      "Jailer identities and resource limits must be positive integers",
    );
  invariant(
    jailer.cpuQuotaUs >= limits.minimumCpuQuotaUs,
    "Jailer CPU quota must be at least 1000 microseconds per 100000 microseconds",
  );
  invariant(
    jailer.memoryMaxMb > (options.memoryMb ?? firecrackerDefaults.memoryMb),
    "Jailer memory limit must exceed guest memory to allow VMM overhead",
  );
  invariant(
    Number.isSafeInteger(jailer.memoryMaxMb * limits.bytesPerMiB),
    "Jailer memory limit is too large",
  );
  invariant(
    jailer.uid <= limits.maximumIdentity &&
      jailer.gid <= limits.maximumIdentity,
    "Jailer identities must fit Linux UID/GID limits",
  );
  invariant(
    jailer.processes >= limits.minimumProcesses,
    "Jailer process limit must allow at least 16 threads",
  );
}

export async function trustedJailerPath(path: string): Promise<void> {
  invariant(
    isAbsolute(path) && normalize(path) === path,
    "Jailer paths must be canonical absolute paths",
  );
  let current = path;
  while (true) {
    const entry = await lstat(current);
    invariant(
      !entry.isSymbolicLink() && entry.uid === 0 && (entry.mode & 0o022) === 0,
      `Jailer path must be root-owned, without symlinks or group/world write access: ${current}`,
    );
    const parent = dirname(current);
    if (parent === current) return;
    current = parent;
  }
}

export async function prepareJailer(
  options: FirecrackerOptions,
  directory: string,
  signal?: AbortSignal,
): Promise<FirecrackerLaunch> {
  const jailer = options.jailer;
  invariant(jailer, "Jailer configuration is required");
  invariant(
    process.getuid?.() === 0,
    "Jailer allocation requires a trusted root supervisor; Outpost never invokes sudo",
  );
  await Promise.all(
    [
      jailer.binary,
      jailer.directory,
      jailer.cgroup,
      options.binary,
      options.kernel,
      options.rootfs,
      options.ssh.identity,
      options.ssh.knownHosts,
      options.ssh.binary ?? "/usr/bin/ssh",
    ].map(trustedJailerPath),
  );
  await access(jailer.binary, constants.X_OK);
  invariant(
    (await statfs(jailer.cgroup)).type === limits.cgroupFilesystem,
    "Jailer parent must be on cgroup v2",
  );
  const controllers = (
    await readFile(join(jailer.cgroup, "cgroup.subtree_control"), "utf8")
  ).split(/\s+/);
  invariant(
    ["cpu", "memory", "pids"].every((name) => controllers.includes(name)),
    "Enable cpu, memory and pids controllers in the dedicated jailer parent",
  );
  const parent = join(jailer.directory, basename(options.binary));
  await mkdir(parent, { recursive: true, mode: 0o700 });
  await trustedJailerPath(parent);
  const id = randomUUID();
  const jail = join(parent, id);
  const root = join(jail, "root");
  const cgroup = join(jailer.cgroup, id);
  await mkdir(jail, { mode: 0o700 });
  const cleanup = async () => {
    try {
      const events = await readFile(join(cgroup, "cgroup.events"), "utf8");
      if (/^populated 1$/m.test(events))
        throw new OutpostError(
          "provider",
          `Jailer cgroup is still populated; recovery files retained at ${jail}`,
        );
      await rmdir(cgroup);
    } catch (cause) {
      if (!(
        cause instanceof Error &&
        "code" in cause &&
        cause.code === "ENOENT"
      ))
        throw cause;
    }
    await rm(jail, { recursive: true, force: true });
  };
  try {
    await mkdir(root, { mode: 0o700 });
    await copyFile(options.kernel, join(root, "kernel"));
    await copyFile(
      join(directory, "rootfs.ext4"),
      join(root, "rootfs.ext4"),
      constants.COPYFILE_FICLONE,
    );
    const config: unknown = JSON.parse(
      await readFile(join(directory, "config.json"), "utf8"),
    );
    invariant(
      config !== null &&
        typeof config === "object" &&
        "boot-source" in config &&
        "drives" in config,
      "Invalid Firecracker boot configuration",
    );
    await writeFile(
      join(root, "config.json"),
      JSON.stringify({
        ...config,
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
      }),
      { mode: 0o400 },
    );
    for (const name of ["kernel", "rootfs.ext4", "config.json"]) {
      await chown(join(root, name), jailer.uid, jailer.gid);
      await chmod(join(root, name), name === "rootfs.ext4" ? 0o600 : 0o400);
    }
    signal?.throwIfAborted();
  } catch (cause) {
    try {
      await cleanup();
    } catch (cleanupFailure) {
      throw new AggregateError(
        [cause, cleanupFailure],
        `Jailer preparation and cleanup failed; inspect ${jail}`,
      );
    }
    throw cause;
  }
  return {
    binary: jailer.binary,
    arguments: [
      "--id",
      id,
      "--exec-file",
      options.binary,
      "--uid",
      String(jailer.uid),
      "--gid",
      String(jailer.gid),
      "--chroot-base-dir",
      jailer.directory,
      "--cgroup-version",
      "2",
      "--parent-cgroup",
      relative(limits.cgroupRoot, jailer.cgroup),
      "--cgroup",
      `cpu.max=${jailer.cpuQuotaUs} ${limits.cpuPeriodUs}`,
      "--cgroup",
      `memory.max=${jailer.memoryMaxMb * limits.bytesPerMiB}`,
      "--cgroup",
      "memory.swap.max=0",
      "--cgroup",
      `pids.max=${jailer.processes}`,
      "--",
      "--api-sock",
      "/api.sock",
      "--config-file",
      "/config.json",
    ],
    async stop() {
      try {
        await writeFile(join(cgroup, "cgroup.kill"), "1");
      } catch (cause) {
        if (!(
          cause instanceof Error &&
          "code" in cause &&
          cause.code === "ENOENT"
        ))
          throw cause;
      }
    },
    cleanup,
  };
}
