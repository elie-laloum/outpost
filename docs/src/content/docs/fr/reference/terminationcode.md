---
title: "TerminationCode"
description: "TerminationCode — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { TerminationCode } from "@elie-laloum/outpost";
```

## Rôle et comportement

Vocabulaire commun des motifs de terminaison des workflows et d’arrêt des coordinateurs de spéculation. Inclut FaultCode, failed pour une erreur non classée et usage-unavailable pour une comptabilité de budget incomplète. Chaque résultat décrit les codes applicables ; le dispatch continue de lever OutpostError avec son code existant. Un budget épuisé utilise limit, et non le statut de spéculation budget-exhausted.

[Exemple complet et règles détaillées](../../guide/error-handling/).

## Signature

```ts
export type TerminationCode = FaultCode | "failed" | "usage-unavailable";
```

## Contrats associés

- [FaultCode](../faultcode/)
