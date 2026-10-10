---
title: "Connecter une API de modèle"
description: "Configurez un fournisseur de modèle OpenAI ou Anthropic pour le harness intégré."
---

## Connecter un modèle

Connectez un fournisseur de modèle à `createHarness()` pour que la boucle intégrée puisse appeler l’API. Associez ensuite le harness et un modèle avec `createAgent()`, puis passez cet agent à votre tâche.

```ts
import {
  createAgent,
  createAnthropicModelProvider,
  createHarness,
} from "@elie-laloum/outpost";

export const agent = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({
    modelProvider: createAnthropicModelProvider({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    }),
  }),
});
```

Anthropic exige `maxOutputTokens`, d’où la forme objet de `model`. Chaque requête au modèle est un appel HTTP émis par votre processus Node.js ; les outils s’exécutent toujours dans la sandbox allouée par le dispatch.

## Choisir un protocole

| Factory                        | `api`                         | Chemin ajouté à `baseUrl` | Pour                                                                                   |
| ------------------------------ | ----------------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| `createOpenAIModelProvider`    | `"chat-completions"` (défaut) | `/chat/completions`       | OpenAI et les serveurs qui exposent Chat Completions.                                  |
| `createOpenAIModelProvider`    | `"responses"`                 | `/responses`              | L’API Responses d’OpenAI.                                                              |
| `createAnthropicModelProvider` | aucun                         | `/messages`               | L’API Messages d’Anthropic ; `baseUrl` vaut `https://api.anthropic.com/v1` par défaut. |

`baseUrl` est obligatoire pour OpenAI et inclut le préfixe de version. Le protocole choisi est le seul utilisé : une erreur ne bascule jamais vers un autre.

```ts
import { createOpenAIModelProvider } from "@elie-laloum/outpost";

const openai = createOpenAIModelProvider({
  baseUrl: "https://api.openai.com/v1",
  api: "responses",
  apiKey: process.env.OPENAI_API_KEY ?? "",
});
```

`createCodexHarness({ modelProvider })` est un réglage distinct : il dirige la CLI Codex, dans la sandbox, vers un service compatible Responses ([Codex](../codex/)).

## Utiliser un service local

Indiquez `apiKey: false` pour un serveur sans authentification. L’adresse est résolue depuis votre hôte, pas depuis la sandbox.

```ts
import { createOpenAIModelProvider } from "@elie-laloum/outpost";

const local = createOpenAIModelProvider({
  baseUrl: "http://127.0.0.1:8080/v1",
  apiKey: false,
});
```

## Conserver la clé sur la machine hôte

Vous passez la clé vous-même : Outpost ne lit ni variable d’environnement ni session de compte pour les fournisseurs de modèles. La clé reste dans votre processus et n’atteint jamais la sandbox. [Authentification](../authentication/) compare ce fonctionnement avec celui des agents CLI.

## Régler le modèle et son raisonnement

Le `model` de l’agent est un nom ou `{ name, reasoning, maxOutputTokens }`. `createAgent()` rejette les réglages que le fournisseur ne prend pas en charge.

Référence API : [AgentModel](../../reference/agentmodel/).

Le service vérifie tout de même le nom du modèle et les niveaux à chaque requête.

## Diffuser le texte au fil de l’eau

Les deux fournisseurs diffusent en streaming. Le harness émet des événements `text-delta` pendant que le modèle écrit, et un événement `reasoning` quand une réponse contient un raisonnement lisible. Affichez-les depuis `observe` avec `if (event.kind === "text-delta") process.stdout.write(event.text)` ([Suivre la progression](../progress/)).

## Limiter la durée des requêtes

Par exemple, `createOpenAIModelProvider({ apiKey, timeoutMs: 30_000 })` refuse une requête après trente secondes sans progrès. En streaming, chaque fragment reçu renouvelle ce délai. Ajoutez un `deadlineMs` au dispatch pour limiter aussi un flux qui continue à produire du texte.

Référence API : [OpenAIModelProviderOptions](../../reference/openaimodelprovideroptions/) et [AnthropicModelProviderOptions](../../reference/anthropicmodelprovideroptions/).

Un dépassement échoue avec le code `timeout`. Le harness diffuse en streaming avec les deux fournisseurs : une longue réponse qui continue d’arriver n’expire donc jamais. Limitez le tour entier avec les [limites](../limits-and-cancellation/).

## Mettre en cache le préfixe du prompt

L’option `cache` du harness, active par défaut, demande au fournisseur de réutiliser le préfixe de la conversation d’une étape à l’autre.

<!-- features -->

- **Anthropic** : `cache` marque la requête pour la mise en cache ; `cacheSystem: true` ajoute un point de cache sur les instructions du harness, qui doivent alors exister.
- **OpenAI** : Outpost n’envoie aucun champ de cache ; OpenAI met en cache les préfixes stables de son côté.
- **Usage** : Les lectures du cache apparaissent dans `usage.cached`, et les écritures du cache Anthropic dans `usage.cacheCreated`.

Un succès du cache n’est jamais garanti.

## Réessayer après une limite de débit ou une panne

Un fournisseur envoie chaque requête une seule fois. Quand le service répond HTTP 429 avec `Retry-After`, l’erreur conserve ce délai : une [nouvelle tentative de tâche](../concurrency-and-retries/) attend au moins cette durée, et une [pause de quota](../quota-pauses/) reprend à cette échéance.

Les limites de débit échouent avec le code `quota` ; surcharges, erreurs 5xx et échecs de connexion sont marqués indisponibles pour les [agents de repli](../fallback-agents/). [Pauses de quota](../quota-pauses/) détaille ce qui compte comme un quota.

## Connecter une autre API

Implémentez [`ModelProvider`](../../reference/modelprovider/) : `request()` renvoie un résultat, `stream()` et `validate()` sont facultatifs.

## Limites

- Le raisonnement n’est rejoué qu’au même fournisseur, au même point d’accès et au même modèle. En changer le retire de l’historique.
- `baseUrl` ne peut contenir ni identifiants, ni requête, ni fragment. Les redirections sont refusées.
- Les réponses Anthropic contenant autre chose que du texte, des appels d’outils et de la réflexion échouent avec `response`.

API : [createOpenAIModelProvider](../../reference/createopenaimodelprovider/) · [createAnthropicModelProvider](../../reference/createanthropicmodelprovider/) · [OpenAIModelProviderOptions](../../reference/openaimodelprovideroptions/) · [AnthropicModelProviderOptions](../../reference/anthropicmodelprovideroptions/) · [ModelProvider](../../reference/modelprovider/) · [AgentModel](../../reference/agentmodel/).
