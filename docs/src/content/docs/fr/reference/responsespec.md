---
title: "ResponseSpec"
description: "ResponseSpec — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResponseSpec } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                             | Présence  | Rôle                                                                                                                                                                                                                                                                           |
| ------------ | ------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tag`        | `string`                                         | Requis    | Nom de la balise sans chevrons. Le dispatch demande automatiquement une seule réponse balisée finale ; le brief n’a pas besoin de contenir la balise.                                                                                                                          |
| `repairs`    | `number`                                         | Requis    | Tours de correction autorisés après une réponse invalide, 0 sauf indication contraire dans les options. Chacun reprend la même conversation et ne demande que la balise corrigée. [Texte exact injecté et limites de personnalisation](../responsespec/#outpost-instructions). |
| `format`     | `"text" \| "json" \| undefined`                  | Optionnel | Format du contenu utilisé par les consignes automatiques : json demande du JSON brut conforme à jsonSchema ; text demande du texte. Omettez-le pour un contrat personnalisé demandant un contenu balisé générique.                                                             |
| `jsonSchema` | `Readonly<Record<string, unknown>> \| undefined` | Optionnel | JSON Schema d’entrée capturé et inclus dans le prompt lorsque format vaut json ; obligatoire pour ce format. Décrit le JSON avant la validation par schema et toute transformation.                                                                                            |
| `read`       | `(text: string) => Promise<T>`                   | Requis    | Extrait la dernière paire &lt;tag>…&lt;/tag> complète d’un texte, la nettoie de ses espaces aux bords et l’analyse. Rejette avec ResponseError si aucune paire complète n’existe ou si son contenu est refusé.                                                                 |

<span id="outpost-instructions"></span>

## Instructions ajoutées par Outpost

Les templates ci-dessous conservent le texte anglais envoyé au modèle. `${…}` désigne les valeurs insérées à l’exécution, pas la syntaxe des variables d’un brief.

### Format de réponse finale

Passer `response` à un dispatch ajoute ce bloc après le brief rendu et les messages de steering recueillis au début du tour. Cela vaut aussi pour les continuations, forks et réparations. Le contrat remplace les consignes de format contradictoires tout en conservant les instructions de la tâche.

```text
Final response format:
If earlier instructions specify a conflicting response format, use this format instead. Keep following the task instructions.
End your answer with exactly one <${tag}>...</${tag}> block. Do not write anything after the closing tag.
```

`tag` vient du contrat de réponse. Avec `format: "text"`, la ligne suivante est ajoutée :

```text
Put the requested text inside the response tag.
```

Avec `format: "json"`, Outpost ajoute ce texte et le schéma d’entrée :

```text
Put valid JSON inside the response tag, without a Markdown code fence. The JSON must conform to this input schema:
${schemaJSON}
```

`schemaJSON` correspond à `JSON.stringify(schema, null, 2)` pour le JSON Schema d’entrée capturé. Si `format` est absent, seul le bloc commun est envoyé. Ces ajouts ne sont pas interprétés comme des variables de brief ou des commandes shell.

Aucune option ne permet de remplacer ou désactiver cette formulation en conservant `response`. `tag`, `format` et `jsonSchema` modifient son contenu dynamique. Un dispatch sans `response` ne reçoit aucune de ces consignes de format.

### Réparation de réponse

Lorsque `read()` lève `ResponseError`, qu’une tentative de réparation reste disponible et que le tour possède un identifiant de conversation, le dispatch reprend cette conversation avec ce message à la place du brief initial :

```text
Correct the response inside <${tag}> and </${tag}>.
Validation failure: ${error.message}
Previous content: ${previousContent}
Cause: ${cause}
Further repair attempts after this one: ${remainingAttempts}.
Do not edit files, run commands or continue implementation. Only return the corrected response.
```

`previousContent` vaut `error.raw`, ou `No complete tagged response was returned.` si cette valeur est absente. `cause` est le message de l’exception à l’origine de l’erreur, sinon sa sérialisation JSON, sinon `unspecified`. `remainingAttempts` compte les réparations encore possibles après la nouvelle tentative. Le bloc de format final ci-dessus est ajouté de nouveau, après les éventuels messages de steering recueillis pour ce tour.

`repairs` règle le nombre de tentatives, sans remplacer le prompt de réparation. `repairs: 0` désactive ces tours. Le harness intégré n’expose que les outils en lecture seule pendant une réparation ; la consigne ne constitue pas à elle seule une restriction du système de fichiers pour tous les agents CLI.

Implémentation : [response-instructions.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/domain/response-instructions.ts) · [execution.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/execution.ts) · [steering-turns.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/steering-turns.ts).

## Signature

```ts
export interface ResponseSpec<T> {
  readonly tag: string;
  readonly repairs: number;
  readonly format?: "json" | "text";
  readonly jsonSchema?: JsonSchema;
  read(text: string): Promise<T>;
}
```

## Contrats associés

- [JsonSchema](../jsonschema/)
