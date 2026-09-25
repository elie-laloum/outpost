---
title: Fournisseurs de modèles directs (expérimental)
description: Appeler des API textuelles compatibles sans Codex ; le harness d’agent est prévu séparément.
sidebar:
  order: 8
---

:::caution[Expérimental — première phase]
`openaiCompatible()` implémente la génération directe de texte sans Codex. Il ne dispose pas de harness d’agent : outils, modifications du dépôt, collecte automatique du contexte et persistance des conversations ne sont pas implémentés. Son API peut évoluer. Cet ajout est implémenté mais non publié ; installez un build de cette révision source pour l’essayer.
:::

Un fournisseur de modèles choisit le service HTTP qui génère le texte. Un [provider de sandbox](../../environment/providers/overview/) choisit où les commandes s’exécutent. Ce client s’exécute dans le processus qui appelle `generate()` et n’alloue aucune sandbox. Il ne peut pas être passé comme `agent` ou `provider` à `dispatch()` ou `createSandbox()`.

## Effectuer un appel direct

<details>
<summary>Préparation complète et exemple exécutable</summary>

Utilisez Node.js 24+ et un checkout d’Outpost contenant cette implémentation. Construisez ce checkout, puis installez-le dans un répertoire d’exemple distinct :

```sh
cd /absolute/path/outpost
npm ci
npm run build
mkdir /absolute/path/model-example
cd /absolute/path/model-example
npm init -y
npm install /absolute/path/outpost
```

Créez un fichier `.env` ignoré déclarant `MODEL_BASE_URL`, `MODEL_NAME` et `MODEL_API_KEY`. Utilisez l’URL de base de l’API du service choisi, avec son préfixe de version, et un identifiant de modèle disponible. L’appel envoie le prompt et la clé à ce service et peut entraîner sa facturation API. Aucune session de compte Codex ou ChatGPT n’intervient. Ne commitez pas la clé.

Enregistrez ce fichier sous `example.mts` :

```ts
import { openaiCompatible } from "@elie-laloum/outpost";

const baseUrl = process.env.MODEL_BASE_URL;
const model = process.env.MODEL_NAME;
const apiKey = process.env.MODEL_API_KEY;
if (!baseUrl || !model || !apiKey) {
  throw new Error("Set MODEL_BASE_URL, MODEL_NAME and MODEL_API_KEY");
}

const provider = openaiCompatible({
  baseUrl,
  model,
  apiKey,
  api: "chat-completions",
  timeoutMs: 60_000,
});
const result = await provider.generate({
  system: "Answer concisely.",
  prompt: "Explain the difference between a model API and a coding agent.",
  maxOutputTokens: 512,
});
console.log(result.text);
console.log(result.usage ?? "Usage was not reported by the service");
```

Lancez :

```sh
node --env-file=.env example.mts
```

Le programme affiche la réponse complète et la consommation en tokens si le service la fournit. Aucun fichier du dépôt n’est inspecté ni modifié. Une requête infructueuse est rejetée et la commande se termine en erreur.

</details>

## Protocole et authentification

Choisissez `api: "chat-completions"` (par défaut) pour `POST <baseUrl>/chat/completions`, ou `api: "responses"` pour `POST <baseUrl>/responses`. Le choix est explicite ; le client ne retente jamais avec un autre protocole. Le [guide officiel de migration API](https://developers.openai.com/api/docs/guides/migrate-to-responses) explique les deux formats de messages. Cette implémentation traite uniquement le texte sans streaming et transmet `store: false` ; les règles de conservation du service restent applicables.

Passez explicitement la clé bearer dans `apiKey` ; aucune variable d’environnement hôte, aucun trousseau ni login CLI n’est découvert. Utilisez `apiKey: false` uniquement pour un endpoint volontairement sans authentification. Les URL ne peuvent contenir ni identifiants, ni requête, ni fragment, et les redirections sont refusées. `localhost` désigne la machine exécutant cet appel. Aucun nouveau SDK fournisseur n’est requis.

Le service doit accepter les champs du protocole choisi, notamment `max_completion_tokens` pour Chat Completions ou `max_output_tokens` pour Responses lorsque `maxOutputTokens` est défini. La sortie Responses doit contenir des messages d’assistant terminés. La mention « compatible OpenAI » ne prouve pas que chaque protocole ou modèle accepte ce sous-ensemble. La [configuration de modèle Codex](../../behavior/agents/connect-codex/#fournisseurs-de-modèles-compatibles-openai) existante reste un parcours distinct, limité à Responses et doté du harness Codex.

## Limites, résultats et erreurs

Chaque appel est indépendant. Passez `signal` pour l’annuler ; `timeoutMs` vaut 120 secondes par défaut et couvre le corps complet de la réponse. `maxResponseBytes` vaut 8 Mio par défaut après décompression HTTP. Le client reste réutilisable après annulation ou échec et ne possède aucune sandbox à libérer.

Les erreurs HTTP, de transport ou de JSON, les sorties tronquées, les refus et les appels d’outils sont rejetés. Les champs de requête non pris en charge, dont les outils et le streaming, sont également refusés. Les erreurs omettent le corps distant et les identifiants. Aucune répétition automatique ne risque de doubler un appel facturable. La consommation reste absente si le service l’omet ; elle n’est ni une estimation de facturation ni une déclaration automatique aux budgets de workflow. L’annulation HTTP ne prouve pas que le service distant a arrêté la génération ou sa facturation.

## Deuxième phase : le harness d’agent

Le harness prévu reliera les tours du modèle à des outils contrôlés : lecture et modification de fichiers, commandes via les baux de sandbox, retour des résultats d’outils au modèle, gestion du contexte et des conversations, budgets d’exécution et annulation. L’intégration au dispatch, à la récupération et aux réponses structurées nécessite ses propres contrats et validations. Aucune de ces capacités n’est incluse dans la première phase.

Les tests actuels couvrent des endpoints HTTP locaux simulés. La compatibilité avec des services authentifiés et le harness restent des travaux de validation distincts dans la [feuille de route](../../../project/roadmap/#direct-model-harness).

[Référence des fournisseurs de modèles](../../../reference/overview/model-providers/) · [openaiCompatible](../../../reference/openaicompatible/)
