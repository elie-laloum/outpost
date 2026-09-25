---
title: "geminiHarness"
description: "geminiHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { geminiHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un harness Gemini CLI à partir des réglages d’exécution, d’authentification et de conversation, sans lancer la CLI. Composez-le avec agent({ harness, model }) pour sélectionner séparément le modèle. La CLI possède sa boucle interne modèle/outils.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom                       | Type                                                        | Présence  | Rôle                                                                                                                                             |
| ------------------------- | ----------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `settings`                | `GeminiSettings \| undefined`                               | Optionnel | Configuration du harness Gemini CLI ; transmettez le modèle choisi à agent().                                                                    |
| `settings.authentication` | `AgentAuthentication \| undefined`                          | Optionnel | Préparation explicite de l’authentification de ce harness CLI. Son absence conserve l’accès déjà configuré sans rechercher des credentials hôte. |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined`             | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                          |
| `settings.approvalMode`   | `"default" \| "plan" \| "auto_edit" \| "yolo" \| undefined` | Optionnel | Mode d’approbation des outils du CLI Gemini.                                                                                                     |

## Retour

`CliHarness`

## Signature

```ts
export declare function geminiHarness(settings?: GeminiSettings): CliHarness;
```

## Contrats associés

- [CliHarness](../cliharness/)
- [GeminiSettings](../geminisettings/)
