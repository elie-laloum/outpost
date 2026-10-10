---
title: "Exploiter un serveur de webhooks"
description: "Interprétez les réponses, dédupliquez les livraisons et renouvelez les secrets."
---

Partez de [webhooks](../webhooks/) et de sa configuration. Interprétez les réponses, dédupliquez les livraisons et renouvelez les secrets.

## Lire la réponse HTTP

| Statut | Signification                                                                       |
| ------ | ----------------------------------------------------------------------------------- |
| `202`  | Job publié, ou déjà publié pour cette livraison. Le corps vaut `{"job": "<id>"}`.   |
| `204`  | Événement vérifié ignoré : `on()` a renvoyé `undefined`.                            |
| `400`  | Le corps de la requête n’a pas pu être lu.                                          |
| `401`  | Vérification échouée : signature, secret, fenêtre d’horodatage ou en-tête manquant. |
| `404`  | Aucune route pour ce chemin.                                                        |
| `405`  | Méthode autre que `POST`.                                                           |
| `413`  | Corps au-delà de `maxBytes` : 1 Mio par défaut, 25 Mio au plus.                     |
| `500`  | `on()` a levé une erreur ou renvoyé un job invalide.                                |
| `503`  | La file a refusé le job. L’émetteur peut renvoyer la même livraison.                |

Les routes Slack répondent `200` avec un corps vide au lieu de `202` et `204`. `onError` reçoit le `path`, l’étape `stage` (`verify`, `route` ou `enqueue`) et la `delivery` de l’échec, jamais un secret.

## Éviter les jobs en double

L’identifiant du job contient l’identifiant de livraison. Une nouvelle tentative de l’émetteur ou une relivraison manuelle le réutilise : la file garde un seul job tant qu’elle le conserve.

Une nouvelle livraison publie un nouveau job, même pour le même événement, comme un label ajouté à nouveau. C’est le `runId` qui décide si le travail est refait. Les traitements qui publient un résultat ont toujours besoin de leurs propres [clés d’idempotence](../job-queues/).

## Identifier l’exécution à partir de l’événement

Construisez le `runId` à partir de ce qui identifie le travail dans la charge : `owner/name#12`, ou un commit de tête. Les jobs de même `runId` et de même `input` partagent un [checkpoint](../durable-runs/) : `defineWorkflowJob()` restaure les tâches déjà terminées au lieu de les relancer.

Un `input` différent sous le même `runId` échoue sur un checkpoint incompatible, car la version du checkpoint inclut une empreinte de l’input. Deux commandes au texte différent sur une même issue ont donc besoin de `runId` distincts, par exemple en y ajoutant `event.delivery`.

Les signatures GitHub ne portent pas d’horodatage : une requête interceptée peut être rejouée sous un nouvel identifiant de livraison. Un `runId` dérivé de la charge fait converger ce rejeu vers la même exécution. La recette [Relire une pull request à la demande](../review-on-label/) associe chaque exécution au commit de tête.

## Renouveler un secret

Chaque option de secret accepte aussi une fonction qui renvoie les secrets acceptés à cet instant. La source l’appelle à chaque requête.

```ts
import { createGithubWebhook } from "@elie-laloum/outpost";

const source = createGithubWebhook({
  secret: () =>
    [
      process.env.GITHUB_WEBHOOK_SECRET,
      process.env.GITHUB_WEBHOOK_SECRET_PREVIOUS,
    ].filter((value) => value !== undefined),
});
```

Acceptez les deux secrets, changez le secret chez l’émetteur, puis retirez l’ancien. Une fonction qui lève une erreur ou ne renvoie aucun secret refuse toutes les requêtes avec `401`.

## Exploiter le serveur

`serveTriggers()` écoute par défaut sur `127.0.0.1` ; `host` et `port` le modifient. Placez devant lui un reverse proxy qui termine TLS, et n’exposez que les chemins des routes.

```ts
import type { DurableTaskQueue, TriggerServer } from "@elie-laloum/outpost";

declare const server: TriggerServer;
declare const queue: DurableTaskQueue;

process.once("SIGTERM", async () => {
  await server.close();
  queue.close();
});
```

Fermez d’abord le serveur, pour qu’aucune requête n’atteigne une file fermée.

## Limites

- Outpost n’appelle pas les API GitHub, GitLab ou Slack : votre workflow publie les commentaires ou messages sur le résultat.
- L’Events API de Slack et son défi de vérification d’URL ne sont pas pris en charge.
- Démarrez ce serveur TypeScript depuis votre script. Un projet YAML peut déclarer un service de déclenchement et le lancer avec [`outpost recipe serve --service`](../recipe-services/).

API : [serveTriggers](../../reference/servetriggers/) · [createGithubWebhook](../../reference/creategithubwebhook/) · [createGitlabWebhook](../../reference/creategitlabwebhook/) · [createSlackSource](../../reference/createslacksource/) · [createStandardWebhook](../../reference/createstandardwebhook/) · [labelAdded](../../reference/labeladded/) · [commandIssued](../../reference/commandissued/) · [TriggerEvent](../../reference/triggerevent/) · [TriggerJob](../../reference/triggerjob/) · [defineWorkflowJob](../../reference/defineworkflowjob/).
