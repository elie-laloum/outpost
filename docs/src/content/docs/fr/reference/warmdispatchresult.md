---
title: "WarmDispatchResult"
description: "WarmDispatchResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WarmDispatchResult**. Consultez le [guide dispatch](../../guide/agents/dispatch/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WarmDispatchResult } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécuter une tâche d’agent et collecter texte, sortie typée, commits, usage et conversation native.

Une passe est la valeur par défaut. Les échecs de processus ou réponse rejettent la promesse. Épuiser les passes peut plutôt renvoyer completed: false. Le dispatch froid ferme ses ressources ; le dispatch chaud conserve sa sandbox.

[Exemple complet et règles détaillées](../../guide/agents/dispatch/).

## Paramètres et propriétés

| Nom                 | Type                                                                             | Présence  | Rôle                                                                             |
| ------------------- | -------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `resume`            | `<U = undefined>(options: DispatchOptions<U>) => Promise<WarmDispatchResult<U>>` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `fork`              | `<U = undefined>(options: DispatchOptions<U>) => Promise<WarmDispatchResult<U>>` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `text`              | `string`                                                                         | Requis    | Contenu textuel ; sa provenance dépend de l’opération.                           |
| `conversation`      | `string \| undefined`                                                            | Optionnel | Identité de conversation native disponible.                                      |
| `usage`             | `Usage`                                                                          | Requis    | Compteurs d’usage rapportés ; aucune estimation monétaire.                       |
| `branch`            | `string`                                                                         | Requis    | Politique de workspace Git ou identité de branche résultante selon ce contrat.   |
| `directory`         | `string`                                                                         | Requis    | Dossier utilisé par l’opération ; voir les règles de résolution.                 |
| `commits`           | `readonly Commit[]`                                                              | Requis    | Identités et sujets des commits Git collectés.                                   |
| `transcript`        | `string \| undefined`                                                            | Optionnel | Chemin hôte disponible du transcript capturé.                                    |
| `log`               | `string \| undefined`                                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `retainedDirectory` | `string \| undefined`                                                            | Optionnel | Workspace conservé pour inspection ou récupération.                              |
| `turns`             | `readonly Turn[]`                                                                | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `value`             | `T`                                                                              | Requis    | Valeur typée produite ou consommée par ce contrat.                               |
| `completed`         | `boolean`                                                                        | Requis    | Indique si le marqueur de fin configuré a été détecté.                           |
| `completion`        | `string \| undefined`                                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
