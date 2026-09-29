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

Crée un NativeConversationStore pour une CLI qui conserve chaque session dans un dossier, décrite par sessionProfile. Un script Node.js dans la sandbox regroupe les fichiers sélectionnés en un bundle JSON d’au plus 64 Mio et 4096 fichiers, refuse les liens symboliques et les fichiers modifiés pendant la capture, et à la restauration déplace une session existante vers .outpost-recovery. Les échecs du script utilisent le code session ; un profil invalide, par exemple un hook écrit comme méthode ou une expression régulière avec l’option g ou y, échoue avec le code configuration à la création.

[Exemple complet et règles détaillées](../../guide/conversation-formats/).

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
