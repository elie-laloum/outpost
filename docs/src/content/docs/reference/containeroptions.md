---
title: "ContainerOptions"
description: "ContainerOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **ContainerOptions**. See the [providers guide](../../guide/environment/providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { ContainerOptions } from "@elie-laloum/outpost/providers/docker";
import type { ContainerOptions } from "@elie-laloum/outpost/providers/podman";
```

## Purpose and behavior

Allocate local containers, explicit host execution or remote sandboxes through dedicated package entry points.

Mounted and host providers default to current branches; remote providers default to integration and reject current. Optional SDKs remain optional. Local execution provides no isolation.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name             | Type                                                           | Presence | Meaning                                                                 |
| ---------------- | -------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `egress`         | `EgressPolicy \| undefined`                                    | Optional | See the linked contract and this family's rules for its interpretation. |
| `repositoryMode` | `"mounted" \| "isolated" \| undefined`                         | Optional | See the linked contract and this family's rules for its interpretation. |
| `caches`         | `readonly DependencyCache[] \| undefined`                      | Optional | See the linked contract and this family's rules for its interpretation. |
| `image`          | `string \| undefined`                                          | Optional | Container or guest image reference.                                     |
| `user`           | `{ readonly uid: number; readonly gid: number; } \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `volumes`        | `readonly Volume[] \| undefined`                               | Optional | See the linked contract and this family's rules for its interpretation. |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                | Optional | Explicit environment declarations; values are strings.                  |
| `networks`       | `string \| readonly string[] \| undefined`                     | Optional | See the linked contract and this family's rules for its interpretation. |
| `groups`         | `readonly (string \| number)[] \| undefined`                   | Optional | See the linked contract and this family's rules for its interpretation. |
| `devices`        | `readonly string[] \| undefined`                               | Optional | See the linked contract and this family's rules for its interpretation. |
| `cpus`           | `number \| undefined`                                          | Optional | See the linked contract and this family's rules for its interpretation. |
| `memoryMb`       | `number \| undefined`                                          | Optional | See the linked contract and this family's rules for its interpretation. |
| `label`          | `false \| "z" \| "Z" \| undefined`                             | Optional | See the linked contract and this family's rules for its interpretation. |
| `retain`         | `number \| undefined`                                          | Optional | Maximum retained tail per output stream, in bytes.                      |
| `userns`         | `false \| "keep-id" \| undefined`                              | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface ContainerOptions {
  readonly egress?: EgressPolicy;
  readonly repositoryMode?: "mounted" | "isolated";
  readonly caches?: readonly DependencyCache[];
  readonly image?: string;
  readonly user?: {
    readonly uid: number;
    readonly gid: number;
  };
  readonly volumes?: readonly Volume[];
  readonly variables?: Variables;
  readonly networks?: string | readonly string[];
  readonly groups?: readonly (string | number)[];
  readonly devices?: readonly string[];
  readonly cpus?: number;
  readonly memoryMb?: number;
  readonly label?: "z" | "Z" | false;
  readonly retain?: number;
  readonly userns?: "keep-id" | false;
}
```

## Related contracts

- [DependencyCache](../dependencycache/)
- [EgressPolicy](../egresspolicy/)
- [Variables](../variables/)
- [Volume](../volume/)
