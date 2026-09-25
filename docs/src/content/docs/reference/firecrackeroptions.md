---
title: "FirecrackerOptions"
description: "FirecrackerOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **FirecrackerOptions**. See the [firecracker prototype guide](../../guide/advanced/firecracker/) for behavior, defaults and examples.

## Import

```ts
import type { FirecrackerOptions } from "@elie-laloum/outpost/providers/firecracker";
```

## Purpose and behavior

Allocate an opt-in microVM through an explicitly prepared host and guest.

Research prototype with host/KVM, image and networking prerequisites. It does not silently fall back to host execution. Real boots require separate live validation.

[Complete example and detailed rules](../../guide/advanced/firecracker/).

## Parameters and properties

| Name             | Type                                                                                                                                                          | Presence | Meaning                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `binary`         | `string`                                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation. |
| `kernel`         | `string`                                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation. |
| `rootfs`         | `string`                                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation. |
| `tap`            | `string`                                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation. |
| `guestMac`       | `string`                                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation. |
| `bootArgs`       | `string`                                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation. |
| `ssh`            | `{ readonly host: string; readonly user: string; readonly identity: string; readonly knownHosts: string; readonly port?: number; readonly binary?: string; }` | Required | See the linked contract and this family's rules for its interpretation. |
| `root`           | `string \| undefined`                                                                                                                                         | Optional | See the linked contract and this family's rules for its interpretation. |
| `home`           | `string`                                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation. |
| `cpus`           | `number \| undefined`                                                                                                                                         | Optional | See the linked contract and this family's rules for its interpretation. |
| `memoryMb`       | `number \| undefined`                                                                                                                                         | Optional | See the linked contract and this family's rules for its interpretation. |
| `bootDeadlineMs` | `number \| undefined`                                                                                                                                         | Optional | See the linked contract and this family's rules for its interpretation. |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                                                                                                               | Optional | Explicit environment declarations; values are strings.                  |

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
}
```

## Related contracts

- [Variables](../variables/)
