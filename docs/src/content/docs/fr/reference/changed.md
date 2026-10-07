---
title: "changed"
description: "changed — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { changed } from "@elie-laloum/outpost";
```

## Rôle et comportement

Déclare une condition de cycle de vie immuable sur des chemins relatifs exacts, sans lire les fichiers. La première préparation s’exécute ; une sandbox réutilisée rejoue la commande avant l’opération suivante seulement si le contenu ou l’existence diffère de la dernière préparation réussie. Les empreintes appartiennent à chaque hook et sandbox et ne sont jamais partagées avec une nouvelle sandbox.

[Exemple complet et règles détaillées](../../guide/environment-setup/).

## Paramètres et propriétés

| Nom     | Type                | Présence | Rôle                                                                                                                                                                                                                                                   |
| ------- | ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `files` | `readonly string[]` | Requis   | Liste non vide et unique de chemins relatifs exacts, résolus depuis le répertoire du hook ; refuse chemins absolus, antislashs, segments vides et traversée. Le contenu, la création et la suppression participent à l’empreinte, pas les horodatages. |

## Retour

`ChangedCondition`

## Signature

```ts
export declare function changed(files: readonly string[]): ChangedCondition;
```

## Contrats associés

- [ChangedCondition](../changedcondition/)
