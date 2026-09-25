---
title: "AgentAdapter"
description: "AgentAdapter — Outpost API"
sidebar:
  order: 10
---

Contrat public de **AgentAdapter**. Consultez le [guide agents](../../guide/agents/adapters/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { AgentAdapter } from "@elie-laloum/outpost";
```

## Rôle et comportement

Configurer Claude Code, Codex ou Gemini indépendamment du backend de sandbox.

La CLI choisit son modèle si omis. La capture native est activée par défaut pour Claude/Codex. Gemini ne prend en charge que les nouvelles sessions. Identifiants d’agent et de provider sont distincts.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom                     | Type                                                  | Présence  | Rôle                                                                             |
| ----------------------- | ----------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `name`                  | `string`                                              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `bootstrap`             | `string \| undefined`                                 | Optionnel | Indique si un agent sélectionné absent peut être installé automatiquement.       |
| `requiresFinishedEvent` | `boolean \| undefined`                                | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `variables`             | `Readonly<Record<string, string>> \| undefined`       | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.          |
| `conversations`         | `"claude" \| "codex" \| undefined`                    | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `storage`               | `ConversationStore \| undefined`                      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `capture`               | `boolean \| undefined`                                | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `resumable`             | `boolean \| undefined`                                | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `request`               | `(input: AgentInput) => Command`                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `events`                | `(line: string) => readonly AgentEvent[]`             | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
