---
title: "snapshotWorkspaceFiles"
description: "snapshotWorkspaceFiles — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { snapshotWorkspaceFiles } from "@elie-laloum/outpost";
```

## Rôle et comportement

Conserve une génération bornée vérifiée via Transport avec fichiers binaires, liens internes, permissions et répertoires vides.

[Exemple complet et règles détaillées](../../guide/working-with-files/).

## Paramètres et propriétés

| Nom           | Type        | Présence | Rôle                                                                                                             |
| ------------- | ----------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport` | Requis   | Transport fourni par le caller pour la conservation ; aucun chargement implicite de SDK cloud ou de credentials. |
| `root`        | `string`    | Requis   | Racine d’exécution dans la sandbox empruntée, distincte de son répertoire de contrôle hôte.                      |
| `prefix`      | `string`    | Requis   | Préfixe de clé Transport sous lequel sont écrites les générations d’archives immuables.                          |

## Retour

`Promise<TransportReference>`

## Signature

```ts
export declare function snapshotWorkspaceFiles(
  transporter: Transport,
  root: string,
  prefix: string,
): Promise<TransportReference>;
```

## Contrats associés

- [Transport](../transport/)
- [TransportReference](../transportreference/)
