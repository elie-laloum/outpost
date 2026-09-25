---
title: "WorkspaceGitState"
description: "WorkspaceGitState — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom     | Type                                                           | Présence | Rôle                                                                             |
| ------- | -------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `state` | `"skipped" \| "registered" \| "unregistered" \| "unavailable"` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export type WorkspaceGitState =
  | {
      readonly state: "registered";
      readonly head: string;
      readonly branch: string | null;
      readonly dirty: boolean;
      readonly locked: boolean;
    }
  | {
      readonly state: "unregistered";
    }
  | {
      readonly state: "skipped" | "unavailable";
      readonly reason: string;
    };
```
