---
title: "claude"
description: "claude — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { claude } from "@elie-laloum/outpost";
```

## Rôle et comportement

Espace de noms exposant harness() pour configurer Claude Code. Composez le harness avec agent({ harness, model }) pour sélectionner séparément le modèle. La CLI possède sa boucle interne modèle/outils.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom                                  | Type                                                                                              | Présence  | Rôle                                                                                                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `harness`                            | `(settings?: Omit<ClaudeSettings, "model">) => CliHarness`                                        | Requis    | Crée un harness Claude Code à partir de ses options d’exécution, d’authentification et de conversation, sans démarrer la CLI.                    |
| `harness.settings`                   | `Omit<ClaudeSettings, "model"> \| undefined`                                                      | Optionnel | Configuration du harness Claude Code ; transmettez le modèle choisi à agent().                                                                   |
| `harness.settings.reasoning`         | `"low" \| "medium" \| "high" \| "xhigh" \| "max" \| undefined`                                    | Optionnel | Niveau d’effort de raisonnement transmis au CLI de l’agent choisi.                                                                               |
| `harness.settings.permissions`       | `"default" \| "acceptEdits" \| "plan" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optionnel | Mode de permissions Claude Code contrôlant l’approbation des outils.                                                                             |
| `harness.settings.authentication`    | `AgentAuthentication \| undefined`                                                                | Optionnel | Préparation explicite de l’authentification de ce harness CLI. Son absence conserve l’accès déjà configuré sans rechercher des credentials hôte. |
| `harness.settings.variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                          |
| `harness.settings.saveConversations` | `boolean \| undefined`                                                                            | Optionnel | Activer la capture native si l’adapter la prend en charge.                                                                                       |

### harness()

```ts
harness(settings?: Omit<ClaudeSettings, "model">): CliHarness
```

## Signature

```ts
export declare const claude: Readonly<{
  harness(settings?: Omit<ClaudeSettings, "model">): CliHarness;
}>;
```

## Contrats associés

- [ClaudeSettings](../claudesettings/)
- [CliHarness](../cliharness/)
