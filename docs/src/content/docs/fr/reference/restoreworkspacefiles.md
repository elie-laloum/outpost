---
title: "restoreWorkspaceFiles"
description: "restoreWorkspaceFiles — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { restoreWorkspaceFiles } from "@elie-laloum/outpost";
```

## Rôle et comportement

Matérialise et vérifie un snapshot de fichiers conservé dans une destination exclusive ; conserve la compatibilité de lecture des archives existantes.

[Exemple complet et règles détaillées](../../guide/working-with-files/).

## Paramètres et propriétés

| Nom           | Type                 | Présence | Rôle                                                                                                                          |
| ------------- | -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport`          | Requis   | Transport fourni par le caller pour la conservation ; aucun chargement implicite de SDK cloud ou de credentials.              |
| `reference`   | `TransportReference` | Requis   | Clé et révision Transport identifiant l’objet conservé ; les révisions conditionnelles écartent les writers périmés.          |
| `destination` | `string`             | Requis   | Destination hôte conservant les chemins relatifs sélectionnés ; le chevauchement d’une source inscriptible active est refusé. |

## Retour

`Promise<void>`

## Signature

```ts
export declare function restoreWorkspaceFiles(
  transporter: Transport,
  reference: TransportReference,
  destination: string,
): Promise<void>;
```

## Contrats associés

- [Transport](../transport/)
- [TransportReference](../transportreference/)
