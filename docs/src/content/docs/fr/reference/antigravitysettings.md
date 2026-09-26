---
title: "AntigravitySettings"
description: "AntigravitySettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AntigravitySettings } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                  |
| ---------------- | ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authentication` | `AgentAuthentication \| undefined`              | Optionnel | Authentification explicite de ce harness CLI : "account", "usage", { account: { file \| key \| variable } } ou { usage: { key \| variable } }. Les formes non prises en charge échouent à la composition de l’agent. Son absence ne prépare rien et conserve l’accès déjà configuré dans l’environnement d’exécution. |
| `variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                               |
| `mode`           | `"accept-edits" \| "plan" \| undefined`         | Optionnel | Mode d’exécution Antigravity transmis avec --mode. Sans lui, les exécutions non interactives passent --dangerously-skip-permissions ; les sessions interactives conservent les demandes d’approbation de la CLI.                                                                                                      |

## Signature

```ts
export interface AntigravitySettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly mode?: "accept-edits" | "plan";
}
```

## Contrats associés

- [AgentAuthentication](../agentauthentication/)
- [Variables](../variables/)
