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

| Nom                 | Type                                                                             | Présence  | Rôle                                                                                            |
| ------------------- | -------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| `branch`            | `string`                                                                         | Requis    | Nom de la branche de travail utilisée ou observée pendant l’exécution.                          |
| `directory`         | `string`                                                                         | Requis    | Dossier hôte du workspace utilisé pour cette exécution.                                         |
| `commits`           | `readonly Commit[]`                                                              | Requis    | Identités et sujets des commits Git collectés.                                                  |
| `transcript`        | `string \| undefined`                                                            | Optionnel | Chemin hôte disponible du transcript capturé.                                                   |
| `log`               | `string \| undefined`                                                            | Optionnel | Chemin hôte du journal du dispatch lorsqu’un journal a été produit.                             |
| `retainedDirectory` | `string \| undefined`                                                            | Optionnel | Workspace conservé pour inspection ou récupération.                                             |
| `resume`            | `<U = undefined>(options: ContinuationOptions<U>) => Promise<DispatchResult<U>>` | Requis    | Poursuit la conversation de ce résultat dans une sandbox nouvellement allouée.                  |
| `fork`              | `<U = undefined>(options: ContinuationOptions<U>) => Promise<DispatchResult<U>>` | Requis    | Bifurque depuis la conversation de ce résultat dans une sandbox nouvellement allouée.           |
| `text`              | `string`                                                                         | Requis    | Texte final rapporté par l’exécution de l’agent.                                                |
| `turns`             | `readonly Turn[]`                                                                | Requis    | Résultats ordonnés des tours d’agent : texte, statut, durée et usage de tokens de chaque passe. |
| `usage`             | `Usage`                                                                          | Requis    | Compteurs d’usage rapportés ; aucune estimation monétaire.                                      |
| `conversation`      | `string \| undefined`                                                            | Optionnel | Identité de conversation native disponible.                                                     |
| `value`             | `T`                                                                              | Requis    | Valeur de réponse structurée validée ; undefined en l’absence de spécification de réponse.      |
| `completed`         | `boolean`                                                                        | Requis    | Indique si le marqueur de fin configuré a été détecté.                                          |
| `completion`        | `string \| undefined`                                                            | Optionnel | Marqueur de fin correspondant à la sortie de l’agent lorsqu’il a été trouvé.                    |

## Signature

```ts
export interface DispatchResult<T> extends Execution<T> {
  readonly branch: string;
  readonly directory: string;
  readonly commits: readonly Commit[];
  readonly transcript?: string;
  readonly log?: string;
  readonly retainedDirectory?: string;
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
