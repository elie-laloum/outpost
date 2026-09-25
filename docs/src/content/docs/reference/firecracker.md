---
title: "firecracker"
description: "firecracker — Outpost API"
sidebar:
  order: 10
---

Public contract for **firecracker**. See the [firecracker prototype guide](../../guide/advanced/firecracker/) for behavior, defaults and examples.

## Import

```ts
import { firecracker } from "@elie-laloum/outpost/providers/firecracker";
```

## Purpose and behavior

Allocate an opt-in microVM through an explicitly prepared host and guest.

Research prototype with host/KVM, image and networking prerequisites. It does not silently fall back to host execution. Real boots require separate live validation.

[Complete example and detailed rules](../../guide/advanced/firecracker/).

## Parameters and properties

| Name                     | Type                                                                                                                                                          | Presence | Meaning                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`                | `FirecrackerOptions`                                                                                                                                          | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.binary`         | `string`                                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.kernel`         | `string`                                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.rootfs`         | `string`                                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.tap`            | `string`                                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.guestMac`       | `string`                                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.bootArgs`       | `string`                                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.ssh`            | `{ readonly host: string; readonly user: string; readonly identity: string; readonly knownHosts: string; readonly port?: number; readonly binary?: string; }` | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.root`           | `string \| undefined`                                                                                                                                         | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.home`           | `string`                                                                                                                                                      | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.cpus`           | `number \| undefined`                                                                                                                                         | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.memoryMb`       | `number \| undefined`                                                                                                                                         | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.bootDeadlineMs` | `number \| undefined`                                                                                                                                         | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.variables`      | `Readonly<Record<string, string>> \| undefined`                                                                                                               | Optional | Explicit environment declarations; values are strings.                                   |

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
