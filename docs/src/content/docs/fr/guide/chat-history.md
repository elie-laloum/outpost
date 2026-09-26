---
title: "Historique de discussion"
description: "Continuer une conversation d’agent ou en dériver une autre."
---

Codex et Claude Code peuvent capturer leurs conversations natives. Continuez-en une avec `result.resume()` ou créez une conversation distincte avec `result.fork()`.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const first = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Inspect the parser and explain its edge cases." },
});
const next = await first.resume({
  sandboxProvider,
  brief: { text: "Which edge case deserves a regression test first?" },
});
console.log(next.text);
```

## Choix de continuation

Dans une sandbox ouverte, utilisez `sandbox.resume(id, options)` ou `sandbox.fork(id, options)`. Un résultat à froid restaure sa conversation capturée dans un environnement ultérieur. L’identifiant de conversation et sa transcription sont distincts de la branche et du workspace Git.

Désactiver la capture empêche le résultat de fournir une conversation enregistrée pour restauration ultérieure. Antigravity, Copilot et Kimi prennent uniquement en charge les sessions neuves.

## Stockage

`conversations()` gère les formats natifs ; `harnessConversations()` stocke les transcriptions de la boucle intégrée. `transportConversations()` archive les formats pris en charge via un transport. La restauration réécrit les chemins de workspace pris en charge lorsque la transcription se déplace.

Séparez l’accès aux transcriptions de l’authentification. Une conversation enregistrée ne fournit pas d’identifiants de compte, et supprimer les identifiants ne supprime pas le contenu des conversations.

API : [DispatchResult](../../reference/dispatchresult/) · [ConversationStore](../../reference/conversationstore/) · [transportConversations](../../reference/transportconversations/).
