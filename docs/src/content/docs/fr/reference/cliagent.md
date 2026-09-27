---
title: "CliAgent"
description: "CliAgent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CliAgent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                     | Type                                                      | Présence  | Rôle                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | --------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`                  | `"cli"`                                                   | Requis    | Discriminant d’exécution : cli.                                                                                                                                                                                                                                                                                                  |
| `harness`               | `CliHarness`                                              | Requis    | Preset CLI à associer au modèle sélectionné.                                                                                                                                                                                                                                                                                     |
| `model`                 | `AgentModel \| undefined`                                 | Optionnel | AgentModel normalisé et figé lié à la commande CLI ; absent quand le défaut natif de la CLI est conservé.                                                                                                                                                                                                                        |
| `credentials`           | `((variables: Variables) => CredentialPlan) \| undefined` | Optionnel | Planifie les credentials de cette CLI à partir des variables résolues du workflow, sans accès disque : variables à transmettre, fichiers hôte à copier dans le home privé de la sandbox, fichiers générés et commandes de connexion. Appelé une fois par adapter et par sandbox ; le provider local ne reçoit que les variables. |
| `request`               | `(input: AgentInput) => Command`                          | Requis    | Construit le programme, ses arguments et son environnement depuis l’entrée d’agent fournie.                                                                                                                                                                                                                                      |
| `events`                | `(line: string) => readonly AgentEvent[]`                 | Requis    | Décode une ligne de sortie du CLI natif en événements d’agent normalisés.                                                                                                                                                                                                                                                        |
| `name`                  | `string`                                                  | Requis    | Identifiant d’agent natif utilisé dans les événements et diagnostics.                                                                                                                                                                                                                                                            |
| `bootstrap`             | `string \| undefined`                                     | Optionnel | Nom de l’installeur intégré utilisé pour installer une CLI absente sur les providers distants lorsque le bootstrap est activé : un paquet npm épinglé pour claude, codex, copilot et kimi, ou une archive versionnée avec une empreinte SHA-512 épinglée pour antigravity.                                                       |
| `requiresFinishedEvent` | `boolean \| undefined`                                    | Optionnel | Exige l’événement natif finished avant de considérer le tour d’agent terminé.                                                                                                                                                                                                                                                    |
| `variables`             | `Readonly<Record<string, string>> \| undefined`           | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                                          |
| `conversations`         | `"codex" \| "claude" \| undefined`                        | Optionnel | Format natif de transcript utilisé en l’absence de stockage personnalisé.                                                                                                                                                                                                                                                        |
| `storage`               | `ConversationStore \| undefined`                          | Optionnel | Implémentation personnalisée de persistance des conversations de cet adapter.                                                                                                                                                                                                                                                    |
| `capture`               | `boolean \| undefined`                                    | Optionnel | Indique si l’adapter active la capture des transcripts natifs.                                                                                                                                                                                                                                                                   |
| `resumable`             | `boolean \| undefined`                                    | Optionnel | Indique si l’adapter prend en charge la continuation native des conversations.                                                                                                                                                                                                                                                   |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined`     | Optionnel | Analyse un transcript natif pour récupérer l’usage de tokens disponible.                                                                                                                                                                                                                                                         |

## Signature

```ts
export interface CliAgent extends AgentAdapter {
  readonly kind: "cli";
  readonly harness: CliHarness;
  readonly model?: AgentModel;
}
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [AgentModel](../agentmodel/)
- [CliHarness](../cliharness/)
