---
title: "MicroVM execution"
description: "Configure the experimental Firecracker provider."
---

:::note[Experimental]
Firecracker requires a prepared Linux/KVM host and guest. This is not an automatic VM image builder or a production isolation certification.
:::

Import `firecrackerSandboxProvider` from `@elie-laloum/outpost/providers/firecracker` and supply the boot assets and SSH configuration described by `FirecrackerOptions`.

| Required input                               | Purpose                                                |
| -------------------------------------------- | ------------------------------------------------------ |
| `binary`, `kernel`, `rootfs`                 | Firecracker executable and prepared guest boot files.  |
| `tap`, `guestMac`, `bootArgs`                | Host/guest networking and boot configuration.          |
| `ssh.host`, `user`, `identity`, `knownHosts` | Reachable guest with explicit identity and host trust. |
| `home`                                       | Private agent home inside the guest.                   |

Prepare KVM permissions, the TAP device, guest runtime, SSH server and trusted host key before allocation. Optional CPU, memory and boot-deadline settings bound resources and startup wait.

Provider ownership covers the allocated runtime; it does not provision your host networking or prepare the root filesystem. Validate actual boot, command cancellation, transfers and cleanup on the intended host before adopting it. The [roadmap](../../project/roadmap/) records remaining operational validation.

API: [firecrackerSandboxProvider](../../reference/firecrackersandboxprovider/) · [FirecrackerOptions](../../reference/firecrackeroptions/).
