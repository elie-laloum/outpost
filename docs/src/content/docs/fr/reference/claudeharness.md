---
title: "claudeHarness"
description: "claudeHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { claudeHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un harness Claude Code à partir des réglages d’exécution, d’authentification et de conversation, sans lancer la CLI. Composez-le avec agent({ harness, model }) pour sélectionner séparément le modèle. La CLI possède sa boucle interne modèle/outils.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom                          | Type                                                                                              | Présence  | Rôle                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `settings`                   | `ClaudeSettings \| undefined`                                                                     | Optionnel | Configuration du harness Claude Code ; transmettez le modèle choisi à agent().                                                                   |
| `settings.permissions`       | `"default" \| "acceptEdits" \| "plan" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optionnel | Mode de permissions Claude Code contrôlant l’approbation des outils.                                                                             |
| `settings.authentication`    | `AgentAuthentication \| undefined`                                                                | Optionnel | Préparation explicite de l’authentification de ce harness CLI. Son absence conserve l’accès déjà configuré sans rechercher des credentials hôte. |
| `settings.variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                          |
| `settings.saveConversations` | `boolean \| undefined`                                                                            | Optionnel | Activer la capture native si l’adapter la prend en charge.                                                                                       |

## Retour

`CliHarness`

## Signature

```ts
export declare function claudeHarness(settings?: ClaudeSettings): CliHarness;
```

## Contrats associés

- [ClaudeSettings](../claudesettings/)
- [CliHarness](../cliharness/)
