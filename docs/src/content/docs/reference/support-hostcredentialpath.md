---
title: "HostCredentialPath"
description: "HostCredentialPath — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name   | Type                                                                 | Presence | Meaning                                                                                                              |
| ------ | -------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `path` | `string`                                                             | Required | Default host path; ~ expands to the host home directory.                                                             |
| `home` | `{ readonly variable: string; readonly path: string; } \| undefined` | Optional | Environment variable that relocates the CLI's home on the host (for example CODEX_HOME) and the file path inside it. |

## Signature

```ts
export interface HostCredentialPath {
  readonly path: string;
  readonly home?: {
    readonly variable: string;
    readonly path: string;
  };
}
```
