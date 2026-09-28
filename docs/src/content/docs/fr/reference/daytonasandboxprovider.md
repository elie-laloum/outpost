---
title: "daytonaSandboxProvider"
description: "daytonaSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { daytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";
```

## Rôle et comportement

Crée un provider distant Daytona avec réglages distincts de connexion SDK et de création de sandbox. Les transferts utilisent l’environnement distant acquis et la synchronisation valide les modifications hôtes concurrentes avant application. La politique egress optionnelle est validée avant allocation et confirmée par l’API réseau du serveur avant préparation du workspace ; un échec déclenche la suppression. Le démarrage natif de l’image précède cette confirmation. Consultez les [règles sortantes](../../guide/outbound-rules/).

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom                  | Type                                                                                      | Présence  | Rôle                                                                                                                                                                                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `DaytonaOptions \| undefined`                                                             | Optionnel | Réglages de connexion Daytona, création de sandbox, racine du workspace, environnement et conservation des sorties.                                                                                                                                                                                                 |
| `options.egress`     | `EgressPolicy \| undefined`                                                               | Optionnel | Politique optionnelle deny-all, liste de domaines ou CIDR IPv4. Exige une confirmation serveur avant préparation du workspace ; un refus supprime la sandbox. Nécessite Tier 3/4 et WRITE_SANDBOXES. Refuse les options réseau natives, mélanges domaines/CIDR, denyCidrs et accès implicite à la racine par joker. |
| `options.connection` | `DaytonaConfig \| undefined`                                                              | Optionnel | Réglages de connexion du client SDK Daytona, distincts des options de création de sandbox.                                                                                                                                                                                                                          |
| `options.create`     | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined`            | Optionnel | Réglages de création transmis au SDK. Le réseau natif sans egress suit le comportement Daytona du compte sans confirmation Outpost. Le code de démarrage de l’image doit être fiable : il peut s’exécuter avant la fin de l’acquisition.                                                                            |
| `options.variables`  | `Readonly<Record<string, string>> \| undefined`                                           | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                             |
| `options.root`       | `string \| undefined`                                                                     | Optionnel | Chemin du workspace de dépôt à l’intérieur de l’environnement d’exécution.                                                                                                                                                                                                                                          |
| `options.retain`     | `number \| undefined`                                                                     | Optionnel | Taille maximale de la fin conservée par flux, en octets.                                                                                                                                                                                                                                                            |
| `connect`            | `((config?: DaytonaConfig) => Promise<Pick<Daytona, "create" \| "delete">>) \| undefined` | Optionnel | Fabrique injectée renvoyant un client Daytona avec méthodes create/delete pour le cycle de vie des sandboxes.                                                                                                                                                                                                       |

## Retour

`SandboxProvider`

## Signature

```ts
import type { Daytona, DaytonaConfig } from "@daytona/sdk";

export declare function daytonaSandboxProvider(
  options?: DaytonaOptions,
  connect?: (
    config?: DaytonaConfig,
  ) => Promise<Pick<Daytona, "create" | "delete">>,
): SandboxProvider;
```

## Contrats associés

- [DaytonaOptions](../daytonaoptions/)
- [SandboxProvider](../sandboxprovider/)
