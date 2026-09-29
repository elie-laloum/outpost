---
title: "SpeculativeOutput"
description: "SpeculativeOutput — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { SpeculativeOutput } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                   | Type                              | Présence  | Rôle                                                                                                                                                   |
| --------------------- | --------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `completion`          | `string \| undefined`             | Optionnel | Marqueur de fin correspondant à la sortie de l’agent lorsqu’il a été trouvé.                                                                           |
| `text`                | `string`                          | Requis    | Texte final rapporté par l’exécution de l’agent.                                                                                                       |
| `conversation`        | `string \| undefined`             | Optionnel | Identité de conversation native disponible.                                                                                                            |
| `usage`               | `Usage`                           | Requis    | Compteurs d’usage rapportés ; aucune estimation monétaire.                                                                                             |
| `fallback`            | `FallbackRecord \| undefined`     | Optionnel | Présent uniquement lorsque le dispatch a utilisé un agent de secours : le candidat qui a produit ce résultat et ceux qui se sont arrêtés avant lui.    |
| `completed`           | `boolean`                         | Requis    | Indique si le marqueur de fin configuré a été détecté.                                                                                                 |
| `branch`              | `string`                          | Requis    | Nom de la branche de travail utilisée ou observée pendant l’exécution.                                                                                 |
| `observerErrors`      | `readonly unknown[] \| undefined` | Optionnel | Erreurs collectées des récepteurs et du journal, distinctes du succès de l’exécution ; un hub partagé fourni expose également ses diagnostics cumulés. |
| `directory`           | `string`                          | Requis    | Dossier hôte du workspace utilisé pour cette exécution.                                                                                                |
| `commits`             | `readonly Commit[]`               | Requis    | Identités et sujets des commits Git collectés.                                                                                                         |
| `transcript`          | `string \| undefined`             | Optionnel | Chemin hôte disponible du transcript capturé.                                                                                                          |
| `transcriptReference` | `TransportReference \| undefined` | Optionnel | Index distant versionné de la dernière conversation capturée, lorsque son stockage utilise un transport.                                               |
| `logReference`        | `TransportReference \| undefined` | Optionnel | Index versionné du journal pour readJournal, en stockage local comme distant. Absent lorsque la journalisation est désactivée ou envoyée vers stdout.  |
| `retainedDirectory`   | `string \| undefined`             | Optionnel | Workspace conservé pour inspection ou récupération.                                                                                                    |
| `turns`               | `readonly Turn[]`                 | Requis    | Résultats ordonnés des tours d’agent : texte, statut, durée et usage de tokens de chaque passe.                                                        |
| `value`               | `T`                               | Requis    | Valeur de réponse structurée validée ; undefined en l’absence de spécification de réponse.                                                             |

## Signature

```ts
export type SpeculativeOutput<T> = Omit<
  WarmDispatchResult<T>,
  "resume" | "fork"
>;
```

## Contrats associés

- [WarmDispatchResult](../warmdispatchresult/)
