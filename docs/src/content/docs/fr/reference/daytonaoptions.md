---
title: "DaytonaOptions"
description: "DaytonaOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DaytonaOptions } from "@elie-laloum/outpost/providers/daytona";
```

## Paramètres et propriétés

| Nom          | Type                                                                           | Présence  | Rôle                                                                                                                                                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `egress`     | `EgressPolicy \| undefined`                                                    | Optionnel | Politique optionnelle deny-all, liste de domaines ou CIDR IPv4. Exige une confirmation serveur avant préparation du workspace ; un refus supprime la sandbox. Nécessite Tier 3/4 et WRITE_SANDBOXES. Refuse les options réseau natives, mélanges domaines/CIDR, denyCidrs et accès implicite à la racine par joker. |
| `connection` | `DaytonaConfig \| undefined`                                                   | Optionnel | Réglages de connexion du client SDK Daytona, distincts des options de création de sandbox.                                                                                                                                                                                                                          |
| `create`     | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined` | Optionnel | Réglages de création transmis au SDK. Le réseau natif sans egress suit le comportement Daytona du compte sans confirmation Outpost. Le code de démarrage de l’image doit être fiable : il peut s’exécuter avant la fin de l’acquisition.                                                                            |
| `variables`  | `Readonly<Record<string, string>> \| undefined`                                | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                             |
| `root`       | `string \| undefined`                                                          | Optionnel | Chemin du workspace de dépôt à l’intérieur de l’environnement d’exécution.                                                                                                                                                                                                                                          |
| `retain`     | `number \| undefined`                                                          | Optionnel | Taille maximale de la fin conservée par flux, en octets.                                                                                                                                                                                                                                                            |

## Signature

```ts
import type {
  CreateSandboxFromImageParams,
  CreateSandboxFromSnapshotParams,
  DaytonaConfig,
} from "@daytona/sdk";

export interface DaytonaOptions {
  readonly egress?: EgressPolicy;
  readonly connection?: DaytonaConfig;
  readonly create?:
    CreateSandboxFromImageParams | CreateSandboxFromSnapshotParams;
  readonly variables?: Variables;
  readonly root?: string;
  readonly retain?: number;
}
```

## Contrats associés

- [EgressPolicy](../egresspolicy/)
- [Variables](../variables/)
