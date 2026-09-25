---
title: "projectKey"
description: "projectKey — Outpost API"
sidebar:
  order: 0
---

Contrat auxiliaire non exporté directement ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Convertit un chemin de dépôt en clé de dossier pour l’organisation native des transcripts de projet Claude. Cet utilitaire de chemins ne produit pas un identifiant de conversation.

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
