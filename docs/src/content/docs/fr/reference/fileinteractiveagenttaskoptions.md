---
title: "FileInteractiveAgentTaskOptions"
description: "FileInteractiveAgentTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileInteractiveAgentTaskOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                                                     | Présence  | Rôle                                                                                                                                       |
| ----------------- | -------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `workspaceSource` | `FileWorkspaceSource`                                    | Requis    | Source déclarée pour une ressource possédée ; exclusive de l’emprunt d’un workspace ouvert.                                                |
| `sandboxProvider` | `SandboxProvider`                                        | Requis    | Provider d’exécution disposant de la capacité de liaison de fichiers requise ; les providers legacy restent utilisables pour Git.          |
| `agent`           | `Agent`                                                  | Requis    | Agent avec capture et reprise portables de la conversation ; sinon defineInteractiveAgentTask() lève une erreur de code configuration.     |
| `key`             | `string`                                                 | Requis    | Clé stable de la tâche ; participe également à l’identité de la branche conservée.                                                         |
| `after`           | `readonly Task<unknown>[] \| undefined`                  | Optionnel | Dépendances devant réussir avant le premier tour.                                                                                          |
| `timeoutMs`       | `number \| undefined`                                    | Optionnel | Délai coopératif de chaque tentative exécutée, excluant le temps d’attente d’une réponse humaine.                                          |
| `brief`           | `string`                                                 | Requis    | Instructions initiales littérales ; les réponses humaines sont fournies séparément aux tours suivants.                                     |
| `actors`          | `readonly string[]`                                      | Requis    | Identifiants uniques et non vides autorisés à répondre ; l’application doit authentifier les utilisateurs.                                 |
| `maxTurns`        | `number \| undefined`                                    | Optionnel | Nombre maximal de tours terminés, résultat final inclus ; 12 par défaut. Une question au dernier tour échoue au lieu de rester en attente. |
| `hooks`           | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de préparation déclarées workspaceReady, hostReady et sandboxReady.                                                              |
| `recovery`        | `FileWorkspaceRecoveryAuthorization \| undefined`        | Optionnel | Autorisation explicite de récupération après arrêt des processus ; le replay interrompu reste une décision distincte du workflow.          |
| `signal`          | `AbortSignal \| undefined`                               | Optionnel | Signal d’annulation transmis à l’opération et à son groupe de processus ; les sandboxes réutilisables restent utilisables.                 |
| `storageQuota`    | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Réservation d’admission via Transport ; coordonne les writers coopérants sans imposer de quota physique de disque.                         |
| `inputs`          | `readonly WorkspaceInput[] \| undefined`                 | Optionnel | Entrées de fichiers explicites ; les paramètres JSON du workflow ne sont jamais écrits implicitement sur disque.                           |
| `runtime`         | `WorkspaceRuntimeOptions \| undefined`                   | Optionnel | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                                                            |
| `paths`           | `readonly string[] \| undefined`                         | Optionnel | Sélection explicite de chemins relatifs ; la sélection de copie n’applique pas implicitement .gitignore.                                   |
| `retention`       | `WorkspaceRetention \| undefined`                        | Optionnel | run nettoie le travail possédé réussi, local le conserve, portable exige en plus un Transport et un namespace explicites.                  |

## Signature

```ts
export interface FileInteractiveAgentTaskOptions
  extends
    Omit<
      InteractiveAgentTaskOptions,
      "repository" | "bootstrap" | "conversationHome" | "sandboxProvider"
    >,
    Omit<FileWorkspaceOptions, "source"> {
  readonly workspaceSource: FileWorkspaceSource;
  readonly sandboxProvider: SandboxProvider;
}
```

## Contrats associés

- [FileWorkspaceOptions](../fileworkspaceoptions/)
- [FileWorkspaceSource](../fileworkspacesource/)
- [InteractiveAgentTaskOptions](../interactiveagenttaskoptions/)
- [SandboxProvider](../sandboxprovider/)
