---
title: "GeminiSettings"
description: "GeminiSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { GeminiSettings } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                                        | Présence  | Rôle                                                                                                                                             |
| ---------------- | ----------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `authentication` | `AgentAuthentication \| undefined`                          | Optionnel | Préparation explicite de l’authentification de ce harness CLI. Son absence conserve l’accès déjà configuré sans rechercher des credentials hôte. |
| `variables`      | `Readonly<Record<string, string>> \| undefined`             | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                          |
| `approvalMode`   | `"default" \| "plan" \| "auto_edit" \| "yolo" \| undefined` | Optionnel | Mode d’approbation des outils du CLI Gemini.                                                                                                     |

## Signature

```ts
export interface GeminiSettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly approvalMode?: "default" | "auto_edit" | "yolo" | "plan";
}
```

## Contrats associés

- [AgentAuthentication](../agentauthentication/)
- [Variables](../variables/)
