---
title: "FileIsolatedCommandRequest"
description: "FileIsolatedCommandRequest — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { FileIsolatedCommandRequest } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom                 | Type                                                      | Présence          | Rôle                                                                                                                               |
| ------------------- | --------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `hooks`             | `LifecycleHooks \| undefined`                             | Optionnel         | Commandes de préparation déclarées workspaceReady, hostReady et sandboxReady.                                                      |
| `limits`            | `Pick<StageLimits, "copyMs" \| "collectMs"> \| undefined` | Optionnel         | Délais de copie et de collecte pour l’exécution de fichiers ; les délais de préparation Git et d’intégration sont refusés.         |
| `observation`       | `ObservationHub \| undefined`                             | Optionnel         | Hub d’observation explicite conservant la livraison contextualisée et la comptabilité synchrone d’usage.                           |
| `logging`           | `Logging \| undefined`                                    | Optionnel         | Journal d’exécution déclaré ; les effets de fichiers replayables sont refusés lorsque leur reproduction n’est pas prise en charge. |
| `activityTransport` | `Transport \| undefined`                                  | Optionnel         | Transport des observations bornées d’activité de ressource ; la vivacité n’autorise pas la récupération.                           |
| `recoveryTransport` | `Transport \| undefined`                                  | Optionnel         | Transport explicite conservant les preuves de récupération de sandbox indépendamment des snapshots de fichiers.                    |
| `sandboxProvider`   | `SandboxProvider`                                         | Requis            | Provider d’exécution disposant de la capacité de liaison de fichiers requise ; les providers legacy restent utilisables pour Git.  |
| `agent`             | `DispatchAgent \| undefined`                              | Optionnel         | Agent explicitement composé compatible avec les capacités d’exécution de fichiers et de conversation sélectionnées.                |
| `signal`            | `AbortSignal \| undefined`                                | Optionnel         | Signal d’annulation transmis à l’opération et à son groupe de processus ; les sandboxes réutilisables restent utilisables.         |
| `variables`         | `Readonly<Record<string, string>> \| undefined`           | Optionnel         | Seules les variables d’environnement explicitement déclarées atteignent la sandbox ; aucun chargement implicite de .env.           |
| `workspace`         | `FileWorkspace \| undefined`                              | Selon la variante | Workspace ouvert emprunté pour cette opération ; son caller reste responsable de sa fermeture.                                     |
| `workspaceSource`   | `undefined \| FileWorkspaceSource`                        | Selon la variante | Source déclarée pour une ressource possédée ; exclusive de l’emprunt d’un workspace ouvert.                                        |
| `command`           | `Command`                                                 | Requis            | Exécute la commande déclarée et conserve son véritable statut de sortie, son annulation et ses fichiers settled.                   |
| `outputs`           | `readonly WorkspaceOutputOptions[] \| undefined`          | Optionnel         | Publications protégées déclarées, exécutées seulement après réussite du travail et fermeture de la sandbox.                        |
| `recovery`          | `FileWorkspaceRecoveryAuthorization \| undefined`         | Selon la variante | Autorisation explicite de récupération après arrêt des processus ; le replay interrompu reste une décision distincte du workflow.  |
| `storageQuota`      | `Omit<StorageReservationOptions, "signal"> \| undefined`  | Selon la variante | Réservation d’admission via Transport ; coordonne les writers coopérants sans imposer de quota physique de disque.                 |
| `inputs`            | `readonly WorkspaceInput[] \| undefined`                  | Selon la variante | Entrées de fichiers explicites ; les paramètres JSON du workflow ne sont jamais écrits implicitement sur disque.                   |
| `runtime`           | `WorkspaceRuntimeOptions \| undefined`                    | Selon la variante | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                                                    |
| `paths`             | `readonly string[] \| undefined`                          | Selon la variante | Sélection explicite de chemins relatifs ; la sélection de copie n’applique pas implicitement .gitignore.                           |
| `retention`         | `WorkspaceRetention \| undefined`                         | Selon la variante | run nettoie le travail possédé réussi, local le conserve, portable exige en plus un Transport et un namespace explicites.          |

## Signature

```ts
export type FileIsolatedCommandRequest = FileSandboxOptions & {
  readonly command: Command;
  readonly outputs?: readonly WorkspaceOutputOptions[];
};
```

## Contrats associés

- [Command](../command/)
- [FileSandboxOptions](../filesandboxoptions/)
- [WorkspaceOutputOptions](../workspaceoutputoptions/)
