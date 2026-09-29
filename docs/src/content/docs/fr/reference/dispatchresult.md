---
title: "DispatchResult"
description: "DispatchResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DispatchResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                   | Type                                                                             | Présence  | Rôle                                                                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `observerErrors`      | `readonly unknown[] \| undefined`                                                | Optionnel | Erreurs collectées des récepteurs et du journal, distinctes du succès de l’exécution ; un hub partagé fourni expose également ses diagnostics cumulés. |
| `branch`              | `string`                                                                         | Requis    | Nom de la branche de travail utilisée ou observée pendant l’exécution.                                                                                 |
| `directory`           | `string`                                                                         | Requis    | Dossier hôte du workspace utilisé pour cette exécution.                                                                                                |
| `commits`             | `readonly Commit[]`                                                              | Requis    | Identités et sujets des commits Git collectés.                                                                                                         |
| `transcript`          | `string \| undefined`                                                            | Optionnel | Chemin hôte disponible du transcript capturé.                                                                                                          |
| `transcriptReference` | `TransportReference \| undefined`                                                | Optionnel | Index distant versionné de la dernière conversation capturée, lorsque son stockage utilise un transport.                                               |
| `logReference`        | `TransportReference \| undefined`                                                | Optionnel | Index versionné du journal pour readJournal, en stockage local comme distant. Absent lorsque la journalisation est désactivée ou envoyée vers stdout.  |
| `retainedDirectory`   | `string \| undefined`                                                            | Optionnel | Workspace conservé pour inspection ou récupération.                                                                                                    |
| `fallback`            | `FallbackRecord \| undefined`                                                    | Optionnel | Présent uniquement lorsque le dispatch a utilisé un agent de secours : le candidat qui a produit ce résultat et ceux qui se sont arrêtés avant lui.    |
| `resume`              | `<U = undefined>(options: ContinuationOptions<U>) => Promise<DispatchResult<U>>` | Requis    | Poursuit la conversation de ce résultat dans une sandbox nouvellement allouée.                                                                         |
| `fork`                | `<U = undefined>(options: ContinuationOptions<U>) => Promise<DispatchResult<U>>` | Requis    | Bifurque depuis la conversation de ce résultat dans une sandbox nouvellement allouée.                                                                  |
| `text`                | `string`                                                                         | Requis    | Texte de tous les tours de l'exécution, joints par des sauts de ligne, y compris les tours de réparation de réponse.                                   |
| `turns`               | `readonly Turn[]`                                                                | Requis    | Résultats ordonnés des tours d’agent : texte, statut, durée et usage de tokens de chaque passe.                                                        |
| `usage`               | `Usage`                                                                          | Requis    | Compteurs d’usage rapportés ; aucune estimation monétaire.                                                                                             |
| `conversation`        | `string \| undefined`                                                            | Optionnel | Identité de conversation native disponible.                                                                                                            |
| `value`               | `T`                                                                              | Requis    | Valeur de réponse structurée validée ; undefined en l’absence de spécification de réponse.                                                             |
| `completed`           | `boolean`                                                                        | Requis    | Indique si le marqueur de fin configuré a été détecté.                                                                                                 |
| `completion`          | `string \| undefined`                                                            | Optionnel | Marqueur de fin correspondant à la sortie de l’agent lorsqu’il a été trouvé.                                                                           |

## Signature

```ts
export interface DispatchResult<T> extends Execution<T> {
  readonly observerErrors?: readonly unknown[];
  readonly branch: string;
  readonly directory: string;
  readonly commits: readonly Commit[];
  readonly transcript?: string;
  readonly transcriptReference?: TransportReference;
  readonly logReference?: TransportReference;
  readonly retainedDirectory?: string;
  /** Candidate that ran and candidates that failed before it, for fallback agents. */
  readonly fallback?: FallbackRecord;
  resume<U = undefined>(
    options: ContinuationOptions<U>,
  ): Promise<DispatchResult<U>>;
  fork<U = undefined>(
    options: ContinuationOptions<U>,
  ): Promise<DispatchResult<U>>;
}
```

## Contrats associés

- [Commit](../commit/)
- [ContinuationOptions](../continuationoptions/)
- [Execution](../execution/)
- [FallbackRecord](../fallbackrecord/)
- [TransportReference](../transportreference/)
