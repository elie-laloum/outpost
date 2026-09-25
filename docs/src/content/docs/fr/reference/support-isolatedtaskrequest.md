---
title: "IsolatedTaskRequest"
description: "IsolatedTaskRequest — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Composer des tâches avec dépendances explicites et accès typé aux résultats.

Les clés dupliquées, dépendances absentes et cycles échouent à la validation. Une dépendance en échec ou ignorée empêche ses descendants. Les reprises peuvent répéter les effets externes. Unwrap lève une erreur en cas de non-succès.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom                  | Type                                                             | Présence  | Rôle                                                                               |
| -------------------- | ---------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------- |
| `includeUncommitted` | `boolean \| undefined`                                           | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `agent`              | `AgentAdapter`                                                   | Optionnel | Adapter natif de l’agent de code.                                                  |
| `provider`           | `SandboxProvider \| undefined`                                   | Optionnel | Backend de l’environnement d’exécution.                                            |
| `workspace`          | `Workspace \| undefined`                                         | Optionnel | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche. |
| `hooks`              | `LifecycleHooks \| undefined`                                    | Optionnel | Commandes de cycle de vie dans l’ordre déclaré.                                    |
| `signal`             | `AbortSignal \| undefined`                                       | Optionnel | Annulation coopérative de cette opération.                                         |
| `logging`            | `Logging \| undefined`                                           | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `bootstrap`          | `boolean \| undefined`                                           | Optionnel | Indique si un agent sélectionné absent peut être installé automatiquement.         |
| `conversationHome`   | `string \| undefined`                                            | Optionnel | Home hôte utilisé pour le stockage des transcripts natifs.                         |
| `storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `repository`         | `string \| undefined`                                            | Optionnel | Checkout Git hôte ciblé.                                                           |
| `branch`             | `BranchPolicy \| undefined`                                      | Optionnel | Politique de workspace Git ou identité de branche résultante selon ce contrat.     |
| `copies`             | `readonly string[] \| undefined`                                 | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                              |
| `limits`             | `StageLimits \| undefined`                                       | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `label`              | `string \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `brief`              | `Brief`                                                          | Requis    | Entrée de tâche textuelle littérale ou provenant d’un fichier.                     |
| `passes`             | `number \| undefined`                                            | Optionnel | Nombre maximal de passes d’agent ; une par défaut.                                 |
| `until`              | `string \| readonly string[] \| undefined`                       | Optionnel | Marqueur(s) de fin ; une liste vide désactive la détection.                        |
| `idleMs`             | `number \| undefined`                                            | Optionnel | Intervalle silencieux maximal en millisecondes.                                    |
| `idleWarningMs`      | `number \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `settleMs`           | `number \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `deadlineMs`         | `number \| undefined`                                            | Optionnel | Échéance absolue de l’opération en millisecondes.                                  |
| `expansionMs`        | `number \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `response`           | `ResponseSpec<T> \| undefined`                                   | Optionnel | Analyseur et validateur de la réponse balisée.                                     |
| `observe`            | `((event: AgentObservation) => void) \| undefined`               | Optionnel | Callback d’observation ; ses erreurs sont isolées.                                 |
| `warn`               | `((message: string) => void) \| undefined`                       | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `diagnostic`         | `((message: string) => void) \| undefined`                       | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |

## Signature

```ts
export type IsolatedTaskRequest<T> = SandboxOptions &
  DispatchOptions<T> & {
    readonly agent: AgentAdapter;
  };
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [DispatchOptions](../dispatchoptions/)
- [SandboxOptions](../sandboxoptions/)
