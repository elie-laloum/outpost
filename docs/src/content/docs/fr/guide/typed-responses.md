---
title: "Valider les réponses de l’agent"
description: "Demandez une réponse structurée et validez-la avant de l’utiliser dans votre application."
---

Utilisez la [configuration initiale](../setup/) et installez `zod` avec `npm install zod`. Enregistrez le premier exemple dans `verdict-task.ts` puis lancez `node verdict-task.ts`. Il affiche les motifs lorsque l’agent refuse le dernier commit ; une validation réussie prouve seulement que la réponse respecte le format attendu.

## Demander une réponse JSON

Définissez un contrat de réponse JSON pour recevoir des données que votre application peut valider. L’agent écrit sa réponse dans la balise demandée, puis Outpost l’analyse et la valide avant de fournir `result.value`.

```ts
import { dispatch, defineJsonResponse } from "@elie-laloum/outpost";
import { z } from "zod";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";
const verdict = defineJsonResponse({
  tag: "verdict",
  schema: z.object({ approved: z.boolean(), reasons: z.array(z.string()) }),
});
const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  response: verdict,
  brief: { text: "Review the last commit." },
});
if (!result.value.approved) console.log(result.value.reasons);
// Example output: [ 'Add a regression test.' ]
```

Référence API : [DispatchResult](../../reference/dispatchresult/) et [defineJsonResponse](../../reference/definejsonresponse/).

## Traiter une réponse invalide

Une balise absente, un JSON invalide ou un rejet du schéma fait lever à `dispatch()` une `ResponseError` de code `response`, une fois les tours de réparation épuisés.

```ts
import {
  dispatch,
  defineTextResponse,
  ResponseError,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

try {
  await dispatch({
    repository,
    sandboxProvider,
    agent: coder,
    response: defineTextResponse({ tag: "summary" }),
    brief: { text: "Summarize the README." },
  });
} catch (error) {
  if (!(error instanceof ResponseError)) throw error;
  console.error(error.message, error.raw, error.recovery);
}
```

Référence API : [ResponseError](../../reference/responseerror/).

## Laisser l’agent réparer sa réponse

Définissez `repairs` pour accorder à l’agent des tours supplémentaires après une réponse invalide.

```ts
import { defineJsonResponse } from "@elie-laloum/outpost";
import { z } from "zod";

const verdict = defineJsonResponse({
  tag: "verdict",
  schema: z.object({ approved: z.boolean() }),
  repairs: 2,
});
```

Chaque réparation reprend la même conversation avec l’erreur de validation, le contenu précédent et les consignes de format et de schéma. Elle demande uniquement la balise corrigée, sans modifier de fichiers ni lancer de commandes. Les tours de réparation s’ajoutent à `result.usage` et à `result.text`.

Les réparations exigent un agent capable de reprendre sa conversation ; sinon, `dispatch()` refuse `repairs`. [Choisir un agent](../choose-an-agent/) indique quels harness le permettent.

## Laisser Outpost demander le format

Fournir `response` ajoute des consignes de réponse finale après le brief rendu et les messages de steering incorporés au début du tour. Elles demandent une seule balise finale `<verdict>…</verdict>`, contenant du JSON valide, sans texte après la balise fermante. Elles remplacent les consignes de format contradictoires tout en conservant les instructions de la tâche. Aucune option ne permet de les désactiver.

