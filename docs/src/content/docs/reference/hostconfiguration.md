---
title: "HostConfiguration"
description: "HostConfiguration — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HostConfiguration } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                                     | Presence | Meaning                                                                                                      |
| ---------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `source`   | `HostCredentialPath`                                     | Required | Host file to read, with an optional environment variable that relocates its directory.                       |
| `path`     | `string`                                                 | Required | Destination relative to the agent home, without . or .. segments.                                            |
| `section`  | `string \| undefined`                                    | Optional | Top-level key that receives the selected entries in the destination; without it they are merged at the root. |
| `optional` | `boolean \| undefined`                                   | Optional | Skip the file when it does not exist on the host instead of failing.                                         |
| `login`    | `string`                                                 | Required | Host command named in the error when a required file is missing.                                             |
| `select`   | `(content: string) => Readonly<Record<string, unknown>>` | Required | Return the entries to merge from the file content; throw when the expected login is absent.                  |

## Signature

```ts
export interface HostConfiguration {
  readonly source: HostCredentialPath;
  readonly path: string;
  readonly section?: string;
  readonly optional?: boolean;
  readonly login: string;
  select(content: string): Readonly<Record<string, unknown>>;
}
```

## Related contracts

- [HostCredentialPath](../support-hostcredentialpath/)
