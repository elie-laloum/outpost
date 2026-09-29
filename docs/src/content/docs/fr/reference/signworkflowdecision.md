---
title: "signWorkflowDecision"
description: "signWorkflowDecision — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { signWorkflowDecision } from "@elie-laloum/outpost";
```

## Rôle et comportement

Signe une décision exacte avec une clé privée Ed25519 appartenant à l’application. Renvoie une décision immuable avec une preuve expirante ; ne soumet pas la décision et ne stocke pas la clé.

[Exemple complet et règles détaillées](../../guide/approvals/).

## Paramètres et propriétés

| Nom                  | Type                              | Présence | Rôle                                                                                                     |
| -------------------- | --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `options`            | `WorkflowDecisionSigningOptions`  | Requis   | Décision exacte, clé privée Ed25519, identifiant de clé et expiration future à signer.                   |
| `options.decision`   | `Omit<WorkflowDecision, "proof">` | Requis   | Exécution, demande en attente, tâche, acteur, action et motif exacts à signer, sans preuve préexistante. |
| `options.keyId`      | `string`                          | Requis   | Identifiant unique de la clé publique de confiance correspondante ; inclus dans le contenu signé.        |
| `options.privateKey` | `KeyObject`                       | Requis   | KeyObject privé Ed25519 appartenant à l’application ; jamais persisté par Outpost.                       |
| `options.expiresAt`  | `string`                          | Requis   | Date d’expiration future interprétable par Date.parse ; la chaîne exacte est signée.                     |

## Retour

`WorkflowDecision`

## Signature

```ts
export declare function signWorkflowDecision(
  options: WorkflowDecisionSigningOptions,
): WorkflowDecision;
```

## Contrats associés

- [WorkflowDecision](../workflowdecision/)
- [WorkflowDecisionSigningOptions](../workflowdecisionsigningoptions/)
