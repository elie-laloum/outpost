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

OutpostError spécialisée pour balise absente, JSON invalide ou rejet par schéma des réponses structurées. Conserve la balise attendue, le contenu brut disponible et la cause, et peut porter les métadonnées de récupération du dispatch.

[Exemple complet et règles détaillées](../../guide/agents/responses/).

## Paramètres et propriétés

| Nom        | Type                                | Présence  | Rôle                                                                                     |
| ---------- | ----------------------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `tag`      | `string`                            | Requis    | Identifiant de balise de type XML.                                                       |
| `raw`      | `string \| undefined`               | Requis    | Contenu brut de la réponse balisée disponible lors de l’échec de validation.             |
| `recovery` | `Readonly<Record<string, unknown>>` | Requis    | Métadonnées décrivant le workspace et les artefacts de transfert conservés après échec.  |
| `code`     | `FaultCode`                         | Requis    | Catégorie stable d’erreur Outpost utilisée pour le traitement programmatique des échecs. |
| `details`  | `Readonly<Record<string, unknown>>` | Requis    | Données structurées de diagnostic attachées au code d’erreur.                            |
| `name`     | `string`                            | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript. |
| `message`  | `string`                            | Requis    | Explication lisible de l’échec.                                                          |
| `stack`    | `string \| undefined`               | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                         |
| `cause`    | `unknown`                           | Optionnel | Échec d’origine attaché à cette erreur.                                                  |

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
