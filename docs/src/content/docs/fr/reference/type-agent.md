---
title: "Agent"
description: "Agent — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Agent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom                     | Type                                                                                   | Présence          | Rôle                                                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`                  | `"cli" \| "custom"`                                                                    | Requis            | Discriminant d’exécution : cli or custom.                                                                                                                                  |
| `harness`               | `CliHarness \| CustomHarness`                                                          | Requis            | Harness d’exécution ; sa variante sélectionne une CLI ou un callback personnalisé.                                                                                         |
| `model`                 | `AgentModel \| undefined \| AgentModel`                                                | Selon la variante | AgentModel normalisé et figé de l’agent composé ; absent quand un harness CLI conserve son défaut natif.                                                                   |
| `authenticate`          | `((variables: Readonly<Record<string, string>>) => Command \| undefined) \| undefined` | Selon la variante | Construit une commande d’authentification optionnelle depuis les variables résolues explicitement ; réactivée lorsque la configuration sélectionnée pour cette CLI change. |
| `request`               | `(input: AgentInput) => Command`                                                       | Selon la variante | Construit le programme, ses arguments et son environnement depuis l’entrée d’agent fournie.                                                                                |
| `events`                | `(line: string) => readonly AgentEvent[]`                                              | Selon la variante | Décode une ligne de sortie du CLI natif en événements d’agent normalisés.                                                                                                  |
| `name`                  | `string`                                                                               | Requis            | Identifiant d’agent natif utilisé dans les événements et diagnostics.                                                                                                      |
| `bootstrap`             | `string \| undefined`                                                                  | Optionnel         | Recette shell installant le CLI natif lorsque le bootstrap est activé.                                                                                                     |
| `requiresFinishedEvent` | `boolean \| undefined`                                                                 | Optionnel         | Exige l’événement natif finished avant de considérer le tour d’agent terminé.                                                                                              |
| `variables`             | `Readonly<Record<string, string>> \| undefined`                                        | Optionnel         | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                    |
| `conversations`         | `"codex" \| "claude" \| undefined`                                                     | Optionnel         | Format natif de transcript utilisé en l’absence de stockage personnalisé.                                                                                                  |
| `storage`               | `ConversationStore \| undefined`                                                       | Optionnel         | Implémentation personnalisée de persistance des conversations de cet adapter.                                                                                              |
| `capture`               | `boolean \| undefined \| boolean`                                                      | Selon la variante | Indique si l’adapter active la capture des transcripts natifs.                                                                                                             |
| `resumable`             | `boolean \| undefined \| boolean`                                                      | Selon la variante | Indique si l’adapter prend en charge la continuation native des conversations.                                                                                             |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined`                                  | Optionnel         | Analyse un transcript natif pour récupérer l’usage de tokens disponible.                                                                                                   |

## Signature

```ts
export type Agent = CliAgent | CustomAgent;
```

## Contrats associés

- [CliAgent](../cliagent/)
- [CustomAgent](../customagent/)
