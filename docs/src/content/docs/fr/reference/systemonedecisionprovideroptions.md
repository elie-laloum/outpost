---
title: "SystemOneDecisionProviderOptions"
description: "SystemOneDecisionProviderOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SystemOneDecisionProviderOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                  | Présence  | Rôle                                                                                                                                   |
| ------------------ | --------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `baseUrl`          | `string`              | Requis    | URL de base HTTP(S) incluant le préfixe de version, comme /v1 ; /systemone est ajouté. Identifiants, query et fragment sont interdits. |
| `apiKey`           | `string \| false`     | Requis    | Clé bearer explicite non vide, ou false pour un endpoint sans authentification.                                                        |
| `timeoutMs`        | `number \| undefined` | Optionnel | Délai de requête incluant la lecture de réponse, en millisecondes entières positives ; 120000 par défaut.                              |
| `maxResponseBytes` | `number \| undefined` | Optionnel | Limite entière positive de taille de réponse ; 8 MiB par défaut. Une réponse trop grande échoue avec response.                         |

## Signature

```ts
export interface SystemOneDecisionProviderOptions {
  readonly baseUrl: string;
  readonly apiKey: string | false;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}
```
