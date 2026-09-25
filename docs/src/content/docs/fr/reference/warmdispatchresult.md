---
title: "WarmDispatchResult"
description: "WarmDispatchResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WarmDispatchResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                   | Type                                                                             | Présence  | Rôle                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `resume`              | `<U = undefined>(options: DispatchOptions<U>) => Promise<WarmDispatchResult<U>>` | Requis    | Poursuit la conversation de ce résultat dans sa sandbox d’origine encore ouverte.                        |
| `fork`                | `<U = undefined>(options: DispatchOptions<U>) => Promise<WarmDispatchResult<U>>` | Requis    | Bifurque depuis la conversation de ce résultat dans sa sandbox d’origine encore ouverte.                 |
| `text`                | `string`                                                                         | Requis    | Texte final rapporté par l’exécution de l’agent.                                                         |
| `conversation`        | `string \| undefined`                                                            | Optionnel | Identité de conversation native disponible.                                                              |
| `usage`               | `Usage`                                                                          | Requis    | Compteurs d’usage rapportés ; aucune estimation monétaire.                                               |
| `branch`              | `string`                                                                         | Requis    | Nom de la branche de travail utilisée ou observée pendant l’exécution.                                   |
| `directory`           | `string`                                                                         | Requis    | Dossier hôte du workspace utilisé pour cette exécution.                                                  |
| `commits`             | `readonly Commit[]`                                                              | Requis    | Identités et sujets des commits Git collectés.                                                           |
| `transcript`          | `string \| undefined`                                                            | Optionnel | Chemin hôte disponible du transcript capturé.                                                            |
| `transcriptReference` | `TransportReference \| undefined`                                                | Optionnel | Index distant versionné de la dernière conversation capturée, lorsque son stockage utilise un transport. |
| `logReference`        | `TransportReference \| undefined`                                                | Optionnel | Index versionné validé du journal pour readJournal ; log reste réservé aux vrais chemins locaux.         |
| `log`                 | `string \| undefined`                                                            | Optionnel | Chemin hôte du journal du dispatch lorsqu’un journal a été produit.                                      |
| `retainedDirectory`   | `string \| undefined`                                                            | Optionnel | Workspace conservé pour inspection ou récupération.                                                      |
| `turns`               | `readonly Turn[]`                                                                | Requis    | Résultats ordonnés des tours d’agent : texte, statut, durée et usage de tokens de chaque passe.          |
| `value`               | `T`                                                                              | Requis    | Valeur de réponse structurée validée ; undefined en l’absence de spécification de réponse.               |
| `completed`           | `boolean`                                                                        | Requis    | Indique si le marqueur de fin configuré a été détecté.                                                   |
| `completion`          | `string \| undefined`                                                            | Optionnel | Marqueur de fin correspondant à la sortie de l’agent lorsqu’il a été trouvé.                             |

## Signature

```ts
export interface WarmDispatchResult<T> extends Omit<
  DispatchResult<T>,
  "resume" | "fork"
> {
  resume<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<WarmDispatchResult<U>>;
  fork<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<WarmDispatchResult<U>>;
}
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
- [DispatchResult](../dispatchresult/)
