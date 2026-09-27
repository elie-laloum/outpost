---
title: "antigravityHarness"
description: "antigravityHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { antigravityHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un harness Antigravity CLI (agy) à partir des réglages d’exécution, d’authentification et de permissions, sans lancer la CLI. Composez-le avec agent({ harness, model }) pour sélectionner séparément un nom de modèle ; reasoning et maxOutputTokens sont refusés. La reprise à chaud et les réparations réutilisent une conversation dans la même sandbox ouverte. Capture portable, reprise à froid et fork automatisé sont refusés. La CLI possède sa boucle interne modèle/outils.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom                       | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                | `AntigravitySettings \| undefined`              | Optionnel | Configuration du harness Antigravity CLI ; transmettez le modèle choisi à agent().                                                                                                                                                                                                                                    |
| `settings.authentication` | `AgentAuthentication \| undefined`              | Optionnel | Authentification explicite de ce harness CLI : "account", "usage", { account: { file \| key \| variable } } ou { usage: { key \| variable } }. Les formes non prises en charge échouent à la composition de l’agent. Son absence ne prépare rien et conserve l’accès déjà configuré dans l’environnement d’exécution. |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                               |
| `settings.mode`           | `"accept-edits" \| "plan" \| undefined`         | Optionnel | Mode d’exécution Antigravity transmis avec --mode. Sans lui, les exécutions non interactives passent --dangerously-skip-permissions ; les sessions interactives conservent les demandes d’approbation de la CLI.                                                                                                      |

## Retour

`CliHarness`

## Signature

```ts
export declare function antigravityHarness(
  settings?: AntigravitySettings,
): CliHarness;
```

## Contrats associés

- [AntigravitySettings](../antigravitysettings/)
- [CliHarness](../cliharness/)
