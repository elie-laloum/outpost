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

| Name             | Type                                                                                                                                                                                                                                | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `binary`         | `string`                                                                                                                                                                                                                            | Required | Absolute host path of the firecracker executable.                                                                                                                                                                                                                                                                                                                                                  |
| `kernel`         | `string`                                                                                                                                                                                                                            | Required | Absolute host path of the guest kernel image.                                                                                                                                                                                                                                                                                                                                                      |
| `rootfs`         | `string`                                                                                                                                                                                                                            | Required | Absolute host path of the guest root filesystem image; each VM boots from a private copy.                                                                                                                                                                                                                                                                                                          |
| `tap`            | `string`                                                                                                                                                                                                                            | Required | Existing host TAP device for the guest network, at most 15 letters, digits, dots, hyphens or underscores. A provider owns it, so it runs one VM at a time.                                                                                                                                                                                                                                         |
| `guestMac`       | `string`                                                                                                                                                                                                                            | Required | MAC address of the guest network interface, as six hexadecimal pairs.                                                                                                                                                                                                                                                                                                                              |
| `bootArgs`       | `string`                                                                                                                                                                                                                            | Required | Kernel boot arguments supplied to Firecracker.                                                                                                                                                                                                                                                                                                                                                     |
| `ssh`            | `{ readonly host: string; readonly user: string; readonly identity: string; readonly knownHosts: string; readonly port?: number; readonly binary?: string; }`                                                                       | Required | How Outpost reaches the guest: host, user, identity file, trusted known_hosts file, optional port (default 22) and ssh binary.                                                                                                                                                                                                                                                                     |
| `root`           | `string \| undefined`                                                                                                                                                                                                               | Optional | Repository directory in the guest, default /workspace.                                                                                                                                                                                                                                                                                                                                             |
| `home`           | `string`                                                                                                                                                                                                                            | Required | Agent home in the guest; it must match the guest user’s HOME or the boot check never succeeds.                                                                                                                                                                                                                                                                                                     |
| `cpus`           | `number \| undefined`                                                                                                                                                                                                               | Optional | Guest vCPUs, default 2. It does not cap host CPU; jailer.cpuQuotaUs does.                                                                                                                                                                                                                                                                                                                          |
| `memoryMb`       | `number \| undefined`                                                                                                                                                                                                               | Optional | Guest memory in MiB, default 2048; jailer.memoryMaxMb must exceed it.                                                                                                                                                                                                                                                                                                                              |
| `bootDeadlineMs` | `number \| undefined`                                                                                                                                                                                                               | Optional | Time allowed for the guest to answer over SSH with its prerequisites, default 60000. Past it acquisition fails with code timeout and the VM stops.                                                                                                                                                                                                                                                 |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                                                                                                                                                                                     | Optional | Environment variables set for every command in the sandbox, as literal values. A key the agent also declares fails with code configuration.                                                                                                                                                                                                                                                        |
| `jailer`         | `{ readonly binary: string; readonly directory: string; readonly cgroup: string; readonly uid: number; readonly gid: number; readonly cpuQuotaUs: number; readonly memoryMaxMb: number; readonly processes: number; } \| undefined` | Optional | Launch through the Firecracker jailer: root-owned binary and paths, a dedicated cgroup v2 parent with cpu, memory and pids controllers enabled, non-root uid and gid, cpuQuotaUs per 100000 microseconds (at least 1000), memoryMaxMb above guest memory and processes (at least 16). Outpost must already run as root and never calls sudo; without jailer, Firecracker runs as the calling user. |

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
