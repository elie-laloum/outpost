---
title: "AgentTaskOptions"
description: "AgentTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom           | Type                                           | Présence  | Rôle                                                                                                                                                                                                                                                                                             |
| ------------- | ---------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sandbox`     | `Sandbox`                                      | Requis    | Sandbox existante appartenant à l’appelant et réutilisée par la tâche ; la tâche ne la ferme pas.                                                                                                                                                                                                |
| `request`     | `(context: TaskContext) => DispatchOptions<T>` | Requis    | Construit les options de dispatch depuis les dépendances pour la sandbox existante.                                                                                                                                                                                                              |
| `quotaResume` | `QuotaResumePolicy \| undefined`               | Optionnel | Après une pause sur quota, poursuit la conversation capturée avec une consigne de reprise (continue, par défaut) ou renvoie la requête d’origine (restart). La poursuite est ignorée si l’agent ne peut pas reprendre, si la requête fournit sa propre continuation ou utilise plusieurs passes. |

## Signature

```ts
export type AgentTaskOptions<T> = {
  sandbox: Sandbox;
  request: (context: TaskContext) => DispatchOptions<T>;
  /** After a quota pause, continue the captured conversation or start a new one. */
  quotaResume?: QuotaResumePolicy;
};
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
- [QuotaResumePolicy](../quotaresumepolicy/)
- [Sandbox](../sandbox/)
- [TaskContext](../taskcontext/)
