---
title: "HostCredential"
description: "HostCredential — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name          | Type                                                           | Presence | Meaning                                                                                                   |
| ------------- | -------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `source`      | `HostCredentialPath`                                           | Required | Host location of the credential file and the optional environment variable that relocates the CLI's home. |
| `destination` | `{ readonly file: string; } \| { readonly variable: string; }` | Required | Where the selected content goes: a file path relative to the sandbox home, or an environment variable.    |
| `login`       | `string`                                                       | Required | Host command that creates the file, shown when it is missing.                                             |
| `alternative` | `string \| undefined`                                          | Optional | Alternative authentication form suggested when the file is missing.                                       |
| `select`      | `((content: string) => string) \| undefined`                   | Optional | Validate the file and return only the content to install or forward, without echoing secrets in errors.   |

## Signature

```ts
export interface HostCredential {
  readonly source: HostCredentialPath;
  readonly destination:
    | {
        readonly file: string;
      }
    | {
        readonly variable: string;
      };
  readonly login: string;
  readonly alternative?: string;
  select?(content: string): string;
}
```

## Related contracts

- [HostCredentialPath](../support-hostcredentialpath/)
