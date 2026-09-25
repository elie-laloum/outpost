---
title: "codexHarness"
description: "codexHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { codexHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un harness Codex à partir des réglages d’exécution, d’authentification et de conversation, sans lancer la CLI. Composez-le avec agent({ harness, model }) pour sélectionner séparément le modèle. La CLI possède sa boucle interne modèle/outils.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom                          | Type                                            | Présence  | Rôle                                                                                                                                             |
| ---------------------------- | ----------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `settings`                   | `CodexSettings \| undefined`                    | Optionnel | Configuration du harness Codex ; transmettez le modèle choisi à agent().                                                                         |
| `settings.modelProvider`     | `CodexModelProvider \| undefined`               | Optionnel | Configuration d’un endpoint de modèle Codex personnalisé ; exige la compatibilité Responses API.                                                 |
| `settings.approvalReviewer`  | `"user" \| "auto_review" \| undefined`          | Optionnel | Responsable de l’approbation Codex : utilisateur ou revue automatique.                                                                           |
| `settings.authentication`    | `AgentAuthentication \| undefined`              | Optionnel | Préparation explicite de l’authentification de ce harness CLI. Son absence conserve l’accès déjà configuré sans rechercher des credentials hôte. |
| `settings.variables`         | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                          |
| `settings.saveConversations` | `boolean \| undefined`                          | Optionnel | Activer la capture native si l’adapter la prend en charge.                                                                                       |

## Retour

`CliHarness`

## Signature

```ts
export declare function codexHarness(settings?: CodexSettings): CliHarness;
```

## Contrats associés

- [CliHarness](../cliharness/)
- [CodexSettings](../codexsettings/)
