---
title: "verifyRecoveryTransfer"
description: "verifyRecoveryTransfer — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { verifyRecoveryTransfer } from "@elie-laloum/outpost";
```

## Rôle et comportement

Contrôle un dossier de transfert conservé : state.json, les trois patches, commits.bundle quand les commits ont changé et chaque fichier listé, puis en option la restauration Git et les empreintes. Les contrôles échoués figurent dans le résultat au lieu d’être levés ; rien n’est appliqué et l’auteur n’est pas authentifié. restorability sans repository ou un maxBytes invalide rejette avec le code configuration.

[Exemple complet et règles détaillées](../../guide/retention/).

## Paramètres et propriétés

| Nom                     | Type                                       | Présence  | Rôle                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`                  | `string`                                   | Requis    | Dossier de transfert conservé à vérifier ; un dossier absent rejette avec le code workspace.                                                                                                                                           |
| `options`               | `RecoveryVerificationOptions \| undefined` | Optionnel | Contrôles de restauration et d’empreintes, le dépôt qu’ils utilisent et la limite de hachage.                                                                                                                                          |
| `options.restorability` | `boolean \| undefined`                     | Optionnel | Clone repository dans un dossier temporaire et vérifie que les commits existent, que le bundle se décompresse et que les trois patches s’appliquent. S’exécute seulement si les contrôles de structure réussissent ; exige repository. |
| `options.repository`    | `string \| undefined`                      | Optionnel | Checkout Git cloné pour le contrôle de restauration ; un clone superficiel ou partiel, ou avec des alternates, fait échouer ce contrôle.                                                                                               |
| `options.checksums`     | `boolean \| undefined`                     | Optionnel | Calcule le SHA-256 de chaque fichier listé dans checksums.json et compare type, taille et empreinte. S’exécute seulement si les contrôles précédents réussissent.                                                                      |
| `options.maxBytes`      | `number \| undefined`                      | Optionnel | Nombre maximal d’octets hachés pour les empreintes, 1073741824 (1 Gio) par défaut. Le dépasser échoue avec CHECKSUM_LIMIT et laisse integrity à unverified.                                                                            |

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
