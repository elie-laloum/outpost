---
title: "StageLimits"
description: "StageLimits — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StageLimits } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                  | Présence  | Rôle                                                                                                                                                                                               |
| ----------- | --------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `copyMs`    | `number \| undefined` | Optionnel | Délai de copie de copies dans le worktree, 60000 par défaut. Fixé sur createSandbox() ou dispatch(), il borne aussi chaque envoi et téléchargement de la sandbox, 120000 par défaut.               |
| `gitMs`     | `number \| undefined` | Optionnel | Délai de chaque commande Git qui localise le dépôt, crée le worktree ou rafraîchit un worktree réutilisé, 30000 par défaut. Les sandboxes distantes l’appliquent aussi à leur synchronisation Git. |
| `collectMs` | `number \| undefined` | Optionnel | Délai de listage des commits produits par un dispatch ou un attach, 30000 par défaut. Lu dans les options de la sandbox : il n’a aucun effet sur openWorkspace().                                  |
| `mergeMs`   | `number \| undefined` | Optionnel | Délai du git merge lancé par integrate(), 30000 par défaut. Un dépassement échoue avec le code conflict, comme tout échec de fusion.                                                               |

## Signature

```ts
export interface StageLimits {
  readonly copyMs?: number;
  readonly gitMs?: number;
  readonly collectMs?: number;
  readonly mergeMs?: number;
}
```
