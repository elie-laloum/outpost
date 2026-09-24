import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { constants } from "node:fs";
import {
  access,
  chmod,
  copyFile,
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { invariant, OutpostError, positive } from "../domain/errors.ts";
import { registerCleanup } from "../infrastructure/shutdown.ts";
import { firecrackerDefaults } from "./firecracker.constants.ts";
import type {
  FirecrackerMachine,
  FirecrackerOptions,
} from "./firecracker.types.ts";

export function validateFirecracker(options: FirecrackerOptions): void {
  for (const path of [
    options.binary,
    options.kernel,
    options.rootfs,
    options.home,
    options.root ?? firecrackerDefaults.root,
    options.ssh.identity,
    options.ssh.knownHosts,
  ])
    invariant(
      isAbsolute(path) && !path.includes("\0"),
      "Firecracker paths must be absolute",
    );
  invariant(
    /^[a-zA-Z0-9_.-]{1,15}$/.test(options.tap),
    "Invalid TAP interface",
  );
  invariant(
    /^([a-fA-F0-9]{2}:){5}[a-fA-F0-9]{2}$/.test(options.guestMac),
    "Invalid guest MAC address",
  );
  invariant(
    /^[a-zA-Z0-9_.:-]+$/.test(options.ssh.host) &&
      !options.ssh.host.startsWith("-"),
    "Invalid SSH host",
  );
  invariant(/^[a-zA-Z0-9_-]+$/.test(options.ssh.user), "Invalid SSH user");
  for (const value of [
    options.cpus ?? firecrackerDefaults.cpus,
    options.memoryMb ?? firecrackerDefaults.memoryMb,
    options.ssh.port ?? 22,
  ])
    invariant(
      Number.isSafeInteger(value) && value > 0,
      "Firecracker resource limits and SSH port must be positive integers",
    );
  positive(
    options.bootDeadlineMs ?? firecrackerDefaults.bootDeadlineMs,
    "bootDeadlineMs",
  );
}

export async function firecrackerMachine(
  options: FirecrackerOptions,
  signal?: AbortSignal,
): Promise<FirecrackerMachine> {
  invariant(process.platform === "linux", "Firecracker requires Linux and KVM");
  signal?.throwIfAborted();
  await access("/dev/kvm", constants.R_OK | constants.W_OK);
  await Promise.all([
    access(options.binary, constants.X_OK),
    access(options.kernel, constants.R_OK),
    access(options.rootfs, constants.R_OK),
    access(options.ssh.identity, constants.R_OK),
    access(options.ssh.knownHosts, constants.R_OK),
  ]);
  const lock = join(tmpdir(), `outpost-firecracker-tap-${options.tap}.lock`);
  await mkdir(lock, { mode: 0o700 });
  const endpoint = createHash("sha256")
    .update(`${options.ssh.host}:${options.ssh.port ?? 22}`)
    .digest("hex");
  const transportLock = join(
    tmpdir(),
    `outpost-firecracker-ssh-${endpoint}.lock`,
  );
  try {
    await mkdir(transportLock, { mode: 0o700 });
  } catch (cause) {
    return failedAllocation([lock], cause);
  }
  let directory: string;
  try {
    directory = await mkdtemp(join(tmpdir(), "outpost-firecracker-"));
  } catch (cause) {
    return failedAllocation([lock, transportLock], cause);
  }
  try {
    await copyFile(
      options.rootfs,
      join(directory, "rootfs.ext4"),
      constants.COPYFILE_FICLONE,
    );
    await chmod(join(directory, "rootfs.ext4"), 0o600);
    signal?.throwIfAborted();
    await writeFile(
      join(directory, "config.json"),
      JSON.stringify({
        "boot-source": {
          kernel_image_path: options.kernel,
          boot_args: options.bootArgs,
        },
        drives: [
          {
            drive_id: "rootfs",
            path_on_host: join(directory, "rootfs.ext4"),
            is_root_device: true,
            is_read_only: false,
          },
        ],
        "machine-config": {
          vcpu_count: options.cpus ?? firecrackerDefaults.cpus,
          mem_size_mib: options.memoryMb ?? firecrackerDefaults.memoryMb,
        },
        "network-interfaces": [
          {
            iface_id: "net1",
            guest_mac: options.guestMac,
            host_dev_name: options.tap,
          },
        ],
      }),
      { mode: 0o600 },
    );
  } catch (cause) {
    return failedAllocation([directory, lock, transportLock], cause);
  }
  const child = spawn(
    options.binary,
    [
      "--api-sock",
      join(directory, "api.sock"),
      "--config-file",
      join(directory, "config.json"),
    ],
    { stdio: "ignore" },
  );
  let exited = false;
  const exit = new Promise<void>((resolve) => {
    child.once("error", () => {
      exited = true;
      resolve();
    });
    child.once("exit", () => {
      exited = true;
      resolve();
    });
  });
  let releasing: Promise<void> | undefined;
  let closed = false;
  let unregister = () => {};
  const release = () =>
    (releasing ??= (async () => {
      closed = true;
      if (!exited) child.kill("SIGTERM");
      await Promise.race([exit, delay(200, undefined, { ref: false })]);
      if (!exited) child.kill("SIGKILL");
      await Promise.race([
        exit,
        delay(firecrackerDefaults.cleanupMs, undefined, { ref: false }),
      ]);
      if (!exited)
        throw new OutpostError(
          "provider",
          `VM termination uncertain; private disk retained at ${directory}`,
        );
      await rm(directory, { recursive: true, force: true });
      await rm(lock, { recursive: true, force: true });
      await rm(transportLock, { recursive: true, force: true });
      unregister();
    })().catch((cause) => {
      releasing = undefined;
      throw cause;
    }));
  unregister = registerCleanup(release, () => {
    if (!exited) child.kill("SIGKILL");
  });
  return { directory, isClosed: () => closed || exited, release };
}

async function failedAllocation(
  paths: readonly string[],
  cause: unknown,
): Promise<never> {
  const results = await Promise.allSettled(
    paths.map((path) => rm(path, { recursive: true, force: true })),
  );
  const failures = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);
  if (failures.length)
    throw new AggregateError(
      [cause, ...failures],
      "Firecracker allocation and cleanup failed; inspect retained temporary resources",
    );
  throw cause;
}
