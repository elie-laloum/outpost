---
title: "AgentAdapter"
description: "AgentAdapter — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentAdapter } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                     | Type                                                  | Présence  | Rôle                                                                                        |
| ----------------------- | ----------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| `name`                  | `string`                                              | Requis    | Identifiant d’agent natif utilisé dans les événements et diagnostics.                       |
| `bootstrap`             | `string \| undefined`                                 | Optionnel | Recette shell installant le CLI natif lorsque le bootstrap est activé.                      |
| `requiresFinishedEvent` | `boolean \| undefined`                                | Optionnel | Exige l’événement natif finished avant de considérer le tour d’agent terminé.               |
| `variables`             | `Readonly<Record<string, string>> \| undefined`       | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                     |
| `conversations`         | `"codex" \| "claude" \| undefined`                    | Optionnel | Format natif de transcript utilisé en l’absence de stockage personnalisé.                   |
| `storage`               | `ConversationStore \| undefined`                      | Optionnel | Implémentation personnalisée de persistance des conversations de cet adapter.               |
| `capture`               | `boolean \| undefined`                                | Optionnel | Indique si l’adapter active la capture des transcripts natifs.                              |
| `resumable`             | `boolean \| undefined`                                | Optionnel | Indique si l’adapter prend en charge la continuation native des conversations.              |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined` | Optionnel | Analyse un transcript natif pour récupérer l’usage de tokens disponible.                    |
| `request`               | `(input: AgentInput) => Command`                      | Requis    | Construit le programme, ses arguments et son environnement depuis l’entrée d’agent fournie. |
| `events`                | `(line: string) => readonly AgentEvent[]`             | Requis    | Décode une ligne de sortie du CLI natif en événements d’agent normalisés.                   |

## Signature

```ts
export interface AgentAdapter {
  readonly name: string;
  readonly bootstrap?: string;
  readonly requiresFinishedEvent?: boolean;
  readonly variables?: Variables;
  readonly conversations?: "claude" | "codex";
  readonly storage?: ConversationStore;
  readonly capture?: boolean;
  readonly resumable?: boolean;
  transcriptUsage?(text: string): Usage | undefined;
  request(input: AgentInput): Command;
  events(line: string): readonly AgentEvent[];
}
```

## Contrats associés

- [AgentEvent](../agentevent/)
- [AgentInput](../agentinput/)
- [Command](../command/)
- [ConversationStore](../conversationstore/)
- [Usage](../usage/)
- [Variables](../variables/)
