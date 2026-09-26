---
title: Fournisseurs de modèles (expérimental)
description: Configurer les transports HTTP qu’utilisent les harness personnalisés pour appeler un modèle.
sidebar:
  order: 8
---

:::caution[API non publiée]
Cette API de l’arbre de travail remplace le client direct expérimental de 4.2.0. Utilisez un package construit depuis ce checkout. Les fournisseurs envoient des requêtes bornées avec messages et appels d’outils, avec ou sans streaming.
:::

`openaiModelProvider()` configure un service HTTP utilisant Chat Completions ou Responses. `anthropicModelProvider()` utilise Anthropic Messages. Un [harness personnalisé](../../agents/harness/) porte son fournisseur et le pilote ; l’agent sélectionne son modèle avec un nom ou un objet `{ name, reasoning, maxOutputTokens }`. Un modèle inconnu ou inaccessible échoue lors de l’appel au service, sans catalogue ni substitution.

Un `sandboxProvider` alloue l’environnement d’exécution. Ses constructeurs sont explicites, comme `dockerSandboxProvider()` et `localSandboxProvider()`. Les fournisseurs de modèles n’allouent pas de sandbox.

## Appeler un fournisseur directement

<details>
<summary>Préparation complète et exemple exécutable</summary>

Utilisez Node.js 24+ et npm. Construisez ce checkout avec `npm ci` et `npm run build`. Dans un nouveau dossier, installez ce package local :

```sh
mkdir model-example
cd model-example
npm init -y
npm install /absolute/path/to/outpost
```

Créez un fichier `.env` ignoré avec `MODEL_BASE_URL`, `MODEL_NAME` et `MODEL_API_KEY`. Le service reçoit le prompt et peut facturer l’usage de l’API ; les identifiants d’abonnement CLI ne sont pas utilisés.

Enregistrez **example.mts** :

```ts
import { openaiModelProvider } from "@elie-laloum/outpost";

const baseUrl = process.env.MODEL_BASE_URL;
const model = process.env.MODEL_NAME;
const apiKey = process.env.MODEL_API_KEY;
if (!baseUrl || !model || !apiKey) {
  throw new Error("Set MODEL_BASE_URL, MODEL_NAME and MODEL_API_KEY");
}

const provider = openaiModelProvider({ baseUrl, apiKey });
const result = await provider.request({
  model,
  system: "Answer concisely.",
  prompt: "Explain the difference between a model and a harness.",
  maxOutputTokens: 512,
  reasoning: "low",
});
console.log(result.stopReason, result.text);
console.log(result.usage);
```

Lancez `node --env-file=.env example.mts`. La commande affiche la raison d’arrêt, la réponse et l’usage rapporté. Aucun sandbox n’intervient : un fournisseur ne fait que transporter les requêtes. Pour qu’un modèle utilise des outils dans un dépôt, composez le fournisseur dans un [harness personnalisé](../../agents/harness/).

</details>

## Raisonnement et limite de sortie

`reasoning` et `maxOutputTokens` appartiennent au modèle de l’agent. `agent()` appelle d’abord `validate()` du fournisseur : un réglage non pris en charge échoue avant toute allocation de sandbox et toute requête. Un harness personnalisé ajoute les deux valeurs à chaque requête. Un appel direct les passe dans la requête.

| Fournisseur             | `reasoning`                                                                                                            | `maxOutputTokens`         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| OpenAI Chat Completions | `reasoning_effort`, l’un des sept niveaux                                                                              | `max_completion_tokens`   |
| OpenAI Responses        | `reasoning.effort`, l’un des sept niveaux                                                                              | `max_output_tokens`       |
| Anthropic Messages      | `none` désactive la réflexion ; `low` à `max` utilisent la réflexion adaptative avec cet effort ; `minimal` est refusé | `max_tokens`, obligatoire |

Les sept niveaux sont `none`, `minimal`, `low`, `medium`, `high`, `xhigh` et `max`. OpenAI les transmet tels quels : le service décide des niveaux acceptés par chaque modèle. Certains modèles Anthropic ne peuvent pas désactiver la réflexion et refusent `none`.

## Messages, appels d’outils et rejeu du raisonnement

Une requête porte soit `prompt`, soit `messages`. Les messages commencent et se terminent par un message utilisateur. Chaque bloc `tool-call` d’un message assistant exige exactement un bloc `tool-result` dans le message utilisateur suivant ; sinon la requête est refusée. Déclarez les outils appelables dans `tools` avec un nom, une description et un JSON Schema. Le fournisseur les traduit en fonctions Chat Completions, éléments de fonction Responses ou outils Anthropic, et ne les exécute jamais.

