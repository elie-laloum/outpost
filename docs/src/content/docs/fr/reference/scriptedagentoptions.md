---
title: "ScriptedAgentOptions"
description: "ScriptedAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ScriptedAgentOptions } from "@elie-laloum/outpost/testing";
```

## Paramètres et propriétés

| Nom     | Type                      | Présence  | Rôle                                                                                                                                              |
| ------- | ------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`  | `string \| undefined`     | Optionnel | Nom d’agent visible dans les observations ; scripted par défaut. Les noms vides sont refusés.                                                     |
| `turns` | `readonly ScriptedTurn[]` | Requis    | Séquence non vide consommée une fois par requête d’agent, entre sandboxes, passes, retries et réparations. Recréez l’agent pour la réinitialiser. |

## Signature

```ts
export interface ScriptedAgentOptions {
  readonly name?: string;
  readonly turns: readonly ScriptedTurn[];
}
```

## Contrats associés

- [ScriptedTurn](../scriptedturn/)
