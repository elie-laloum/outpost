---
title: "createSteering"
description: "createSteering — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createSteering } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un contrôleur Steering inactif. Passez-le à un dispatch avec steering ; send() remet alors des consignes à l’agent en cours : injectées dans la boucle du harness intégré, l’entrée stream-json de Claude Code ou les tours app-server de Codex, sinon par arrêt et reprise de la conversation. Sa création ne démarre rien.

[Exemple complet et règles détaillées](../../guide/first-request/).

## Retour

`Steering`

## Signature

```ts
export declare function createSteering(): Steering;
```

## Contrats associés

- [Steering](../steering/)
