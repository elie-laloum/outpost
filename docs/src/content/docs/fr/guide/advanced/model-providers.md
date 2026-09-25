---
title: Fournisseurs de modèles et harness personnalisés (expérimental)
description: Composer un transport de requêtes modèle avec un harness fourni par l’appelant.
sidebar:
  order: 8
---

:::caution[API non publiée]
Cette API de l’arbre de travail remplace le client direct expérimental de 4.2.0. Utilisez un package construit depuis ce checkout. Elle fournit des requêtes texte bornées et un callback personnalisé, sans boucle d’outils intégrée, streaming ni conversations natives personnalisées.
:::

`openaiModelProvider()` configure un service HTTP utilisant Chat Completions ou Responses. `anthropicModelProvider()` utilise Anthropic Messages. Le harness porte le fournisseur ; l’agent sélectionne son modèle avec une chaîne. Un modèle inconnu ou inaccessible échoue lors de l’appel au service, sans catalogue ni substitution.

Un `sandboxProvider` alloue l’environnement d’exécution. Ses constructeurs sont explicites, comme `dockerSandboxProvider()` et `localSandboxProvider()`. Les fournisseurs de modèles n’allouent pas de sandbox.

## Exécuter un harness personnalisé

<details>
<summary>Préparation complète et exemple exécutable</summary>

Utilisez Node.js 24+, npm et Git. Construisez ce checkout avec `npm ci` et `npm run build`. Dans un nouveau dossier, installez ce package local :

```sh
mkdir model-example
cd model-example
npm init -y
npm install /absolute/path/to/outpost
git init
git -c user.name=Example -c user.email=example@example.test commit --allow-empty -m "Initial"
```

Créez un fichier `.env` ignoré contenant `MODEL_BASE_URL`, `MODEL_NAME` et `MODEL_API_KEY`. Le service reçoit le prompt et peut facturer l’usage API ; les credentials d’abonnement CLI ne sont pas utilisés.

Enregistrez **example.mts** :

```ts
import {
  agent,
  harness,
  dispatch,
  openaiModelProvider,
} from "@elie-laloum/outpost";
import { localSandboxProvider } from "@elie-laloum/outpost/providers/local";

const baseUrl = process.env.MODEL_BASE_URL;
const model = process.env.MODEL_NAME;
const apiKey = process.env.MODEL_API_KEY;
if (!baseUrl || !model || !apiKey) {
  throw new Error("Set MODEL_BASE_URL, MODEL_NAME and MODEL_API_KEY");
}

const worker = agent({
  model,
  harness: harness({
    modelProvider: openaiModelProvider({ baseUrl, apiKey }),
    async run(input, context) {
      return context.modelProvider.request({
        model: context.model,
        system: "Answer concisely.",
        prompt: input.prompt,
        maxOutputTokens: 512,
      });
    },
  }),
});

const result = await dispatch({
  repository: import.meta.dirname,
  sandboxProvider: localSandboxProvider(),
  agent: worker,
  brief: { text: "Explain the difference between a model and a harness." },
});
console.log(result.text);
console.log(result.usage);
```

Lancez `node --env-file=.env example.mts`. La commande affiche la réponse et l’usage cumulé rapporté, puis ferme son sandbox. Ce callback n’exécute aucune commande de dépôt. `localSandboxProvider()` exécute sur l’hôte sans isolation.

</details>

## Propriété et limites des requêtes

Le callback tourne dans le processus Outpost. Utilisez `context.sandbox` pour les commandes et transferts du dépôt, et attendez toutes les opérations. Le lease est emprunté et ne peut pas être libéré par le harness. Commandes et requêtes héritent de l’annulation de la passe ; le JavaScript arbitraire doit respecter `context.signal`. Outpost attend la fin des opérations suivies avant de terminer la passe.

Les requêtes via `context.modelProvider` utilisent le modèle de l’agent et cumulent une seule fois l’usage rapporté, même si le résultat final répète l’usage du dernier appel. Sans ces rapports, le callback peut renvoyer son propre usage. Les observations ne remplacent pas le résultat comptabilisé et ne créent pas de conversations. Reprise, fork, réparations automatiques et terminal interactif sont absents pour les harness personnalisés.

Le protocole OpenAI utilise `chat-completions` par défaut ; sélectionnez explicitement `api: "responses"` si nécessaire. Aucun retry automatique, suivi de redirection ni repli de protocole. Les clés sont explicites, les URL ne peuvent pas embarquer de credentials et les erreurs omettent les corps distants. `localhost` désigne le processus Outpost, même lorsque les commandes du dépôt tournent dans un sandbox distant. Une annulation ne prouve pas l’arrêt de la génération ni de la facturation distante.

## Anthropic et cache système

Configurez `anthropicModelProvider({ apiKey, maxOutputTokens: 512, cacheSystem: true })` comme fournisseur du harness. Chaque requête doit alors fournir des instructions système. Le fournisseur place un point de cache éphémère sur ce texte. Éligibilité et lectures effectives dépendent du service, selon le [contrat de cache Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

`usage.input` inclut l’entrée non cachée, la création et la lecture de cache ; `cached` et `cacheCreated` en sont des sous-ensembles, pas des totaux supplémentaires. Le fournisseur utilise [Messages](https://platform.claude.com/docs/en/api/messages/create), avec une limite positive de sortie par défaut obligatoire et remplaçable par requête. Les réponses d’outils, refus et sorties incomplètes sont rejetés.

[Référence des fournisseurs de modèles](../../../reference/overview/model-providers/) · [Moteur d’outils restant](../../../project/roadmap/#direct-model-harness)
