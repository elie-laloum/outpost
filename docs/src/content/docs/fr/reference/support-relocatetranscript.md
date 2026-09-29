---
title: "relocateTranscript"
description: "relocateTranscript — Outpost API"
sidebar:
  order: 0
---

Contrat auxiliaire non exporté directement ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Renvoie le texte du transcript où chaque valeur cwd égale à source devient destination ; sans source, le premier cwd enregistré dans le texte est remplacé. Les lignes qui ne sont pas du JSON restent inchangées, et aucun fichier n’est lu ni écrit.

## Paramètres et propriétés

| Nom           | Type                  | Présence  | Rôle                                                                                  |
| ------------- | --------------------- | --------- | ------------------------------------------------------------------------------------- |
| `text`        | `string`              | Requis    | Contenu du transcript natif à réécrire.                                               |
| `destination` | `string`              | Requis    | Chemin écrit à la place de chaque valeur cwd correspondante.                          |
| `source`      | `string \| undefined` | Optionnel | Valeur cwd enregistrée à remplacer ; par défaut, le premier cwd enregistré dans text. |

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
