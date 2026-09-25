---
title: "relocateTranscript"
description: "relocateTranscript — Outpost API"
sidebar:
  order: 0
---

Contrat auxiliaire non exporté directement ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Réécrit les chemins de dépôt des enregistrements d’un transcript natif du chemin source vers le chemin destination en conservant les données de conversation. Renvoie le texte réécrit sans lire ni écrire de fichier.

## Paramètres et propriétés

| Nom           | Type                  | Présence  | Rôle                                                                                  |
| ------------- | --------------------- | --------- | ------------------------------------------------------------------------------------- |
| `text`        | `string`              | Requis    | Contenu du transcript natif à réécrire.                                               |
| `destination` | `string`              | Requis    | Nouveau chemin de dépôt à inscrire dans les enregistrements du transcript relocalisé. |
| `source`      | `string \| undefined` | Optionnel | Chemin de dépôt d’origine à remplacer lors de la relocalisation du transcript.        |

## Retour

`string`

## Signature

```ts
export declare function relocateTranscript(
  text: string,
  destination: string,
  source?: string,
): string;
```
