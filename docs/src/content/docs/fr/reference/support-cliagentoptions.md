---
title: "CliAgentOptions"
description: "CliAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom       | Type                  | Présence  | Rôle                                                                               |
| --------- | --------------------- | --------- | ---------------------------------------------------------------------------------- |
| `harness` | `CliHarness`          | Requis    | Preset CLI à associer au modèle sélectionné.                                       |
| `model`   | `string \| undefined` | Optionnel | Identifiant non vide transmis tel quel ; son absence conserve le défaut de la CLI. |

## Signature

```ts
export interface CliAgentOptions {
  readonly harness: CliHarness;
  readonly model?: string;
}
```

## Contrats associés

- [CliHarness](../cliharness/)
