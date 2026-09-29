---
title: "createSessionBundleConversations"
description: "createSessionBundleConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createSessionBundleConversations } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un ConversationStore natif pour une CLI qui conserve chaque session dans un dossier, décrite par un SessionBundleProfile. Un script Node.js exécuté dans la sandbox regroupe les fichiers sélectionnés en un bundle JSON limité à 64 Mio et 4 096 fichiers, refuse les liens symboliques et les fichiers modifiés pendant la capture, et restaure via un staging avec sauvegarde .outpost-recovery. Les hooks du profil sont sérialisés et doivent être des expressions de fonction autonomes ; une méthode ou une expression régulière avec l’option g ou y est refusée à la création du store.

[Exemple complet et règles détaillées](../../guide/conversations/).

## Paramètres et propriétés

| Nom              | Type                   | Présence | Rôle                                                                                          |
| ---------------- | ---------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `sessionProfile` | `SessionBundleProfile` | Requis   | Organisation des dossiers de session, sélection des fichiers et hooks côté sandbox de la CLI. |

## Retour

`NativeConversationStore`

## Signature

```ts
export declare function createSessionBundleConversations(
  sessionProfile: SessionBundleProfile,
): NativeConversationStore;
```

## Contrats associés

- [NativeConversationStore](../nativeconversationstore/)
- [SessionBundleProfile](../sessionbundleprofile/)
