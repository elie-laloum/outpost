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

| Nom                     | Type                                                      | Présence          | Rôle                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | --------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`                  | `"cli" \| "custom"`                                       | Requis            | Discriminant d’exécution : cli or custom.                                                                                                                                                                                                                                                                                        |
| `harness`               | `CliHarness \| Harness`                                   | Requis            | Harness d’exécution ; sa variante sélectionne une CLI ou le moteur intégré d’Outpost.                                                                                                                                                                                                                                            |
| `model`                 | `AgentModel \| undefined \| AgentModel`                   | Selon la variante | AgentModel normalisé et figé de l’agent composé ; absent quand un harness CLI conserve son défaut natif.                                                                                                                                                                                                                         |
| `credentials`           | `((variables: Variables) => CredentialPlan) \| undefined` | Selon la variante | Planifie les credentials de cette CLI à partir des variables résolues du workflow, sans accès disque : variables à transmettre, fichiers hôte à copier dans le home privé de la sandbox, fichiers générés et commandes de connexion. Appelé une fois par adapter et par sandbox ; le provider local ne reçoit que les variables. |
| `request`               | `(input: AgentInput) => Command`                          | Selon la variante | Construit le programme, ses arguments et son environnement depuis l’entrée d’agent fournie.                                                                                                                                                                                                                                      |
| `events`                | `(line: string) => readonly AgentEvent[]`                 | Selon la variante | Décode une ligne de sortie du CLI natif en événements d’agent normalisés.                                                                                                                                                                                                                                                        |
| `name`                  | `string`                                                  | Requis            | Identifiant d’agent natif utilisé dans les événements et diagnostics.                                                                                                                                                                                                                                                            |
| `bootstrap`             | `string \| undefined`                                     | Optionnel         | Nom de l’installeur intégré utilisé pour installer une CLI absente sur les providers distants lorsque le bootstrap est activé : un paquet npm épinglé pour claude, codex, copilot et kimi, ou le script d’installation officiel, non épinglé, pour antigravity.                                                                  |
| `requiresFinishedEvent` | `boolean \| undefined`                                    | Optionnel         | Exige l’événement natif finished avant de considérer le tour d’agent terminé.                                                                                                                                                                                                                                                    |
| `variables`             | `Readonly<Record<string, string>> \| undefined`           | Optionnel         | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                                          |
| `conversations`         | `"codex" \| "claude" \| undefined`                        | Optionnel         | Format natif de transcript utilisé en l’absence de stockage personnalisé.                                                                                                                                                                                                                                                        |
| `storage`               | `ConversationStore \| undefined`                          | Optionnel         | Implémentation personnalisée de persistance des conversations de cet adapter.                                                                                                                                                                                                                                                    |
| `capture`               | `boolean \| undefined \| boolean`                         | Selon la variante | Indique si l’adapter active la capture des transcripts natifs.                                                                                                                                                                                                                                                                   |
| `resumable`             | `boolean \| undefined \| boolean`                         | Selon la variante | Indique si l’adapter prend en charge la continuation native des conversations.                                                                                                                                                                                                                                                   |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined`     | Optionnel         | Analyse un transcript natif pour récupérer l’usage de tokens disponible.                                                                                                                                                                                                                                                         |

## Signature

```ts
export type Agent = CliAgent | CustomAgent;
```

## Contrats associés

- [CliAgent](../cliagent/)
- [CustomAgent](../customagent/)
