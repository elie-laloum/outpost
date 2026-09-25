---
title: "gemini"
description: "gemini — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { gemini } from "@elie-laloum/outpost";
```

## Rôle et comportement

Espace de noms exposant harness() pour configurer Gemini CLI. Composez le harness avec agent({ harness, model }) pour sélectionner séparément le modèle. La CLI possède sa boucle interne modèle/outils.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom                               | Type                                                        | Présence  | Rôle                                                                                                                                             |
| --------------------------------- | ----------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `harness`                         | `(settings?: Omit<GeminiSettings, "model">) => CliHarness`  | Requis    | Crée un harness Gemini CLI à partir de ses options d’exécution, d’authentification et de conversation, sans démarrer la CLI.                     |
| `harness.settings`                | `Omit<GeminiSettings, "model"> \| undefined`                | Optionnel | Configuration du harness Gemini CLI ; transmettez le modèle choisi à agent().                                                                    |
| `harness.settings.authentication` | `AgentAuthentication \| undefined`                          | Optionnel | Préparation explicite de l’authentification de ce harness CLI. Son absence conserve l’accès déjà configuré sans rechercher des credentials hôte. |
| `harness.settings.variables`      | `Readonly<Record<string, string>> \| undefined`             | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                          |
| `harness.settings.approvalMode`   | `"default" \| "plan" \| "auto_edit" \| "yolo" \| undefined` | Optionnel | Mode d’approbation des outils du CLI Gemini.                                                                                                     |

### harness()

```ts
harness(settings?: Omit<GeminiSettings, "model">): CliHarness
```

## Signature

```ts
export declare const gemini: Readonly<{
  harness(settings?: Omit<GeminiSettings, "model">): CliHarness;
}>;
```

## Contrats associés

- [CliHarness](../cliharness/)
- [GeminiSettings](../geminisettings/)
