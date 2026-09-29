---
title: "SpeculativeOutput"
description: "SpeculativeOutput — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Fait partie de l’API expérimentale de spéculation : ce contrat peut encore changer. Consultez [Candidats concurrents](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculativeOutput } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                   | Type                              | Présence  | Rôle                                                                                                                                                   |
| --------------------- | --------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `completion`          | `string \| undefined`             | Optionnel | Marqueur de fin trouvé dans le texte du dernier tour.                                                                                                  |
| `text`                | `string`                          | Requis    | Texte de tous les tours de l’exécution, joints par des sauts de ligne, y compris les tours de réparation de réponse.                                   |
| `conversation`        | `string \| undefined`             | Optionnel | Identifiant de conversation native du dernier tour, quand l’agent en a fourni un.                                                                      |
| `usage`               | `Usage`                           | Requis    | Compteurs de tokens additionnés sur tous les tours ; pas un coût.                                                                                      |
| `fallback`            | `FallbackRecord \| undefined`     | Optionnel | Présent uniquement lorsque le dispatch a utilisé un agent de secours : le candidat qui a produit ce résultat et ceux qui se sont arrêtés avant lui.    |
| `completed`           | `boolean`                         | Requis    | Vrai quand le texte du dernier tour contient un marqueur de fin, ou quand une réponse typée a été validée.                                             |
| `branch`              | `string`                          | Requis    | Branche de travail de ce dispatch.                                                                                                                     |
| `observerErrors`      | `readonly unknown[] \| undefined` | Optionnel | Échecs des sinks et du journal collectés pendant le dispatch ; ils n’affectent pas le succès. Avec un hub partagé, inclut aussi ses échecs antérieurs. |
| `directory`           | `string`                          | Requis    | Répertoire du worktree de ce dispatch sur l’hôte.                                                                                                      |
| `commits`             | `readonly Commit[]`               | Requis    | Commits créés pendant le dispatch, avec oid et sujet ; avec plusieurs passes, les commits de toutes les passes.                                        |
| `transcript`          | `string \| undefined`             | Optionnel | Chemin sur l’hôte de la transcription native capturée, quand la conversation de l’agent l’a été.                                                       |
| `transcriptReference` | `TransportReference \| undefined` | Optionnel | Index distant versionné de la dernière conversation capturée, lorsque son stockage utilise un transport.                                               |
| `logReference`        | `TransportReference \| undefined` | Optionnel | Index versionné du journal pour readJournal, en stockage local comme distant. Absent lorsque la journalisation est désactivée ou envoyée vers stdout.  |
| `retainedDirectory`   | `string \| undefined`             | Optionnel | Worktree conservé à la fermeture parce qu’il était détaché ou contenait des modifications non commitées.                                               |
| `turns`               | `readonly Turn[]`                 | Requis    | Tous les tours dans l’ordre, y compris les corrections de réponse et les tours repris par le steering.                                                 |
| `value`               | `T`                               | Requis    | Réponse analysée et validée ; undefined sans option response.                                                                                          |

## Signature

```ts
export type SpeculativeOutput<T> = Omit<
  WarmDispatchResult<T>,
  "resume" | "fork"
>;
```

## Contrats associés

- [WarmDispatchResult](../warmdispatchresult/)
