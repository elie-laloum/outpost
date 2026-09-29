---
title: "CliAgentOptions"
description: "CliAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom       | Type                     | Présence  | Rôle                                                                                                                                                                                                                                                                   |
| --------- | ------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `harness` | `CliHarness`             | Requis    | Preset CLI, par exemple createCodexHarness(), lié à model à la création de l’agent.                                                                                                                                                                                    |
| `model`   | `ModelSpec \| undefined` | Optionnel | Nom de modèle ou { name, reasoning, maxOutputTokens } ; le preset refuse ici reasoning ou maxOutputTokens non pris en charge. En son absence, la CLI utilise son modèle par défaut, sauf que l’authentification usage de Kimi et un modelProvider Codex en exigent un. |

## Signature

```ts
export interface CliAgentOptions {
  readonly harness: CliHarness;
  readonly model?: ModelSpec;
}
```

## Contrats associés

- [CliHarness](../cliharness/)
- [ModelSpec](../modelspec/)
