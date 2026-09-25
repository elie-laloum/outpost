---
title: "Réponses validées"
description: "Réponses validées — Outpost"
sidebar:
  order: 8
---

Utilisez `response.text` ou `response.json` pour transformer la réponse de l’agent en valeur typée. Le prompt doit demander la balise correspondante.

```ts
import { dispatch, codex, response } from "@elie-laloum/outpost";

const result = await dispatch({
  agent: codex(),
  brief: {
    text: 'Retourne <report>{"ok": true}</report> après vérification du projet.',
  },
  response: response.json({
    tag: "report",
    repairs: 2,
    schema(input) {
      if (
        !input ||
        typeof input !== "object" ||
        !("ok" in input) ||
        typeof input.ok !== "boolean"
      )
        throw new Error("Expected an ok boolean");
      return { ok: input.ok };
    },
  }),
});
console.log(result.value.ok);
```

## Règles de lecture

La dernière balise complète correspondante est retenue, sans espaces périphériques. Le JSON peut être entouré d’un bloc de code JSON complet à l’intérieur de la balise. Son nom commence par une lettre et ne contient que lettres, chiffres, tirets ou underscores. Une balise absente, un JSON invalide ou un échec de validation produit `ResponseError`.

`schema` accepte une fonction synchrone ou asynchrone, ou un validateur Standard Schema (`~standard.validate`). La valeur retournée détermine le type de `result.value`. `response.text({ tag: "answer" })` retourne une chaîne. Un spec peut aussi s’utiliser directement avec `await spec.read(text)`.

## Réparation et récupération

`repairs` est un entier positif ou nul, égal à `0` par défaut. Une réparation reprend la même conversation avec le retour de validation ; l’adapter doit donc permettre la reprise. Claude Code et Codex le permettent ; [Gemini](../../../../guide/agents/gemini/) exige `repairs: 0`. Les réponses structurées exigent `passes: 1`.

Si les réparations sont épuisées, examinez `ResponseError.tag`, `raw`, `cause` et les informations de récupération. `recoveryDetails(error)` fournit conversation, workspace et commits/log/transcript disponibles sans changer l’identité de l’erreur. Une réponse invalide ne signifie pas que l’agent n’a modifié aucun fichier.
