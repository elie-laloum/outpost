---
title: "firecracker"
description: "firecracker — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { firecracker } from "@elie-laloum/outpost/providers/firecracker";
```

## Purpose and behavior

Create an opt-in Firecracker microVM provider from explicit kernel, rootfs, TAP and SSH settings. The host must provide KVM and a prepared guest; allocation does not fall back to host execution. The acquired lease owns VM shutdown.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name                     | Type                                                                                                                                                          | Presence | Meaning                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------ |
| `options`                | `FirecrackerOptions`                                                                                                                                          | Required | Prepared host/guest boot assets, network, SSH connection and VM resource settings.   |
| `options.binary`         | `string`                                                                                                                                                      | Required | Host executable path for Firecracker.                                                |
| `options.kernel`         | `string`                                                                                                                                                      | Required | Host path to the prepared Firecracker guest kernel image.                            |
| `options.rootfs`         | `string`                                                                                                                                                      | Required | Host path to the prepared writable guest root filesystem image.                      |
| `options.tap`            | `string`                                                                                                                                                      | Required | Name of the preconfigured host TAP network device for the microVM.                   |
| `options.guestMac`       | `string`                                                                                                                                                      | Required | MAC address assigned to the guest’s network interface.                               |
| `options.bootArgs`       | `string`                                                                                                                                                      | Required | Kernel boot arguments supplied to Firecracker.                                       |
| `options.ssh`            | `{ readonly host: string; readonly user: string; readonly identity: string; readonly knownHosts: string; readonly port?: number; readonly binary?: string; }` | Required | Guest SSH connection settings, including identity file and trusted known-hosts file. |
| `options.root`           | `string \| undefined`                                                                                                                                         | Optional | Repository workspace path inside the execution environment.                          |
| `options.home`           | `string`                                                                                                                                                      | Required | Agent home path inside the execution environment.                                    |
| `options.cpus`           | `number \| undefined`                                                                                                                                         | Optional | CPU allocation limit for the execution environment.                                  |
| `options.memoryMb`       | `number \| undefined`                                                                                                                                         | Optional | Memory allocation limit in megabytes.                                                |
| `options.bootDeadlineMs` | `number \| undefined`                                                                                                                                         | Optional | Maximum time in milliseconds to wait for the guest to become reachable over SSH.     |
| `options.variables`      | `Readonly<Record<string, string>> \| undefined`                                                                                                               | Optional | Explicit environment declarations; values are strings.                               |

## Returns

`SandboxProvider`

## Signature

```ts
export declare function firecracker(
  options: FirecrackerOptions,
): SandboxProvider;
```

## Related contracts

- [FirecrackerOptions](../firecrackeroptions/)
- [SandboxProvider](../sandboxprovider/)
