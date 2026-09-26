---
title: "HarnessLimits"
description: "HarnessLimits — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
:::

## Import

```ts
import type { HarnessLimits } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                          | Présence  | Rôle                                                                                                                                                                                        |
| -------------- | ----------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxSteps`     | `number \| undefined`         | Optionnel | Nombre maximal de requêtes au modèle dans une passe ; 100 par défaut.                                                                                                                       |
| `maxToolCalls` | `number \| undefined`         | Optionnel | Nombre maximal d’appels d’outils dans une passe ; seulement borné par maxSteps s’il est omis.                                                                                               |
| `usage`        | `Partial<Usage> \| undefined` | Optionnel | Budget de tokens par compteur (input, cached, cacheCreated, output), vérifié avant chaque nouvelle requête. Exige un fournisseur qui rapporte l’usage ; la dernière étape peut le dépasser. |

## Signature

```ts
export interface HarnessLimits {
  readonly maxSteps?: number;
  readonly maxToolCalls?: number;
  readonly usage?: Partial<Usage>;
}
```

## Contrats associés

- [Usage](../usage/)
