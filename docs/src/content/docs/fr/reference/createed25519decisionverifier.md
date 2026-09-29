---
title: "createEd25519DecisionVerifier"
description: "createEd25519DecisionVerifier — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createEd25519DecisionVerifier } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un WorkflowDecisionVerifier qui charge les clés de confiance à chaque appel, puis vérifie la clé de la preuve, son acteur associé, la signature Ed25519 et l’expiration. Renvoie keyId et verifiedAt ; lève une erreur pour une clé inconnue, dupliquée ou liée à un autre acteur, une signature invalide ou une preuve expirée.

[Exemple complet et règles détaillées](../../guide/approvals/).

## Paramètres et propriétés

| Nom            | Type                                                                              | Présence | Rôle                                                                                                                                                        |
| -------------- | --------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`      | `WorkflowDecisionVerifierOptions`                                                 | Requis   | Source actualisable des clés publiques de confiance appartenant à l’application.                                                                            |
| `options.keys` | `() => readonly WorkflowApproverKey[] \| Promise<readonly WorkflowApproverKey[]>` | Requis   | Résout les associations acteur/clé publique à chaque vérification. Retirer une clé révoque les nouvelles preuves ; une erreur de source refuse la décision. |

## Retour

`WorkflowDecisionVerifier`

## Signature

```ts
export declare function createEd25519DecisionVerifier(
  options: WorkflowDecisionVerifierOptions,
): WorkflowDecisionVerifier;
```

## Contrats associés

- [WorkflowDecisionVerifier](../workflowdecisionverifier/)
- [WorkflowDecisionVerifierOptions](../workflowdecisionverifieroptions/)
