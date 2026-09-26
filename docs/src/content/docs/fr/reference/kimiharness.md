---
title: "kimiHarness"
description: "kimiHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { kimiHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un harness Kimi Code à partir des réglages d’exécution, d’authentification et de permissions, sans lancer la CLI. Composez-le avec agent({ harness, model }) pour sélectionner séparément un nom de modèle ; reasoning et maxOutputTokens sont refusés. Chaque exécution démarre une session neuve : capture native, reprise, fork et réparations automatiques des réponses ne sont pas pris en charge. La CLI possède sa boucle interne modèle/outils.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom                       | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                | `KimiSettings \| undefined`                     | Optionnel | Configuration du harness Kimi Code ; transmettez le modèle choisi à agent().                                                                                                                                                                                                                                          |
| `settings.authentication` | `AgentAuthentication \| undefined`              | Optionnel | Authentification explicite de ce harness CLI : "account", "usage", { account: { file \| key \| variable } } ou { usage: { key \| variable } }. Les formes non prises en charge échouent à la composition de l’agent. Son absence ne prépare rien et conserve l’accès déjà configuré dans l’environnement d’exécution. |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                               |

## Retour

`CliHarness`

## Signature

```ts
export declare function kimiHarness(settings?: KimiSettings): CliHarness;
```

## Contrats associés

- [CliHarness](../cliharness/)
- [KimiSettings](../kimisettings/)
