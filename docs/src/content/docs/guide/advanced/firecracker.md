---
title: Firecracker research prototype
description: Run an opt-in microVM with an explicitly prepared Linux guest.
sidebar:
  order: 7
---

`@elie-laloum/outpost/providers/firecracker` is an opt-in research provider. It boots a real Firecracker process and uses authenticated SSH for guest commands and binary file transfers. It uses remote placement, so Outpost's existing repository seeding and synchronization apply. No paid service or optional SDK is required.

This experimental provider requires a disposable Linux host with KVM, a prepared kernel and root filesystem, and explicit guest connectivity. Complete the prerequisites below before running the example; no host provisioning is automatic.

<details>
<summary>Prerequisites and complete procedure</summary>

`@elie-laloum/outpost/providers/firecracker` is an opt-in research provider. It boots a real Firecracker process and uses authenticated SSH for guest commands and binary file transfers. It uses remote placement, so Outpost's existing repository seeding and synchronization apply. No paid service or optional SDK is required.

This prototype does **not** use Firecracker's jailer, configure cgroups, certify isolation, or provide a production security boundary. Use a dedicated disposable Linux host and trusted workloads. Firecracker's [official getting-started guide](https://github.com/firecracker-microvm/firecracker/blob/main/docs/getting-started.md) describes the kernel, root filesystem, network and production jailer requirements. Outpost does not install software, invoke sudo, change firewall rules or fall back to host execution.

## Prepare the host and guest

An administrator must prepare these resources before acquisition:

1. A Linux x86_64 or aarch64 host with read/write access to `/dev/kvm`, an executable Firecracker binary, a matching uncompressed Linux kernel, and an ext4 base root filesystem. Pin and verify your chosen artifacts. Keep the base immutable while leases are created; Outpost copies it privately for every VM.
2. A persistent TAP owned by the calling user, already configured with a host IP and a route to the guest. Configure forwarding, DNS and outbound access separately if agents require them. Each concurrent VM needs its own TAP, MAC and guest IP; Outpost never removes these host resources.
3. A bootable guest with matching virtio drivers, a configured static IP/default route, Node.js 24+, Git, util-linux `setsid`, tar, a POSIX shell and OpenSSH server enabled at boot. Install your agent CLI in this image. For a Debian-derived guest, install `git util-linux tar openssh-server`, install Node 24 for the guest architecture, create an `outpost` user with home `/home/outpost`, and make `/workspace` writable by that user. Disable password login and add the dedicated host public key to `/home/outpost/.ssh/authorized_keys` (directory mode 700, file mode 600, owned by the user). Enable `ssh.service` before sealing the image. This image preparation happens outside Outpost.
4. A dedicated private SSH identity on the host and a `known_hosts` file containing the guest host public key verified from the prepared image. Do not populate trust from an unauthenticated network scan. The image must retain its SSH host keys across private copies. Outpost enforces strict host-key checking, disables user SSH configuration and uses only the explicit identity.

Guest authentication to an agent service is separate from SSH transport authentication. Supply only the variables required by your agent; the copied guest home and credentials disappear with normal VM disposal.

## Create a provider

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { firecracker } from "@elie-laloum/outpost/providers/firecracker";

await using sandbox = await createSandbox({
  repository: "/work/project",
  provider: firecracker({
    binary: "/opt/firecracker/firecracker",
    kernel: "/opt/firecracker/vmlinux",
    rootfs: "/opt/firecracker/outpost.ext4",
    bootArgs: "console=ttyS0 reboot=k panic=1 root=/dev/vda rw",
    tap: "outpost-tap0",
    guestMac: "06:00:ac:10:00:02",
    root: "/workspace",
    home: "/home/outpost",
    ssh: {
      host: "172.16.0.2",
      user: "outpost",
      identity: "/work/keys/outpost",
      knownHosts: "/work/keys/known_hosts",
    },
    cpus: 2,
    memoryMb: 2048,
    bootDeadlineMs: 60_000,
  }),
});
```

Paths are absolute. `bootArgs` must match your kernel, root device and prepared guest networking. The provider waits for SSH, checks the declared home and guest prerequisites, then returns the lease. Interactive terminals and elevated commands are unsupported. Commands preserve exit status and wait for the process, including after output closes. Cancellation uses an independent SSH connection and an owned guest process group; if confirmation fails, the operation throws and the VM should be released.

Transfers preserve bytes, ordinary permission bits and symlinks, including directory contents. Destination symlink traversal is rejected. Files are buffered individually in memory and manifests are limited to 16 MiB; this prototype is unsuitable for very large files or trees. Commands and transfers have bounded deadlines. Filesystem copying during allocation is not interruptible mid-copy.

## Ownership and validation

Each lease owns a private `outpost-firecracker-*` temporary directory containing its disk, configuration and API socket. Disposal waits for active operations, terminates only its child VM and removes private staging after termination is confirmed. If termination is uncertain, the error identifies the retained disk; inspect the process and recover the disk before manual cleanup. Abrupt host/process crashes can also leave artifacts. Temporary `outpost-firecracker-tap-<name>.lock` and `outpost-firecracker-ssh-<hash>.lock` directories reserve the TAP and SSH endpoint, preventing cooperating providers on the same host from sharing a TAP. They are not automatically reclaimed after a crash; remove them only after verifying the old VM has stopped. System exit attempts to kill the child but cannot guarantee asynchronous disk cleanup.

Routine tests simulate SSH and the VM process; they do not prove KVM boot, networking or isolation. For an actual boot, save the provider options above as an ignored JSON file and run:

```sh
OUTPOST_FIRECRACKER_CONFIG=/absolute/path/guest.json node --test test/firecracker-live.test.ts
```

The fixture boots the supplied VM, checks binary transfer through a guest process, nonzero exit after output closes, cancellation and reuse, and disposes the VM. Without the configuration it is explicitly skipped. A successful live run validates that supplied environment only; production jailer integration, performance measurements, adversarial testing and snapshot support remain research work.

</details>

[Detailed contract and limits](../../behavior/providers/firecracker/).
