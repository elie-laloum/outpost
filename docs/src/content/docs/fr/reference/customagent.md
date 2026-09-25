---
title: "CustomAgent"
description: "CustomAgent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CustomAgent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                     | Type                                                  | Présence  | Rôle                                                                                                                             |
| ----------------------- | ----------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `resumable`             | `false`                                               | Requis    | Toujours faux : les callbacks personnalisés n’ont ni reprise native ni réparation automatique.                                   |
| `capture`               | `false`                                               | Requis    | Toujours faux : le runner personnalisé ne capture pas de transcripts natifs.                                                     |
| `kind`                  | `"custom"`                                            | Requis    | Discriminant d’exécution : custom.                                                                                               |
| `harness`               | `CustomHarness`                                       | Requis    | Harness personnalisé avec son fournisseur de modèles.                                                                            |
| `model`                 | `AgentModel`                                          | Requis    | AgentModel normalisé et figé dont le nom, le raisonnement et la limite de sortie s’appliquent par défaut aux requêtes du modèle. |
| `name`                  | `string`                                              | Requis    | Identifiant d’agent natif utilisé dans les événements et diagnostics.                                                            |
| `bootstrap`             | `string \| undefined`                                 | Optionnel | Recette shell installant le CLI natif lorsque le bootstrap est activé.                                                           |
| `requiresFinishedEvent` | `boolean \| undefined`                                | Optionnel | Exige l’événement natif finished avant de considérer le tour d’agent terminé.                                                    |
| `variables`             | `Readonly<Record<string, string>> \| undefined`       | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                          |
| `conversations`         | `"codex" \| "claude" \| undefined`                    | Optionnel | Format natif de transcript utilisé en l’absence de stockage personnalisé.                                                        |
| `storage`               | `ConversationStore \| undefined`                      | Optionnel | Implémentation personnalisée de persistance des conversations de cet adapter.                                                    |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined` | Optionnel | Analyse un transcript natif pour récupérer l’usage de tokens disponible.                                                         |

## Signature

```ts
export interface CustomAgent extends AgentFeatures {
  readonly resumable: false;
  readonly capture: false;
  readonly kind: "custom";
  readonly harness: CustomHarness;
  readonly model: AgentModel;
}
```

## Contrats associés

- [AgentFeatures](../support-agentfeatures/)
- [AgentModel](../agentmodel/)
- [CustomHarness](../type-customharness/)
