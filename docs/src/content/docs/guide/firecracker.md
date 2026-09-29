---
title: "Firecracker microVMs"
description: "Run each task in a Firecracker microVM on a Linux/KVM host you prepare, reached over SSH and optionally confined by the jailer."
---

## Prerequisites

Outpost boots and stops the VM; you prepare the host and the guest image once.

<!-- features -->

- **Linux with KVM**: The user running Outpost can read and write `/dev/kvm`.
- **Firecracker and a kernel**: The `firecracker` binary and a guest kernel image on the host.
- **A TAP device**: Created, addressed and routed on the host, one per concurrent VM.
- **A guest root filesystem**: A disk image whose SSH server starts at boot on the TAP network.
- **Guest tools**: Node.js 24+, Git, `setsid` and `tar` on the guest user’s `PATH`.
- **SSH trust**: A private key for the guest user and a known-hosts file holding the guest’s host key.

## Configure the provider

Import the provider from its subpath and pass it to `dispatch()` like any other sandbox.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { createFirecrackerSandboxProvider } from "@elie-laloum/outpost/providers/firecracker";
import { coder, repository } from "./outpost.config.mts";

const sandboxProvider = createFirecrackerSandboxProvider({
  binary: "/usr/local/bin/firecracker",
  kernel: "/srv/firecracker/vmlinux",
  rootfs: "/srv/firecracker/rootfs.ext4",
  tap: "tap0",
  guestMac: "06:00:ac:10:00:02",
  bootArgs:
    "console=ttyS0 reboot=k panic=1 pci=off ip=172.16.0.2::172.16.0.1:255.255.255.252::eth0:off",
  ssh: {
    host: "172.16.0.2",
    user: "agent",
    identity: "/srv/firecracker/id_ed25519",
    knownHosts: "/srv/firecracker/known_hosts",
  },
  home: "/home/agent",
});

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/firecracker" },
  brief: { text: "Run the test suite and fix the first failure." },
});
console.log(result.commits);
```

Each allocation boots a private copy of `rootfs`, then polls SSH until the guest answers with the expected `$HOME` and tools. Host paths must be absolute.

| Option                                       | Default                   | Sets                                                                  |
| -------------------------------------------- | ------------------------- | --------------------------------------------------------------------- |
| `binary`, `kernel`, `rootfs`                 | Required                  | The Firecracker executable and the guest boot files.                  |
| `tap`, `guestMac`, `bootArgs`                | Required                  | The host network device, the guest MAC and the kernel command line.   |
| `ssh.host`, `user`, `identity`, `knownHosts` | Required                  | How Outpost reaches the guest. Unknown host keys are refused.         |
| `home`                                       | Required                  | The agent’s home in the guest; it must equal the SSH user’s `$HOME`.  |
| `ssh.port`, `ssh.binary`                     | `22`, `ssh` on the `PATH` | The guest SSH port and the host SSH client.                           |
| `root`                                       | `/workspace`              | The repository workspace in the guest.                                |
| `cpus`, `memoryMb`                           | `2`, `2048`               | Guest vCPUs and memory in MiB.                                        |
| `bootDeadlineMs`                             | `60000`                   | How long to wait for SSH and the guest tools before failing.          |
| `variables`                                  | None                      | [Environment variables](../environment-variables/) for every command. |
| `jailer`                                     | Direct launch             | [Run through the jailer](#run-through-the-jailer).                    |

## Repository access

Firecracker works like a [cloud sandbox](../cloud-sandboxes/): Outpost uploads the Git history over SSH, the agent commits in the guest, then Outpost downloads, validates and applies the new commits. A missing agent CLI is installed in `home` before the first turn, unless you pass `bootstrap: false`.

The SSH user must own `root` or be able to create it. Outpost keeps its Git transfer files in `root/.git`, so the rest of the guest filesystem can stay read-only for that user.

## Run through the jailer

Set `jailer` to start Firecracker through its jailer: the VMM runs as a non-root identity, in a private chroot and a cgroup v2 child with CPU, memory and thread limits.

| Setting       | What it bounds                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `binary`      | The jailer executable, from the same release as Firecracker.                                                      |
| `directory`   | The jail base. Each VM gets a private jail beneath it.                                                            |
| `cgroup`      | A dedicated cgroup v2 parent under `/sys/fs/cgroup`, with `cpu`, `memory` and `pids` in `cgroup.subtree_control`. |
| `uid`, `gid`  | The non-root identity the VMM runs as. It must be able to use the TAP device.                                     |
| `cpuQuotaUs`  | VMM CPU time per 100,000 µs: `50000` is half a CPU. Minimum `1000`. Guest `cpus` stays a separate setting.        |
| `memoryMaxMb` | The cgroup memory limit in MiB. It must exceed `memoryMb` and leave room for the VMM overhead. Swap is disabled.  |
| `processes`   | The host thread limit of the VM, at least `16`.                                                                   |

The Outpost process must run as root: it never calls `sudo`. Every path it hands to the jailer must be root-owned, free of symlinks and not writable by group or others, up to `/`. That covers both binaries, `kernel`, `rootfs`, the SSH identity and known-hosts files, the SSH client (`/usr/bin/ssh` by default in this mode), `directory` and `cgroup`.

:::caution
A root supervisor runs whatever the workflow project tells it to. Run only a trusted project and configuration as root.
:::

## Release the VM

Releasing the sandbox stops the VMM, deletes the private disk copy and frees the TAP for the next allocation. Changes outside the synchronized repository disappear with the disk. With the jailer, Outpost also kills the VM cgroup, then removes the empty cgroup and the jail.

Ctrl+C or SIGTERM on the Outpost process releases the VM too. When termination is uncertain or the cgroup stays populated, release fails and keeps the files; the error names their path. Resolve the cause, then release again.

## Limits

- One VM per provider configuration at a time. For concurrent tasks, create one configuration per TAP device and guest address.
- Outpost does not build the kernel or root filesystem, or create TAP devices, identities, jail directories, cgroups or firewall rules.
- Commands run as the SSH user: interactive terminals ([`attach`](../sandbox-sessions/)) and elevated commands are rejected. Install system packages in the root filesystem image.
- [Network policies](../network-restrictions/) are rejected: restrict egress with host firewall rules.
- The jailer quota does not count kernel work done outside the VMM cgroup. It uses the jailer’s mount namespace and privilege drop, without a separate PID namespace.
- Validate boot, cancellation, file transfers and release on the host you intend to use before relying on it.

API: [createFirecrackerSandboxProvider](../../reference/createfirecrackersandboxprovider/) · [FirecrackerOptions](../../reference/firecrackeroptions/).
