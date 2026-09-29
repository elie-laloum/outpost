---
title: "Codex"
description: "Connecter Codex à une sandbox Outpost."
---

Utilisez `codexHarness()` avec un [environnement d’exécution](../execution-backends/) pris en charge. Installez la CLI dans votre image ou autorisez le bootstrap chez les fournisseurs distants.

## Accès par compte

Lancez `codex -c cli_auth_credentials_store='"file"' login` sur l’hôte, puis sélectionnez `authentication: "account"`. Le fichier est `~/.codex/auth.json`, ou `auth.json` sous `CODEX_HOME`.

## Accès API

Fournissez explicitement `OPENAI_API_KEY`. L’usage API suit la facturation API du fournisseur.

```ts
import { agent, codexHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: codexHarness({
    authentication: "usage",
    variables: { OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "" },
  }),
});
```

## Comportement

Codex prend en charge la capture des conversations, la reprise, le fork et la réparation des réponses. `saveConversations: false` désactive la capture. `conversations` stocke les sessions capturées dans un [store de conversations](../chat-history/#stockage) au format `"codex"`, par exemple `transportConversations("codex", …)`. `approvalReviewer` sélectionne `user` ou `auto_review` lorsque la CLI le prend en charge. Un dispatch avec [pilotage](../steering/) exécute `codex app-server` au lieu de `codex exec`, avec les mêmes réglages de modèle, de raisonnement, de fournisseur et d’approbation, pour que les consignes atteignent le tour en cours.

## Endpoint personnalisé

Définissez `modelProvider: { baseUrl, apiKeyEnvironment }` sur `codexHarness()` et un `model` explicite sur `agent()`. L’endpoint doit implémenter l’API Responses. `apiKeyEnvironment: false` sélectionne un endpoint sans authentification ; sinon, déclarez la variable de clé choisie. Voir [Authentification Codex](https://developers.openai.com/codex/auth).

API : [codexHarness](../../reference/codexharness/).
