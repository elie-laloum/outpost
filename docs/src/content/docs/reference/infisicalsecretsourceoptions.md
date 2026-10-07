---
title: "InfisicalSecretSourceOptions"
description: "InfisicalSecretSourceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { InfisicalSecretSourceOptions } from "@elie-laloum/outpost/secrets/infisical";
```

## Parameters and properties

| Name          | Type                                                                                                                     | Presence | Meaning                                                                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `client`      | `{ secrets(): { getSecret(options: GetSecretOptions): Promise<Pick<Secret, "secretValue" \| "secretValueHidden">>; }; }` | Required | Caller-authenticated host client exposing secrets().getSecret(), such as InfisicalSDK for cloud or self-hosted instances. The caller selects its site URL and authentication, owns renewal and retains client ownership. |
| `projectId`   | `string`                                                                                                                 | Required | Explicit Infisical project identifier applied to every selected-name read.                                                                                                                                               |
| `environment` | `string`                                                                                                                 | Required | Nonempty Infisical environment slug, such as dev or prod, applied to each selected-name read.                                                                                                                            |
| `path`        | `string \| undefined`                                                                                                    | Optional | Absolute Infisical folder path without traversal, default /. Imports and reference expansion stay disabled independently of this path.                                                                                   |

## Signature

```ts
import type { GetSecretOptions, Secret } from "@infisical/sdk";

export interface InfisicalSecretSourceOptions {
  readonly client: {
    secrets(): {
      getSecret(
        options: GetSecretOptions,
      ): Promise<Pick<Secret, "secretValue" | "secretValueHidden">>;
    };
  };
  readonly projectId: string;
  readonly environment: string;
  readonly path?: string;
}
```
