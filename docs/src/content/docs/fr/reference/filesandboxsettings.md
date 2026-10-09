---
title: "FileSandboxSettings"
description: "FileSandboxSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileSandboxSettings } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                 | Type                                                      | Présence  | Rôle                                                                                                                               |
| ------------------- | --------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `hooks`             | `LifecycleHooks \| undefined`                             | Optionnel | Commandes de préparation déclarées workspaceReady, hostReady et sandboxReady.                                                      |
| `limits`            | `Pick<StageLimits, "copyMs" \| "collectMs"> \| undefined` | Optionnel | Délais de copie et de collecte pour l’exécution de fichiers ; les délais de préparation Git et d’intégration sont refusés.         |
| `observation`       | `ObservationHub \| undefined`                             | Optionnel | Hub d’observation explicite conservant la livraison contextualisée et la comptabilité synchrone d’usage.                           |
| `logging`           | `Logging \| undefined`                                    | Optionnel | Journal d’exécution déclaré ; les effets de fichiers replayables sont refusés lorsque leur reproduction n’est pas prise en charge. |
| `activityTransport` | `Transport \| undefined`                                  | Optionnel | Transport des observations bornées d’activité de ressource ; la vivacité n’autorise pas la récupération.                           |
| `recoveryTransport` | `Transport \| undefined`                                  | Optionnel | Transport explicite conservant les preuves de récupération de sandbox indépendamment des snapshots de fichiers.                    |
| `sandboxProvider`   | `SandboxProvider`                                         | Requis    | Provider d’exécution disposant de la capacité de liaison de fichiers requise ; les providers legacy restent utilisables pour Git.  |
| `agent`             | `DispatchAgent \| undefined`                              | Optionnel | Agent explicitement composé compatible avec les capacités d’exécution de fichiers et de conversation sélectionnées.                |
| `signal`            | `AbortSignal \| undefined`                                | Optionnel | Signal d’annulation transmis à l’opération et à son groupe de processus ; les sandboxes réutilisables restent utilisables.         |
| `variables`         | `Readonly<Record<string, string>> \| undefined`           | Optionnel | Seules les variables d’environnement explicitement déclarées atteignent la sandbox ; aucun chargement implicite de .env.           |

## Signature

```ts
export interface FileSandboxSettings {
  readonly hooks?: LifecycleHooks;
  readonly limits?: Pick<StageLimits, "copyMs" | "collectMs">;
  readonly observation?: ObservationHub;
  readonly logging?: Logging;
  readonly activityTransport?: Transport;
  readonly recoveryTransport?: Transport;
  readonly sandboxProvider: SandboxProvider;
  readonly agent?: DispatchAgent;
  readonly signal?: AbortSignal;
  readonly variables?: Variables;
}
```

## Contrats associés

- [DispatchAgent](../dispatchagent/)
- [SandboxProvider](../sandboxprovider/)
- [Variables](../variables/)
