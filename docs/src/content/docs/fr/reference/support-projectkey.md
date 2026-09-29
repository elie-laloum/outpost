---
title: "projectKey"
description: "projectKey — Outpost API"
sidebar:
  order: 0
---

Contrat auxiliaire non exporté directement ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Renvoie le nom du dossier de projet de Claude pour un chemin de dépôt, utilisé sous ~/.claude/projects : chaque caractère autre qu’une lettre ASCII ou un chiffre devient -.

## Paramètres et propriétés

| Nom    | Type     | Présence | Rôle                                                                                |
| ------ | -------- | -------- | ----------------------------------------------------------------------------------- |
| `path` | `string` | Requis   | Chemin de dépôt à encoder pour l’organisation des dossiers de projet natifs Claude. |

## Retour

`string`

## Signature

```ts
export declare function projectKey(path: string): string;
```
