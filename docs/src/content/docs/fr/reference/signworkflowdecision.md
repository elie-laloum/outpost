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

Signe une décision exacte avec une clé privée Ed25519 appartenant à l’application et renvoie une copie figée portant sa preuve. Ne soumet pas la décision et ne stocke pas la clé. Lève une erreur pour une clé non Ed25519, un champ de décision ou un identifiant de clé vide, ou un expiresAt qui n’est pas dans le futur.

[Exemple complet et règles détaillées](../../guide/approvals/).

## Paramètres et propriétés

| Nom                  | Type                              | Présence | Rôle                                                                                                                                               |
| -------------------- | --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `WorkflowDecisionSigningOptions`  | Requis   | Décision exacte, clé privée Ed25519, identifiant de clé et expiration future à signer.                                                             |
| `options.decision`   | `Omit<WorkflowDecision, "proof">` | Requis   | Exécution, demande en attente, tâche, acteur, action et motif exacts à signer, sans preuve préexistante.                                           |
| `options.keyId`      | `string`                          | Requis   | Identifiant de la clé publique de confiance correspondante, non vide et d’au plus 512 caractères ; signé avec la décision et copié dans la preuve. |
| `options.privateKey` | `KeyObject`                       | Requis   | KeyObject privé Ed25519 appartenant à votre application ; tout autre type de clé lève une erreur. Outpost ne le stocke jamais.                     |
| `options.expiresAt`  | `string`                          | Requis   | Expiration de la preuve, interprétable par Date.parse et postérieure à maintenant ; la chaîne exacte est signée.                                   |

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
