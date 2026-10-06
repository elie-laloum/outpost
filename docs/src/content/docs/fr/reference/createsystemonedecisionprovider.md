---
title: "createSystemOneDecisionProvider"
description: "createSystemOneDecisionProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createSystemOneDecisionProvider } from "@elie-laloum/outpost";
```

## Rôle et comportement

Construire un provider HTTP System One borné commun à Jev et aux endpoints Laya compatibles. Ajouter /systemone à l’URL de base, utiliser une authentification bearer explicite ou false, conserver les extensions JSON natives et ne faire aucune nouvelle tentative interne.

[Exemple complet et règles détaillées](../../guide/decisions/).

## Paramètres et propriétés

| Nom                        | Type                               | Présence  | Rôle                                                                                                                                   |
| -------------------------- | ---------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `SystemOneDecisionProviderOptions` | Requis    | Endpoint HTTP, authentification explicite et limites de requête pour le protocole System One.                                          |
| `options.baseUrl`          | `string`                           | Requis    | URL de base HTTP(S) incluant le préfixe de version, comme /v1 ; /systemone est ajouté. Identifiants, query et fragment sont interdits. |
| `options.apiKey`           | `string \| false`                  | Requis    | Clé bearer explicite non vide, ou false pour un endpoint sans authentification.                                                        |
| `options.timeoutMs`        | `number \| undefined`              | Optionnel | Délai de requête incluant la lecture de réponse, en millisecondes entières positives ; 120000 par défaut.                              |
| `options.maxResponseBytes` | `number \| undefined`              | Optionnel | Limite entière positive de taille de réponse ; 8 MiB par défaut. Une réponse trop grande échoue avec response.                         |

## Retour

`DecisionProvider`

## Signature

```ts
export declare function createSystemOneDecisionProvider(
  options: SystemOneDecisionProviderOptions,
): DecisionProvider;
```

## Contrats associés

- [DecisionProvider](../decisionprovider/)
- [SystemOneDecisionProviderOptions](../systemonedecisionprovideroptions/)
