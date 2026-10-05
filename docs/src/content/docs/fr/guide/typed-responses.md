---
title: "Valider les réponses de l’agent"
description: "Demandez une réponse structurée et validez-la avant de l’utiliser dans votre application."
---

## Demander une réponse JSON

Définissez un contrat de réponse JSON pour recevoir des données que votre application peut valider. L’agent écrit sa réponse dans la balise demandée, puis Outpost l’analyse et la valide avant de fournir `result.value`.

```ts
import { reportValue } from "./reporter.ts";
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
  brief: {
    text: 'Review the last commit. End with <verdict>{"approved": true, "reasons": []}</verdict>.',
  },
});
if (!result.value.approved) reportValue(result.value.reasons);
// Example output: [ 'Add a regression test.' ]
```

Référence API : [DispatchResult](../../reference/dispatchresult/) et [defineJsonResponse](../../reference/definejsonresponse/).

## Indiquer le format dans les consignes

Outpost envoie votre brief tel quel : il n’ajoute aucune consigne de format. Indiquez la balise attendue et montrez un exemple de son contenu, comme ci-dessus.

`dispatch()` vérifie que le brief contient la balise ouvrante (`<verdict>`) avant de démarrer une sandbox. Sans elle, l’appel échoue avec une erreur `configuration`.

## Utiliser votre propre validation

La fonction reçoit le JSON analysé comme `unknown` et renvoie la valeur typée. Levez une exception pour le rejeter. `read()` applique les mêmes règles que `dispatch()` : vous pouvez tester une réponse hors ligne.

```ts
import { reportValue } from "./reporter.ts";
import { defineJsonResponse } from "@elie-laloum/outpost";
const verdict = defineJsonResponse({
  tag: "verdict",
  schema(input) {
    if (
      typeof input !== "object" ||
      input === null ||
      !("approved" in input) ||
      typeof input.approved !== "boolean"
    )
      throw new Error("Expected approved: boolean");
    return { approved: input.approved };
  },
});
const answer =
  'Draft: <verdict>{"approved":false}</verdict>\n' +
  'Final: <verdict>{"approved":true}</verdict>';
reportValue(await verdict.read(answer));
// Example output: { approved: true }
```

<!-- check:run -->

La dernière paire `<verdict>…</verdict>` complète l’emporte : un brouillon placé plus tôt dans la réponse est ignoré. Son contenu est nettoyé des espaces et peut être entouré d’un bloc de code `json`.

## Renvoyer du texte brut

`defineTextResponse()` renvoie le texte nettoyé contenu dans la balise, sans analyse JSON.

```ts
import { reportValue } from "./reporter.ts";
import { defineTextResponse } from "@elie-laloum/outpost";

const summary = defineTextResponse({ tag: "summary" });
reportValue(await summary.read("<summary>\n  Fixed the README.\n</summary>"));
// Example output: Fixed the README.
```

<!-- check:run -->

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
    brief: { text: "Summarize the README inside <summary></summary>." },
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

Chaque réparation reprend la même conversation avec l’erreur de validation et le contenu précédent. Elle demande uniquement la balise corrigée, sans modifier de fichiers ni lancer de commandes. Les tours de réparation s’ajoutent à `result.usage` et à `result.text`.

Les réparations exigent un agent capable de reprendre sa conversation ; sinon, `dispatch()` refuse `repairs`. [Choisir un agent](../choose-an-agent/) indique quels harness le permettent.

## Limites

- Un dispatch avec `response` s’exécute en une seule passe : `passes` doit valoir 1 ou être omis.
- Une balise commence par une lettre, suivie de lettres, de chiffres, de `_` ou de `-`.
- Une réponse valide prouve sa forme, pas ses affirmations. Vérifiez « tests réussis » en lançant les tests dans une [session de sandbox](../sandbox-sessions/) ou une [boucle de vérification](../verification-loops/).

API : [defineJsonResponse](../../reference/definejsonresponse/) · [defineTextResponse](../../reference/definetextresponse/) · [ResponseError](../../reference/responseerror/) · [ResponseSpec](../../reference/responsespec/) · [DispatchResult](../../reference/dispatchresult/).
