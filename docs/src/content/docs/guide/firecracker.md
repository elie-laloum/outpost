---
title: "Use Firecracker"
description: "Configure a microVM provider and the host resources it needs."
---

## Prerequisites

Prepare the Linux host and guest image before using the provider. Outpost boots and stops each VM; your infrastructure supplies the resources listed below.

<!-- features -->

- **Linux with KVM**: The user running Outpost can read and write `/dev/kvm`.
- **Firecracker and a kernel**: The `firecracker` binary and a guest kernel image on the host.
- **A TAP device**: Created, addressed and routed on the host, one per concurrent VM.
- **A guest root filesystem**: A disk image whose SSH server starts at boot on the TAP network.
- **Guest tools**: Node.js 24+, Git, `setsid` and `tar` on the guest user’s `PATH`.
- **SSH trust**: A private key for the guest user and a known-hosts file holding the guest’s host key.

## Configure the provider

Import the provider from its subpath and pass it to `dispatch()` like any other sandbox.

<!-- tabs -->

```ts title="firecracker.ts"
import { createFirecrackerSandboxProvider } from "@elie-laloum/outpost/providers/firecracker";

export const sandboxProvider = createFirecrackerSandboxProvider({
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
```

```ts title="run.ts"
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { repository, coder } from "./outpost.config.ts";
import { sandboxProvider } from "./firecracker.ts";

export const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/firecracker" },
  brief: { text: "Run the test suite and fix the first failure." },
});
reportValue(result.commits);
// Example output: [ { oid: '8f3a21c…', subject: 'Fix the failing test' } ]
```

Each allocation boots a private copy of `rootfs`, then polls SSH until the guest answers with the expected `$HOME` and tools. Host paths must be absolute.

API reference: [FirecrackerOptions](../../reference/firecrackeroptions/).

## Repository access

Firecracker works like a [cloud sandbox](../cloud-sandboxes/): Outpost uploads the Git history over SSH, the agent commits in the guest, then Outpost downloads, validates and applies the new commits. A missing agent CLI is installed in `home` before the first turn, unless you pass `bootstrap: false`.

The SSH user must own `root` or be able to create it. Outpost keeps its Git transfer files in `root/.git`, so the rest of the guest filesystem can stay read-only for that user.

## Run through the jailer

Set `jailer` to start Firecracker through its jailer: the VMM runs as a non-root identity, in a private chroot and a cgroup v2 child with CPU, memory and thread limits.

API reference: [FirecrackerOptions](../../reference/firecrackeroptions/).

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
- File downloads from the guest are buffered one file at a time in the host process, so the VMM memory limit is not a total host memory budget.
- The jailer quota does not count kernel work done outside the VMM cgroup. It uses the jailer’s mount namespace and privilege drop, without a separate PID namespace.
- Validate boot, cancellation, file transfers and release on the host you intend to use before relying on it.

API: [createFirecrackerSandboxProvider](../../reference/createfirecrackersandboxprovider/) · [FirecrackerOptions](../../reference/firecrackeroptions/).