Le résultat conserve les blocs de la réponse dans `content` et explique la fin du tour dans `stopReason` :

| `stopReason` | Signification                                                                                |
| ------------ | -------------------------------------------------------------------------------------------- |
| `end`        | Réponse finale dans `text`.                                                                  |
| `tool-calls` | Le modèle demande des outils ; répondez à chaque appel avant la requête suivante.            |
| `max-tokens` | La limite de sortie est atteinte ; le texte ou les arguments d’outils peuvent être tronqués. |
| `refusal`    | Le service a refusé ou filtré la réponse.                                                    |

Ajoutez le `content` renvoyé tel quel comme message assistant suivant. Il peut contenir des blocs `reasoning` : la réflexion Anthropic avec sa signature, ou les éléments de raisonnement chiffrés d’OpenAI. Chaque bloc enregistre l’`identity` du fournisseur et le modèle qui l’ont produit, et n’est renvoyé qu’à ce même couple. Chat Completions ne sait pas rejouer le raisonnement : ses blocs sont retirés. Des arguments d’outil en JSON invalide sont conservés sous forme de chaîne brute, pour que l’appelant réponde par un résultat en erreur.

Avec `cache: true`, Anthropic met en cache le préfixe de la conversation grâce à un point de cache automatique. OpenAI met en cache les préfixes stables de lui-même et ignore l’option. Gardez le texte système et la liste d’outils identiques entre les requêtes pour profiter de l’un ou l’autre cache.

## Streaming

Les fournisseurs intégrés implémentent aussi `stream(request)`. Cette méthode envoie la même requête avec le streaming activé et produit des événements `{ type: "text-delta", text }` au fil de la réponse, puis un unique `{ type: "result", result }` contenant le même `ModelResult` qu’une requête sans streaming :

```ts
import { openaiModelProvider } from "@elie-laloum/outpost";

const provider = openaiModelProvider({
  baseUrl: "https://api.openai.com/v1",
  apiKey: process.env.OPENAI_API_KEY ?? "",
  api: "responses",
});
for await (const event of provider.stream!({
  model: "gpt-5.5",
  prompt: "Hi",
})) {
  if (event.type === "text-delta") process.stdout.write(event.text);
  if (event.type === "result") console.log("\n", event.result.usage);
}
```

Pour un stream, `timeoutMs` borne le silence entre deux fragments reçus plutôt que la requête entière : une longue réponse n’est pas coupée tant que des données arrivent. `maxResponseBytes` borne toujours la taille totale. Chat Completions demande l’usage avec `stream_options.include_usage`. Un harness personnalisé utilise `stream()` automatiquement quand son fournisseur l’implémente, et relaie les fragments sous forme d’événements `text-delta`.

## Propriété et limites des requêtes

Les fournisseurs tournent dans le processus Outpost et ne touchent jamais au sandbox. Dans un harness personnalisé, chaque requête utilise le modèle de l’agent, hérite de l’annulation et du délai de la passe, et ajoute une seule fois son usage rapporté à celui du dispatch. Un fournisseur écrit à la main peut implémenter `ModelProvider` directement ; il doit renvoyer `text`, et devrait renvoyer `content` et `stopReason` pour que le harness exécute les outils.

Le protocole OpenAI utilise `chat-completions` par défaut ; sélectionnez explicitement `api: "responses"` si nécessaire. Aucun retry automatique, suivi de redirection ni repli de protocole. Les clés sont explicites, les URL ne peuvent pas embarquer de credentials et les erreurs omettent les corps distants. `localhost` désigne le processus Outpost, même lorsque les commandes du dépôt tournent dans un sandbox distant. Une annulation ne prouve pas l’arrêt de la génération ni de la facturation distante.

## Anthropic et cache système

Configurez `anthropicModelProvider({ apiKey, cacheSystem: true })`, et fixez `maxOutputTokens` sur le modèle de l’agent ou dans la requête. Chaque requête doit alors fournir des instructions système. Le fournisseur place un point de cache éphémère sur ce texte. Éligibilité et lectures effectives dépendent du service, selon le [contrat de cache Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

`usage.input` inclut l’entrée non cachée, la création et la lecture de cache ; `cached` et `cacheCreated` en sont des sous-ensembles, pas des totaux supplémentaires. Le fournisseur utilise [Messages](https://platform.claude.com/docs/en/api/messages/create), avec la limite de sortie prise dans la requête ou dans le modèle de l’agent. `pause_turn` est refusé, car les outils serveur ne sont pas pris en charge.

[Référence des fournisseurs de modèles](../../../reference/overview/model-providers/) · [Construire un harness personnalisé](../../agents/harness/) · [Travail restant sur le harness](../../../project/roadmap/#direct-model-harness)
