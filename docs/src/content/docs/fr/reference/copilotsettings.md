---
title: "CopilotSettings"
description: "CopilotSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CopilotSettings } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                  |
| ---------------- | ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authentication` | `AgentAuthentication \| undefined`              | Optionnel | Authentification explicite de ce harness CLI : "account", "usage", { account: { file \| key \| variable } } ou { usage: { key \| variable } }. Les formes non prises en charge échouent à la composition de l’agent. Son absence ne prépare rien et conserve l’accès déjà configuré dans l’environnement d’exécution. |
| `variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                               |
| `conversations`  | `ConversationStore \| undefined`                | Optionnel | Store qui capture, localise et restaure les bundles de session Copilot au lieu du store natif par défaut, par exemple transportConversations("copilot", …). Un store qui déclare un autre format est refusé dès la création du harness.                                                                               |

## Signature

```ts
export interface CopilotSettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly conversations?: ConversationStore;
}
```

## Contrats associés

- [AgentAuthentication](../agentauthentication/)
- [ConversationStore](../conversationstore/)
- [Variables](../variables/)
