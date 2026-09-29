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

Crée un contrôleur inactif à passer dans l’option steering d’un dispatch. Son send() remet des consignes à l’agent en cours : injectées dans le tour courant quand l’agent accepte une entrée en direct, sinon en arrêtant le tour puis en reprenant sa conversation. Un contrôleur sert un seul dispatch à la fois.

[Exemple complet et règles détaillées](../../guide/steering/).

## Retour

`Steering`

## Signature

```ts
export declare function createSteering(): Steering;
```

## Contrats associés

- [Steering](../steering/)
