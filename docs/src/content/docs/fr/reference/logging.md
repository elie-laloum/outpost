---
title: "Logging"
description: "Logging — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Logging } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom           | Type                     | Présence          | Rôle                                                                                                                                                                         |
| ------------- | ------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport \| undefined` | Selon la variante | Conserve des segments immuables et un index versionné via ce transport. Par défaut : localTransport dans <repository>/.outpost/storage ; lire logReference avec readJournal. |
| `verbose`     | `boolean \| undefined`   | Selon la variante | Inclut les observations brutes du protocole dans le journal du dispatch.                                                                                                     |

## Signature

```ts
export type Logging =
  | false
  | "stdout"
  | {
      readonly transporter?: Transport;
      readonly verbose?: boolean;
    };
```

## Contrats associés

- [Transport](../transport/)
