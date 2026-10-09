---
title: "inspectWorkspacePublication"
description: "inspectWorkspacePublication — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { inspectWorkspacePublication } from "@elie-laloum/outpost";
```

## Rôle et comportement

Lit et valide un journal de publication versionné à sa révision Transport exacte sans modifier les fichiers.

[Exemple complet et règles détaillées](../../guide/workspaces/).

## Paramètres et propriétés

| Nom           | Type                 | Présence | Rôle                                                                                                                 |
| ------------- | -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport`          | Requis   | Transport fourni par le caller pour la conservation ; aucun chargement implicite de SDK cloud ou de credentials.     |
| `reference`   | `TransportReference` | Requis   | Clé et révision Transport identifiant l’objet conservé ; les révisions conditionnelles écartent les writers périmés. |

## Retour

`Promise<PublicationJournal>`

## Signature

```ts
export declare function inspectWorkspacePublication(
  transporter: Transport,
  reference: TransportReference,
): Promise<PublicationJournal>;
```

## Contrats associés

- [PublicationJournal](../publicationjournal/)
- [Transport](../transport/)
- [TransportReference](../transportreference/)
