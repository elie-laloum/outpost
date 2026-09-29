---
title: "Réponses typées"
description: "Transformer une réponse d’agent en données validées."
---

Passez une spécification de réponse à `dispatch({ response })`. La valeur analysée est renvoyée dans `result.value` ; la réponse complète reste dans `result.text`.

## Définir une réponse JSON

```ts
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
console.log(await verdict.read('<verdict>{"approved":true}</verdict>'));
```

<!-- check:run -->

Demandez `<verdict>{"approved":true}</verdict>` dans le brief. Le validateur lit la dernière balise correspondante complète, analyse son JSON et applique votre schéma. Une balise absente, un JSON invalide ou un échec du schéma déclenche `ResponseError`.

## Utiliser une bibliothèque de schémas

`schema` accepte une fonction d’analyse ou un validateur Standard Schema, notamment les schémas Zod et Valibot compatibles. Le schéma valide les données renvoyées ; les types TypeScript seuls ne valident pas la sortie du modèle.

Utilisez `defineTextResponse({ tag: "summary" })` pour obtenir uniquement le texte nettoyé d’une balise.

## Réparer une réponse

`repairs` vaut zéro par défaut. Augmentez-le pour autoriser des tours supplémentaires de réparation sur un harness reprenable. Les réparations consomment du temps et des tokens ; elles ne sont pas disponibles avec les adaptateurs limités aux sessions neuves. Elles ne remplacent pas la vérification d’une affirmation comme « tests réussis » par une commande réelle.

API : [defineTextResponse](../../reference/definetextresponse/) · [defineJsonResponse](../../reference/definejsonresponse/) · [ResponseError](../../reference/responseerror/).
