---
title: "PublicationJournal"
description: "PublicationJournal — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { PublicationJournal } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                | Présence  | Rôle                                                                                                                                  |
| ------------- | ------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `format`      | `1`                                                                 | Requis    | Version de l’enveloppe persistée ; les versions inconnues sont refusées.                                                              |
| `id`          | `string`                                                            | Requis    | Identifiant stable de cette ressource, indépendant du chemin de matérialisation.                                                      |
| `workspaceId` | `string`                                                            | Requis    | Identité stable du workspace auquel appartient ce journal de publication.                                                             |
| `options`     | `WorkspaceOutputOptions`                                            | Requis    | Destination, chemins sélectionnés et politique de remplacement enregistrés avant le début des écritures.                              |
| `staging`     | `string`                                                            | Requis    | Répertoire exclusif d’entrées validées sur le filesystem de destination, conservé pour récupération explicite.                        |
| `backup`      | `string`                                                            | Requis    | Quarantaine exclusive conservant les originaux déplacés et les preuves de rollback.                                                   |
| `operations`  | `PublicationOperation[]`                                            | Requis    | Plan ordonné de création, remplacement et suppression, avec phases de journal d’intention et de résultat.                             |
| `directories` | `PublicationDirectory[] \| undefined`                               | Optionnel | Plan de création de répertoires possédés avec identités filesystem enregistrées et nettoyage conditionnel.                            |
| `outputs`     | `readonly WorkspaceFileEntry[] \| undefined`                        | Optionnel | Publications protégées déclarées, exécutées seulement après réussite du travail et fermeture de la sandbox.                           |
| `lock`        | `{ readonly id: string; readonly directory: string; } \| undefined` | Optionnel | Identité exacte du verrou de destination ; une propriété interrompue exige une récupération explicite après arrêt des processus.      |
| `state`       | `"complete" \| "applying" \| "rolled-back" \| "recovery-required"`  | Requis    | État de lifecycle persisté ; les ressources incertaines ou nécessitant une récupération ne sont jamais reconstruites silencieusement. |

## Signature

```ts
export interface PublicationJournal {
  readonly format: 1;
  readonly id: string;
  readonly workspaceId: string;
  readonly options: WorkspaceOutputOptions;
  readonly staging: string;
  readonly backup: string;
  readonly operations: PublicationOperation[];
  readonly directories?: PublicationDirectory[];
  readonly outputs?: readonly WorkspaceFileEntry[];
  lock?: {
    readonly id: string;
    readonly directory: string;
  };
  state: WorkspacePublication["state"] | "applying";
}
```

## Contrats associés

- [PublicationDirectory](../publicationdirectory/)
- [PublicationOperation](../publicationoperation/)
- [WorkspaceFileEntry](../workspacefileentry/)
- [WorkspaceOutputOptions](../workspaceoutputoptions/)
- [WorkspacePublication](../workspacepublication/)
