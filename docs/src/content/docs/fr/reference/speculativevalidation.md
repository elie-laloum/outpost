---
title: "SpeculativeValidation"
description: "SpeculativeValidation — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Fait partie de l’API expérimentale de spéculation : ce contrat peut encore changer. Consultez [Candidats concurrents](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculativeValidation } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                   | Présence | Rôle                                                                                                                                                        |
| --------- | ---------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`     | `string`               | Requis   | Clé du candidat en cours de validation.                                                                                                                     |
| `result`  | `SpeculativeOutput<T>` | Requis   | Sortie de dispatch du candidat : texte, valeur, commits et usage.                                                                                           |
| `sandbox` | `Sandbox`              | Requis   | Sandbox du candidat, encore ouverte ; elle se ferme après le retour de validate. Les commits créés pendant la validation font partie du commit du candidat. |
| `signal`  | `AbortSignal`          | Requis   | S’annule quand un autre candidat gagne, qu’une limite de tokens est atteinte ou que la course est annulée ; passez-le à chaque commande.                    |

## Signature

```ts
export interface SpeculativeValidation<T> {
  readonly key: string;
  readonly result: SpeculativeOutput<T>;
  readonly sandbox: Sandbox;
  readonly signal: AbortSignal;
}
```

## Contrats associés

- [Sandbox](../sandbox/)
- [SpeculativeOutput](../speculativeoutput/)
