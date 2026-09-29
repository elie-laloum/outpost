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

| Nom        | Type                                | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | ----------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`      | `string`                            | Requis    | Balise attendue par le contrat de réponse.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `raw`      | `string \| undefined`               | Requis    | Contenu, sans espaces aux bords, de la dernière balise complète refusée à l’analyse ou à la validation ; undefined si aucune balise complète n’a été trouvée.                                                                                                                                                                                                                                                                                                                                               |
| `recovery` | `Readonly<Record<string, unknown>>` | Requis    | Métadonnées décrivant le workspace et les artefacts de transfert conservés après échec.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `code`     | `FaultCode`                         | Requis    | Catégorie stable d’erreur Outpost utilisée pour le traitement programmatique des échecs.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `details`  | `Readonly<Record<string, unknown>>` | Requis    | Diagnostics structurés attachés au code d’erreur. Les erreurs HTTP de modèles incluent status et, si valide, retryAfterMs : l’attente minimale en millisecondes d’une reprise de tâche explicitement configurée. Les erreurs de quota incluent resetAt lorsque l’heure de réinitialisation est connue, et agent pour les tours de CLI. Les pannes d’agent et de modèle ajoutent unavailable, le signal lu par unavailableFault() ; une erreur de quota résumant un agent de secours épuisé ajoute fallback. |
| `name`     | `string`                            | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `message`  | `string`                            | Requis    | Explication lisible de l’échec.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `stack`    | `string \| undefined`               | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `cause`    | `unknown`                           | Optionnel | Échec d’origine attaché à cette erreur.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

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
