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

| Nom           | Type                     | Présence          | Rôle                                                                                                                                    |
| ------------- | ------------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `file`        | `string \| undefined`    | Selon la variante | Destination locale d’ajout JSONL, exclusive avec transporter ; absente par défaut pour créer un journal géré.                           |
| `transporter` | `Transport \| undefined` | Selon la variante | Conserve le journal sous forme de segments immuables et d’un index versionné. Exclusif avec file ; les résultats exposent logReference. |
| `verbose`     | `boolean \| undefined`   | Selon la variante | Inclut les observations brutes du protocole dans le journal du dispatch.                                                                |

## Signature

```ts
export type Logging =
  | false
  | "stdout"
  | {
      readonly file?: string;
      readonly transporter?: Transport;
      readonly verbose?: boolean;
    };
```

## Contrats associés

- [Transport](../transport/)
