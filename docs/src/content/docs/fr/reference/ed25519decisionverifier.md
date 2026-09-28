---
title: "ed25519DecisionVerifier"
description: "ed25519DecisionVerifier — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { ed25519DecisionVerifier } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un vérificateur qui résout les clés de confiance à chaque décision, vérifie la signature Ed25519, l’acteur associé et l’expiration, puis renvoie les métadonnées d’audit. Les identifiants de clé absents, dupliqués ou révoqués sont refusés.

[Exemple complet et règles détaillées](../../guide/advanced/approvals/).

## Paramètres et propriétés

| Nom            | Type                                                                              | Présence | Rôle                                                                                                                                                        |
| -------------- | --------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`      | `WorkflowDecisionVerifierOptions`                                                 | Requis   | Source actualisable des clés publiques de confiance appartenant à l’application.                                                                            |
| `options.keys` | `() => readonly WorkflowApproverKey[] \| Promise<readonly WorkflowApproverKey[]>` | Requis   | Résout les associations acteur/clé publique à chaque vérification. Retirer une clé révoque les nouvelles preuves ; une erreur de source refuse la décision. |

## Retour

`WorkflowDecisionVerifier`

## Signature

```ts
export declare function ed25519DecisionVerifier(
  options: WorkflowDecisionVerifierOptions,
): WorkflowDecisionVerifier;
```

## Contrats associés

- [WorkflowDecisionVerifier](../workflowdecisionverifier/)
- [WorkflowDecisionVerifierOptions](../workflowdecisionverifieroptions/)
