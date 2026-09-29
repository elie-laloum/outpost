---
title: "Variables"
description: "Variables — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Variables } from "@elie-laloum/outpost";
```

## Rôle et comportement

Variables d’environnement sous forme de chaînes nom-valeur, utilisées pour Command.variables, les variables de sandbox et les variables d’agent. Un agent et son provider de sandbox ne doivent pas déclarer la même variable ; ce chevauchement échoue avec le code configuration.

[Exemple complet et règles détaillées](../../guide/environment-variables/).

## Signature

```ts
export type Variables = Readonly<Record<string, string>>;
```
