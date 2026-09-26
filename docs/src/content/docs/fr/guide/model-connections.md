---
title: "Connexions aux modèles"
description: "Choisir un protocole HTTP pour la boucle intégrée."
---

:::note[Expérimental]
Ces fournisseurs implémentent le contrat expérimental `ModelProvider` de la boucle intégrée.
:::

Choisissez le fournisseur selon le protocole, puis passez-le à `harness({ modelProvider })`. Les identifiants sont explicites et restent dans le client côté hôte.

```ts
import {
  anthropicModelProvider,
  openaiModelProvider,
} from "@elie-laloum/outpost";

const messages = anthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
const compatible = openaiModelProvider({
  baseUrl: "http://127.0.0.1:8080/v1",
  api: "chat-completions",
  apiKey: false,
});
```

## Sélection du protocole

`openaiModelProvider()` accepte `chat-completions` (par défaut) ou `responses`. Il ajoute l’endpoint choisi à `baseUrl` ; aucun repli ne change de protocole après une erreur. `anthropicModelProvider()` utilise l’API Messages.

Ce réglage est distinct de `codexHarness({ modelProvider })`, qui configure la CLI Codex et exige la compatibilité Responses.

## Bornes et streaming

`timeoutMs` vaut 120 000 ms par défaut. En streaming, il borne le silence entre fragments. `maxResponseBytes` vaut 8 Mio après décompression. Les réponses trop grandes ou mal formées échouent à la frontière du protocole.

Les modèles sont des noms ou des objets avec les réglages de raisonnement et de sortie pris en charge. Un service peut rejeter un nom même si le contrat local accepte sa forme. Raisonnement rejouable et messages d’appels d’outils restent des données de protocole gérées par le fournisseur.

Le `cache` du harness demande la mise en cache du préfixe. `cacheSystem` d’Anthropic ajoute explicitement un point de cache système ; les succès du cache ne sont pas garantis.

API : [openaiModelProvider](../../reference/openaimodelprovider/) · [anthropicModelProvider](../../reference/anthropicmodelprovider/) · [ModelProvider](../../reference/modelprovider/).
