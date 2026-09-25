---
title: "local"
description: "local — Outpost API"
sidebar:
  order: 10
---

Public contract for **local**. See the [providers guide](../../guide/environment/providers/overview/) for behavior, defaults and examples.

## Import

```ts
import { local } from "@elie-laloum/outpost/providers/local";
```

## Purpose and behavior

Allocate local containers, explicit host execution or remote sandboxes through dedicated package entry points.

Mounted and host providers default to current branches; remote providers default to integration and reject current. Optional SDKs remain optional. Local execution provides no isolation.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name                | Type                                            | Presence | Meaning                                                                                  |
| ------------------- | ----------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`           | `LocalOptions \| undefined`                     | Optional | Configuration object. Its fields are described in the associated options contract below. |
| `options.variables` | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                   |

## Returns

`SandboxProvider`

## Signature

```ts
export declare function local(options?: LocalOptions): SandboxProvider;
```

## Related contracts

- [LocalOptions](../support-localoptions/)
- [SandboxProvider](../sandboxprovider/)
