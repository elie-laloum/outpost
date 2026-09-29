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

[Exemple complet et règles détaillées](../../guide/record-replay/).

## Paramètres et propriétés

| Nom        | Type                                | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------- | ----------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`     | `ReplayDivergenceKind`              | Requis    | Catégorie de divergence : prompt, baseline, tree, exhausted ou unrecorded.                                                                                                                                                                                                                                                                                                                                                                          |
| `turn`     | `number`                            | Requis    | Index, à partir de 1, du tour enregistré en cours de rejeu.                                                                                                                                                                                                                                                                                                                                                                                         |
| `expected` | `string \| undefined`               | Requis    | Valeur enregistrée : texte du prompt, identifiant d’arbre ou raison de l’absence des commits du workspace.                                                                                                                                                                                                                                                                                                                                          |
| `actual`   | `string \| undefined`               | Requis    | Valeur observée pendant le rejeu : prompt rendu, identifiant d’arbre ou erreur de git apply.                                                                                                                                                                                                                                                                                                                                                        |
| `commit`   | `string \| undefined`               | Requis    | Commit enregistré dont le patch ou l’arbre a divergé, pour les divergences tree.                                                                                                                                                                                                                                                                                                                                                                    |
| `recovery` | `Readonly<Record<string, unknown>>` | Requis    | Emplacements du travail conservé après l’échec, par exemple branch, directory, commits, transcript, logReference ou conversation ; vide si rien n’a été conservé. Un échec de synchronisation distante place plutôt son répertoire de transfert dans details.recovery.                                                                                                                                                                              |
| `code`     | `FaultCode`                         | Requis    | Catégorie stable d’erreur Outpost utilisée pour le traitement programmatique des échecs.                                                                                                                                                                                                                                                                                                                                                            |
| `details`  | `Readonly<Record<string, unknown>>` | Requis    | Diagnostics figés propres au code : status, stdout, stderr et conversation pour un processus d’agent en échec ; status et retryAfterMs (l’attente minimale d’une reprise de tâche) pour une erreur HTTP de modèle ; resetAt pour un quota, et fallback quand chaque candidat d’un agent de secours en a atteint un. unavailable signale une panne à unavailableFault(), y compris un délai dépassé après un échec de connexion signalé par l’agent. |
| `name`     | `string`                            | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript.                                                                                                                                                                                                                                                                                                                                                            |
| `message`  | `string`                            | Requis    | Explication lisible de l’échec.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `stack`    | `string \| undefined`               | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                                                                                                                                                                                                                                                                                                                                                                                    |
| `cause`    | `unknown`                           | Optionnel | Échec sous-jacent que cette erreur enveloppe ; quotaFault() et unavailableFault() suivent cette chaîne.                                                                                                                                                                                                                                                                                                                                             |

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
