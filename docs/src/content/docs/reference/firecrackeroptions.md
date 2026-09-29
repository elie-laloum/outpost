---
title: "FirecrackerOptions"
description: "FirecrackerOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FirecrackerOptions } from "@elie-laloum/outpost/providers/firecracker";
```

## Parameters and properties

| Name             | Type                                                                                                                                                                                                                                | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `binary`         | `string`                                                                                                                                                                                                                            | Required | Host executable path for Firecracker.                                                                                                                                                                                                                                                                                                                                                                                |
| `kernel`         | `string`                                                                                                                                                                                                                            | Required | Host path to the prepared Firecracker guest kernel image.                                                                                                                                                                                                                                                                                                                                                            |
| `rootfs`         | `string`                                                                                                                                                                                                                            | Required | Host path to the prepared writable guest root filesystem image.                                                                                                                                                                                                                                                                                                                                                      |
| `tap`            | `string`                                                                                                                                                                                                                            | Required | Name of the preconfigured host TAP network device for the microVM.                                                                                                                                                                                                                                                                                                                                                   |
| `guestMac`       | `string`                                                                                                                                                                                                                            | Required | MAC address assigned to the guest’s network interface.                                                                                                                                                                                                                                                                                                                                                               |
| `bootArgs`       | `string`                                                                                                                                                                                                                            | Required | Kernel boot arguments supplied to Firecracker.                                                                                                                                                                                                                                                                                                                                                                       |
| `ssh`            | `{ readonly host: string; readonly user: string; readonly identity: string; readonly knownHosts: string; readonly port?: number; readonly binary?: string; }`                                                                       | Required | Guest SSH connection settings, including identity file and trusted known-hosts file.                                                                                                                                                                                                                                                                                                                                 |
| `root`           | `string \| undefined`                                                                                                                                                                                                               | Optional | Repository workspace path inside the execution environment.                                                                                                                                                                                                                                                                                                                                                          |
| `home`           | `string`                                                                                                                                                                                                                            | Required | Agent home path inside the execution environment.                                                                                                                                                                                                                                                                                                                                                                    |
| `cpus`           | `number \| undefined`                                                                                                                                                                                                               | Optional | Number of guest vCPUs; does not impose a host CPU quota. The jailer cpuQuotaUs setting limits VMM CPU bandwidth separately.                                                                                                                                                                                                                                                                                          |
| `memoryMb`       | `number \| undefined`                                                                                                                                                                                                               | Optional | Guest memory size in MiB. The optional jailer memoryMaxMb limit covers the VMM and must exceed guest memory.                                                                                                                                                                                                                                                                                                         |
| `bootDeadlineMs` | `number \| undefined`                                                                                                                                                                                                               | Optional | Maximum time in milliseconds to wait for the guest to become reachable over SSH.                                                                                                                                                                                                                                                                                                                                     |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                                                                                                                                                                                     | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                                                                                                                                               |
| `jailer`         | `{ readonly binary: string; readonly directory: string; readonly cgroup: string; readonly uid: number; readonly gid: number; readonly cpuQuotaUs: number; readonly memoryMaxMb: number; readonly processes: number; } \| undefined` | Optional | Optional privileged jailer launch with a root-owned binary and assets, protected jail directory, dedicated cgroup v2 parent, non-root uid/gid, cpuQuotaUs per 100000 microseconds, memoryMaxMb including VMM overhead, and a processes thread limit. Requires a trusted root supervisor; never invokes sudo. CPU, memory and pids controllers must already be enabled. Omit to retain direct experimental execution. |

## Signature

```ts
export interface FirecrackerOptions {
  readonly binary: string;
  readonly kernel: string;
  readonly rootfs: string;
  readonly tap: string;
  readonly guestMac: string;
  readonly bootArgs: string;
  readonly ssh: {
    readonly host: string;
    readonly user: string;
    readonly identity: string;
    readonly knownHosts: string;
    readonly port?: number;
    readonly binary?: string;
  };
  readonly root?: string;
  readonly home: string;
  readonly cpus?: number;
  readonly memoryMb?: number;
  readonly bootDeadlineMs?: number;
  readonly variables?: Variables;
  readonly jailer?: {
    readonly binary: string;
    readonly directory: string;
    readonly cgroup: string;
    readonly uid: number;
    readonly gid: number;
    readonly cpuQuotaUs: number;
    readonly memoryMaxMb: number;
    readonly processes: number;
  };
}
```

## Related contracts

- [Variables](../variables/)
