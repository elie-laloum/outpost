---
title: "SecretResolveOptions"
description: "SecretResolveOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SecretResolveOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                       | Présence  | Rôle                                                                                                                                                                                                             |
| -------- | -------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signal` | `AbortSignal \| undefined` | Optionnel | Signal transmis à la source pour cette résolution. HTTP Vault, AWS et Azure annulent les requêtes ; les autres adapters SDK le vérifient entre lectures tandis que fromSecrets termine l’attente indépendamment. |

## Signature

```ts
export interface SecretResolveOptions {
  readonly signal?: AbortSignal;
}
```
