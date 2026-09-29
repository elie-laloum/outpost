---
title: "ResponseError"
description: "ResponseError — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { ResponseError } from "@elie-laloum/outpost";
```

## Rôle et comportement

OutpostError de code response, levée quand une réponse typée n’a pas de balise complète ou que son contenu échoue à l’analyse ou à la validation. Un dispatch la lève une fois les tours de réparation épuisés ; son recovery indique alors la conversation, la branche, le répertoire et les tours.

[Exemple complet et règles détaillées](../../guide/typed-responses/).

## Paramètres et propriétés

| Nom        | Type                                | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------- | ----------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`      | `string`                            | Requis    | Balise attendue par le contrat de réponse.                                                                                                                                                                                                                                                                                                                                                                                                          |
| `raw`      | `string \| undefined`               | Requis    | Contenu, sans espaces aux bords, de la dernière balise complète refusée à l’analyse ou à la validation ; undefined si aucune balise complète n’a été trouvée.                                                                                                                                                                                                                                                                                       |
| `recovery` | `Readonly<Record<string, unknown>>` | Requis    | Emplacements du travail conservé après l’échec, par exemple branch, directory, commits, transcript, logReference ou conversation ; vide si rien n’a été conservé. Un échec de synchronisation distante place plutôt son répertoire de transfert dans details.recovery.                                                                                                                                                                              |
| `code`     | `FaultCode`                         | Requis    | Catégorie stable d’erreur Outpost utilisée pour le traitement programmatique des échecs.                                                                                                                                                                                                                                                                                                                                                            |
| `details`  | `Readonly<Record<string, unknown>>` | Requis    | Diagnostics figés propres au code : status, stdout, stderr et conversation pour un processus d’agent en échec ; status et retryAfterMs (l’attente minimale d’une reprise de tâche) pour une erreur HTTP de modèle ; resetAt pour un quota, et fallback quand chaque candidat d’un agent de secours en a atteint un. unavailable signale une panne à unavailableFault(), y compris un délai dépassé après un échec de connexion signalé par l’agent. |
| `name`     | `string`                            | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript.                                                                                                                                                                                                                                                                                                                                                            |
| `message`  | `string`                            | Requis    | Explication lisible de l’échec.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `stack`    | `string \| undefined`               | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                                                                                                                                                                                                                                                                                                                                                                                    |
| `cause`    | `unknown`                           | Optionnel | Échec sous-jacent que cette erreur enveloppe ; quotaFault() et unavailableFault() suivent cette chaîne.                                                                                                                                                                                                                                                                                                                                             |

## Signature

```ts
export declare class ResponseError extends OutpostError {
  readonly tag: string;
  readonly raw: string | undefined;
  constructor(tag: string, message: string, raw?: string, cause?: unknown);
}
```

## Contrats associés

- [OutpostError](../outposterror/)
