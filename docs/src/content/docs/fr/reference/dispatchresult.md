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

| Nom                   | Type                                                                             | Présence  | Rôle                                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observerErrors`      | `readonly unknown[] \| undefined`                                                | Optionnel | Échecs des sinks et du journal collectés pendant le dispatch ; ils n’affectent pas le succès. Avec un hub partagé, inclut aussi ses échecs antérieurs.                                   |
| `branch`              | `string`                                                                         | Requis    | Branche de travail de ce dispatch.                                                                                                                                                       |
| `directory`           | `string`                                                                         | Requis    | Répertoire du worktree de ce dispatch sur l’hôte.                                                                                                                                        |
| `commits`             | `readonly Commit[]`                                                              | Requis    | Commits créés pendant le dispatch, avec oid et sujet ; avec plusieurs passes, les commits de toutes les passes.                                                                          |
| `transcript`          | `string \| undefined`                                                            | Optionnel | Chemin sur l’hôte de la transcription native capturée, quand la conversation de l’agent l’a été.                                                                                         |
| `transcriptReference` | `TransportReference \| undefined`                                                | Optionnel | Index distant versionné de la dernière conversation capturée, lorsque son stockage utilise un transport.                                                                                 |
| `logReference`        | `TransportReference \| undefined`                                                | Optionnel | Index versionné du journal pour readJournal, en stockage local comme distant. Absent lorsque la journalisation est désactivée ou envoyée vers stdout.                                    |
| `retainedDirectory`   | `string \| undefined`                                                            | Optionnel | Worktree conservé à la fermeture parce qu’il était détaché ou contenait des modifications non commitées.                                                                                 |
| `fallback`            | `FallbackRecord \| undefined`                                                    | Optionnel | Présent uniquement lorsque le dispatch a utilisé un agent de secours : le candidat qui a produit ce résultat et ceux qui se sont arrêtés avant lui.                                      |
| `resume`              | `<U = undefined>(options: ContinuationOptions<U>) => Promise<DispatchResult<U>>` | Requis    | Continue cette conversation dans un nouveau dispatch froid avec l’agent qui l’a produite ; vos options s’ajoutent aux options d’origine. Échoue si aucune conversation n’a été capturée. |
| `fork`                | `<U = undefined>(options: ContinuationOptions<U>) => Promise<DispatchResult<U>>` | Requis    | Continue une copie de cette conversation dans un nouveau dispatch froid, sans modifier l’originale. Échoue si aucune conversation n’a été capturée.                                      |
| `text`                | `string`                                                                         | Requis    | Texte de tous les tours de l'exécution, joints par des sauts de ligne, y compris les tours de réparation de réponse.                                                                     |
| `turns`               | `readonly Turn[]`                                                                | Requis    | Tous les tours dans l’ordre, y compris les corrections de réponse et les tours repris par le steering.                                                                                   |
| `usage`               | `Usage`                                                                          | Requis    | Compteurs de tokens additionnés sur tous les tours ; pas un coût.                                                                                                                        |
| `conversation`        | `string \| undefined`                                                            | Optionnel | Identifiant de conversation native du dernier tour, quand l’agent en a fourni un.                                                                                                        |
| `value`               | `T`                                                                              | Requis    | Réponse analysée et validée ; undefined sans option response.                                                                                                                            |
| `completed`           | `boolean`                                                                        | Requis    | Vrai quand le texte du dernier tour contient un marqueur de fin, ou quand une réponse typée a été validée.                                                                               |
| `completion`          | `string \| undefined`                                                            | Optionnel | Marqueur de fin trouvé dans le texte du dernier tour.                                                                                                                                    |

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
