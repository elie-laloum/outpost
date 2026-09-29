---
title: "Connexions aux modèles"
description: "Choisir un protocole HTTP pour la boucle intégrée."
---

Le contrat `ModelProvider`, `createOpenAIModelProvider()` et `createAnthropicModelProvider()` sont stables en 7.0.0. Les requêtes modèles sont exécutées dans le processus Outpost.

Choisissez le fournisseur selon le protocole, puis passez-le à `createHarness({ modelProvider })`. Les identifiants sont explicites et restent dans le client côté hôte.

```ts
import {
  createAnthropicModelProvider,
  createOpenAIModelProvider,
} from "@elie-laloum/outpost";

const messages = createAnthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
const compatible = createOpenAIModelProvider({
  baseUrl: "http://127.0.0.1:8080/v1",
  api: "chat-completions",
  apiKey: false,
});
```

## Sélection du protocole

`createOpenAIModelProvider()` accepte `chat-completions` (par défaut) ou `responses`. Il ajoute l’endpoint choisi à `baseUrl` ; aucun repli ne change de protocole après une erreur. `createAnthropicModelProvider()` utilise l’API Messages.

Ce réglage est distinct de `createCodexHarness({ modelProvider })`, qui configure la CLI Codex et exige la compatibilité Responses.

## Bornes et streaming

`timeoutMs` vaut 120 000 ms par défaut. En streaming, il borne le silence entre fragments. `maxResponseBytes` vaut 8 Mio après décompression. Les réponses trop grandes ou mal formées échouent à la frontière du protocole.

Les modèles sont des noms ou des objets avec les réglages de raisonnement et de sortie pris en charge. Un service peut rejeter un nom même si le contrat local accepte sa forme. Raisonnement rejouable et messages d’appels d’outils restent des données de protocole gérées par le fournisseur.

Le `cache` du harness demande la mise en cache du préfixe. `cacheSystem` d’Anthropic ajoute explicitement un point de cache système ; les succès du cache ne sont pas garantis.

API : [createOpenAIModelProvider](../../reference/createopenaimodelprovider/) · [createAnthropicModelProvider](../../reference/createanthropicmodelprovider/) · [ModelProvider](../../reference/modelprovider/).

## Validation

La validation locale de septembre 2026 couvre OpenAI Responses et Chat Completions avec `gpt-5.6-luna`, la délégation et l’édition dans Docker, puis cache, limites, interruption et flux incomplet. Responses utilise le raisonnement `low` ; Chat Completions utilise `none`, car le service a refusé les outils avec `low`. Le 28 septembre, sept scénarios Anthropic authentifiés ont réussi avec `claude-haiku-4-5-20251001`, sans raisonnement activé : édition/tests/commit par un enfant et continuation du parent dans Docker, cache réel, annulation, limites de sortie et d’étapes, budgets de tokens et rejet d’un flux réel interrompu artificiellement. Cela satisfait le prérequis de validation de la délégation pour l’adaptateur ; les autres modèles et configurations de raisonnement nécessitent leurs propres preuves réelles.

Dans le dépôt source, `node scripts/harness-live.mjs offline docker coding` exécute une fixture déterministe dans un vrai conteneur. Remplacez `docker` par `podman`, `vercel` ou `daytona` avec les prérequis correspondants. Pour une campagne payante, chargez vos identifiants puis utilisez `node scripts/harness-live.mjs responses docker coding --live`. Les protocoles `chat-completions` et `anthropic` acceptent les mêmes scénarios : `coding`, `cache`, `cancel`, `truncation`, `steps`, `usage`, `network`.

Les rapports et le registre budgétaire sont écrits dans `temp/harness-stable-live`, ou dans `OUTPOST_HARNESS_REPORT_DIRECTORY`. Le plafond commun de réservations est de 5 $ ; chaque appel réserve une estimation conservatrice avant envoi. Les appels interrompus ne sont pas remboursés dans ce registre et l’estimation ne remplace pas la facture. Conservez ce dossier sur un stockage persistant et ne réinitialisez pas le budget pour contourner le plafond. Les frais de sandbox sont distincts. Cette campagne synthétique ne constitue pas un benchmark face aux CLI.
