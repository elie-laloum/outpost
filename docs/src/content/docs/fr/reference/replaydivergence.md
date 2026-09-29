---
title: "ReplayDivergence"
description: "ReplayDivergence — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { ReplayDivergence } from "@elie-laloum/outpost";
```

## Rôle et comportement

OutpostError de code replay, levée quand un rejeu diffère de son journal. kind, turn, expected, actual et commit situent l’écart ; details contient les mêmes champs.

[Exemple complet et règles détaillées](../../guide/progress/).

## Paramètres et propriétés

| Nom        | Type                                | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | ----------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`     | `ReplayDivergenceKind`              | Requis    | Catégorie de divergence : prompt, baseline, tree, exhausted ou unrecorded.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `turn`     | `number`                            | Requis    | Index, à partir de 1, du tour enregistré en cours de rejeu.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `expected` | `string \| undefined`               | Requis    | Valeur enregistrée : texte du prompt, identifiant d’arbre ou raison de l’absence des commits du workspace.                                                                                                                                                                                                                                                                                                                                                                                                  |
| `actual`   | `string \| undefined`               | Requis    | Valeur observée pendant le rejeu : prompt rendu, identifiant d’arbre ou erreur de git apply.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `commit`   | `string \| undefined`               | Requis    | Commit enregistré dont le patch ou l’arbre a divergé, pour les divergences tree.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `recovery` | `Readonly<Record<string, unknown>>` | Requis    | Métadonnées décrivant le workspace et les artefacts de transfert conservés après échec.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `code`     | `FaultCode`                         | Requis    | Catégorie stable d’erreur Outpost utilisée pour le traitement programmatique des échecs.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `details`  | `Readonly<Record<string, unknown>>` | Requis    | Diagnostics structurés attachés au code d’erreur. Les erreurs HTTP de modèles incluent status et, si valide, retryAfterMs : l’attente minimale en millisecondes d’une reprise de tâche explicitement configurée. Les erreurs de quota incluent resetAt lorsque l’heure de réinitialisation est connue, et agent pour les tours de CLI. Les pannes d’agent et de modèle ajoutent unavailable, le signal lu par unavailableFault() ; une erreur de quota résumant un agent de secours épuisé ajoute fallback. |
| `name`     | `string`                            | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `message`  | `string`                            | Requis    | Explication lisible de l’échec.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `stack`    | `string \| undefined`               | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `cause`    | `unknown`                           | Optionnel | Échec d’origine attaché à cette erreur.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

## Signature

```ts
export declare class ReplayDivergence extends OutpostError {
  readonly kind: ReplayDivergenceKind;
  readonly turn: number;
  readonly expected: string | undefined;
  readonly actual: string | undefined;
  readonly commit: string | undefined;
  constructor(details: ReplayDivergenceDetails);
}
```

## Contrats associés

- [OutpostError](../outposterror/)
- [ReplayDivergenceDetails](../replaydivergencedetails/)
- [ReplayDivergenceKind](../replaydivergencekind/)
