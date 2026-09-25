---
title: "verifyRecoveryTransfer"
description: "verifyRecoveryTransfer — Outpost API"
sidebar:
  order: 10
---

Contrat public de **verifyRecoveryTransfer**. Consultez le [guide récupération et rétention](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { verifyRecoveryTransfer } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom                     | Type                                       | Présence  | Rôle                                                                                          |
| ----------------------- | ------------------------------------------ | --------- | --------------------------------------------------------------------------------------------- |
| `path`                  | `string`                                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options`               | `RecoveryVerificationOptions \| undefined` | Optionnel | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.restorability` | `boolean \| undefined`                     | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.repository`    | `string \| undefined`                      | Optionnel | Checkout Git hôte ciblé.                                                                      |
| `options.checksums`     | `boolean \| undefined`                     | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.maxBytes`      | `number \| undefined`                      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

## Retour

`Promise<RecoveryVerification>`

## Signature

```ts
export declare function verifyRecoveryTransfer(
  path: string,
  options?: RecoveryVerificationOptions,
): Promise<RecoveryVerification>;
```

## Contrats associés

- [RecoveryVerification](../recoveryverification/)
- [RecoveryVerificationOptions](../recoveryverificationoptions/)
