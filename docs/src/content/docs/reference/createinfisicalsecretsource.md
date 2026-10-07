---
title: "createInfisicalSecretSource"
description: "createInfisicalSecretSource — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createInfisicalSecretSource } from "@elie-laloum/outpost/secrets/infisical";
```

## Purpose and behavior

Create a named-secret reader in one Infisical project, environment and path using a caller-authenticated host client. Fetch only requested names with imports and reference expansion disabled, reveal values explicitly and refuse hidden values. Own neither login nor token renewal; cancellation through fromSecrets stops waiting while an in-flight SDK request may finish.

[Complete example and detailed rules](../../guide/secret-sources/).

## Parameters and properties

| Name                  | Type                                                                                                                     | Presence | Meaning                                                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`             | `InfisicalSecretSourceOptions`                                                                                           | Required | Host client or connection configuration and explicit secret selection for the Infisical adapter.                                                                                                                         |
| `options.client`      | `{ secrets(): { getSecret(options: GetSecretOptions): Promise<Pick<Secret, "secretValue" \| "secretValueHidden">>; }; }` | Required | Caller-authenticated host client exposing secrets().getSecret(), such as InfisicalSDK for cloud or self-hosted instances. The caller selects its site URL and authentication, owns renewal and retains client ownership. |
| `options.projectId`   | `string`                                                                                                                 | Required | Explicit Infisical project identifier applied to every selected-name read.                                                                                                                                               |
| `options.environment` | `string`                                                                                                                 | Required | Nonempty Infisical environment slug, such as dev or prod, applied to each selected-name read.                                                                                                                            |
| `options.path`        | `string \| undefined`                                                                                                    | Optional | Absolute Infisical folder path without traversal, default /. Imports and reference expansion stay disabled independently of this path.                                                                                   |

## Returns

`SecretSource`

## Signature

```ts
export declare function createInfisicalSecretSource(
  options: InfisicalSecretSourceOptions,
): SecretSource;
```

## Related contracts

- [InfisicalSecretSourceOptions](../infisicalsecretsourceoptions/)
- [SecretSource](../secretsource/)