Outpost obtient automatiquement le JSON Schema d’entrée via [Standard JSON Schema](https://standardschema.dev/json-schema), pris en charge directement par Zod 4.2+. Il transmet ce schéma avec les consignes. Le schéma d’entrée décrit ce que l’agent doit renvoyer ; la validation peut transformer ce JSON en un `result.value` différent.

Pour une fonction de parsing ou un validateur sans convertisseur compatible, fournissez `jsonSchema` explicitement. Ce schéma est prioritaire sur la conversion automatique. La définition échoue avec le code `configuration` si le schéma manque, si la conversion échoue ou si le schéma contient des valeurs non conservables en JSON. Outpost capture une copie du schéma, sans les métadonnées de protocole `~standard` non énumérables, et ne résout pas les références distantes.

Le schéma injecté guide l’agent ; `schema` effectue toujours la validation. Les deux doivent décrire le même contrat d’entrée. Les tableaux, primitives et unions sont acceptés, comme les objets.

## Utiliser votre propre validation

La fonction reçoit le JSON analysé comme `unknown` et renvoie la valeur typée. Levez une exception pour le rejeter. `read()` applique les mêmes règles que `dispatch()` : vous pouvez tester une réponse hors ligne. Placez le validateur dans `validate-verdict.ts`, le contrat de réponse dans `verdict.ts` et la vérification hors ligne dans `read-verdict.ts` ; lancez `node read-verdict.ts` pour lire le verdict final.

<!-- tabs -->

```ts title="validate-verdict.ts"
export function validateVerdict(input: unknown) {
  if (
    typeof input !== "object" ||
    input === null ||
    !("approved" in input) ||
    typeof input.approved !== "boolean"
  )
    throw new Error("Expected approved: boolean");
  return { approved: input.approved };
}
```

```ts title="verdict.ts"
import { defineJsonResponse } from "@elie-laloum/outpost";
import { validateVerdict } from "./validate-verdict.ts";
export const verdict = defineJsonResponse({
  tag: "verdict",
  jsonSchema: {
    type: "object",
    properties: { approved: { type: "boolean" } },
    required: ["approved"],
  },
  schema: validateVerdict,
});
```

```ts title="read-verdict.ts"
import { verdict } from "./verdict.ts";
const answer =
  'Draft: <verdict>{"approved":false}</verdict>\n' +
  'Final: <verdict>{"approved":true}</verdict>';
console.log(await verdict.read(answer));
// Example output: { approved: true }
```

<!-- check:run -->

La dernière paire `<verdict>…</verdict>` complète l’emporte : un brouillon placé plus tôt dans la réponse est ignoré. Son contenu est nettoyé des espaces et peut être entouré d’un bloc de code `json`.

## Valider une réponse transformée hors ligne

Ce contrat accepte une chaîne JSON et renvoie sa longueur. Outpost injecte automatiquement le schéma d’entrée de type chaîne, tandis que `read()` renvoie un nombre. Enregistrez-le dans `length.ts` et lancez `node length.ts` après avoir installé Outpost et Zod comme dans l’exemple précédent.

```ts
import { defineJsonResponse } from "@elie-laloum/outpost";
import { z } from "zod";
const length = defineJsonResponse({
  tag: "length",
  schema: z.string().transform((value) => value.length),
});
console.log(
  length.jsonSchema?.type,
  await length.read('<length>"hello"</length>'),
);
// Example output: string 5
```

<!-- check:run -->

## Renvoyer du texte brut

`defineTextResponse()` demande automatiquement une réponse textuelle dans une balise finale et renvoie son contenu nettoyé, sans analyse JSON.

```ts
import { defineTextResponse } from "@elie-laloum/outpost";

const summary = defineTextResponse({ tag: "summary" });
console.log(await summary.read("<summary>\n  Fixed the README.\n</summary>"));
// Example output: Fixed the README.
```

<!-- check:run -->

## Limites

- Un dispatch avec `response` s’exécute en une seule passe : `passes` doit valoir 1 ou être omis.
- Une balise commence par une lettre, suivie de lettres, de chiffres, de `_` ou de `-`.
- Une réponse valide prouve sa forme, pas ses affirmations. Vérifiez « tests réussis » en lançant les tests dans une [session de sandbox](../sandbox-sessions/) ou une [boucle de vérification](../verification-loops/).

API : [defineJsonResponse](../../reference/definejsonresponse/) · [defineTextResponse](../../reference/definetextresponse/) · [ResponseError](../../reference/responseerror/) · [ResponseSpec](../../reference/responsespec/) · [DispatchResult](../../reference/dispatchresult/).
