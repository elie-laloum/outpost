---
title: "podman"
description: "podman — Outpost API"
sidebar:
  order: 10
---

Public contract for **podman**. See the [providers guide](../../guide/environment/providers/overview/) for behavior, defaults and examples.

## Import

```ts
import { podman } from "@elie-laloum/outpost/providers/podman";
```

## Purpose and behavior

Allocate local containers, explicit host execution or remote sandboxes through dedicated package entry points.

Mounted and host providers default to current branches; remote providers default to integration and reject current. Optional SDKs remain optional. Local execution provides no isolation.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name                     | Type                                                           | Presence | Meaning                                                                                  |
| ------------------------ | -------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`                | `ContainerOptions \| undefined`                                | Optional | Configuration object. Its fields are described in the associated options contract below. |
| `options.egress`         | `EgressPolicy \| undefined`                                    | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.repositoryMode` | `"mounted" \| "isolated" \| undefined`                         | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.caches`         | `readonly DependencyCache[] \| undefined`                      | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.image`          | `string \| undefined`                                          | Optional | Container or guest image reference.                                                      |
| `options.user`           | `{ readonly uid: number; readonly gid: number; } \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.volumes`        | `readonly Volume[] \| undefined`                               | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.variables`      | `Readonly<Record<string, string>> \| undefined`                | Optional | Explicit environment declarations; values are strings.                                   |
| `options.networks`       | `string \| readonly string[] \| undefined`                     | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.groups`         | `readonly (string \| number)[] \| undefined`                   | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.devices`        | `readonly string[] \| undefined`                               | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.cpus`           | `number \| undefined`                                          | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.memoryMb`       | `number \| undefined`                                          | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.label`          | `false \| "z" \| "Z" \| undefined`                             | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.retain`         | `number \| undefined`                                          | Optional | Maximum retained tail per output stream, in bytes.                                       |
| `options.userns`         | `false \| "keep-id" \| undefined`                              | Optional | See the linked contract and this family's rules for its interpretation.                  |

## Returns

`import("../index.ts").SandboxProvider`

## Signature

```ts
export declare const podman: (options?: ContainerOptions) => SandboxProvider;
```

## Related contracts

- [ContainerOptions](../containeroptions/)
