---
title: "MicroVM execution"
description: "Configure the experimental Firecracker provider."
---

:::note[Experimental]
Firecracker requires a prepared Linux/KVM host and guest. This is not an automatic VM image builder or a production isolation certification.
:::

Import `createFirecrackerSandboxProvider` from `@elie-laloum/outpost/providers/firecracker` and supply the boot assets and SSH configuration described by `FirecrackerOptions`.

| Required input                               | Purpose                                                |
| -------------------------------------------- | ------------------------------------------------------ |
| `binary`, `kernel`, `rootfs`                 | Firecracker executable and prepared guest boot files.  |
| `tap`, `guestMac`, `bootArgs`                | Host/guest networking and boot configuration.          |
| `ssh.host`, `user`, `identity`, `knownHosts` | Reachable guest with explicit identity and host trust. |
| `home`                                       | Private agent home inside the guest.                   |

Prepare KVM permissions, the TAP device, guest runtime, SSH server and trusted host key before allocation. Optional CPU, memory and boot-deadline settings bound resources and startup wait.

The SSH user must own the guest `root` (default `/workspace`), or be able to create it. Outpost keeps its Git synchronization files inside that workspace, so the rest of the guest filesystem can stay read-only for that user.

Provider ownership covers the allocated runtime; it does not provision your host networking or prepare the root filesystem. Validate actual boot, command cancellation, transfers and cleanup on the intended host before adopting it. The [roadmap](../../project/roadmap/) records remaining operational validation.

API: [createFirecrackerSandboxProvider](../../reference/createfirecrackersandboxprovider/) · [FirecrackerOptions](../../reference/firecrackeroptions/).

## Run through the jailer

The optional `jailer` setting starts the matching Firecracker jailer binary. Use
an explicitly trusted root supervisor: Outpost does not run `sudo`. It drops the
VMM to the configured non-root UID/GID, while the supervisor retains its privileges.
The caller must provision a dedicated identity, TAP ownership, a protected jail
base and a cgroup v2 parent with `cpu`, `memory` and `pids` enabled in
`cgroup.subtree_control`.

Set `jailer.binary`, `directory`, `cgroup`, `uid`, `gid`, `cpuQuotaUs`,
`memoryMaxMb` and `processes`. All host boot assets, SSH identity/known-hosts files,
executables and jail/cgroup paths must be root-owned, without symlinks or writable
group/other permissions on any ancestor. The supervisor and its configuration are
trusted operator inputs. Do not run an untrusted workflow project as root.

`cpuQuotaUs` is VMM CPU time per 100,000 microseconds (50,000 means half a CPU).
`memoryMaxMb` is the cgroup memory limit in MiB, must exceed guest `memoryMb`, and
must include VMM overhead. Swap is disabled for this cgroup. `processes` limits
host threads and must be at least 16. Guest `cpus` configures vCPU count, separately
from the host quota. Kernel work outside the VMM cgroup is not included in that quota.

Each allocation creates a private jail and cgroup. Release terminates the VMM and
kills its cgroup before removing the empty cgroup and private files. A populated
cgroup or uncertain termination retains recovery data and reports failure; retry
release after resolving the cause. Parent directories, identities, TAP devices and
firewall rules remain operator-owned. This mode uses the jailer's mount namespace
and privilege drop; it does not request daemonization or a separate PID namespace.

The live tests are `test/firecracker-live.test.ts` and
`test/firecracker-jailer-live.test.ts`. The latter requires
`OUTPOST_FIRECRACKER_JAILER_CONFIG`, a prepared test host, an IPv6 guest address
`fd42:30:240::2` with host gateway `fd42:30:240::1`, and a CPU quota below one CPU.
It deliberately lowers the VM cgroup memory limit to trigger an OOM kill. Run it
only against disposable campaign resources. Successful tests establish those
specific checks, not resistance to every guest or host-kernel exploit.
