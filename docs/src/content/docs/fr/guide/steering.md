---
title: "Piloter un agent en cours"
description: "Envoyer une consigne à un agent qui travaille déjà."
---

Implémenté, pas encore publié. `createSteering()` renvoie un contrôleur que vous passez à un dispatch avec `steering`. Pendant le dispatch, `send()` transmet une consigne à son agent sans annuler le travail.

```ts
import { createSandbox, createSteering } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
const steering = createSteering();
const running = sandbox.dispatch({
  brief: { text: "Refactorise le module d’authentification." },
  steering,
});
const delivery = await steering.send("Ne touche pas au dossier legacy/.");
console.log(delivery.mode); // "injected" ou "resumed"
const result = await running;
```

`send()` se résout quand l’agent reçoit le texte, pas quand il l’a appliqué. La consigne ne remplace pas le brief : l’agent la lit comme un message utilisateur supplémentaire.

## Comment la consigne arrive à l’agent

| Agent                               | Remise                                                                                                                                                                                                                      |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Harness intégré](../model-loop/)   | `injected` : ajoutée avant la requête suivante au modèle, après les résultats d’outils en cours. Si le modèle allait terminer, il continue. Pendant qu’un sous-agent intégré travaille, c’est lui qui reçoit la consigne.   |
| [Claude Code](../claude-code/)      | `injected` : écrite sur l’entrée stream-json de Claude. Lue pendant un appel d’outil, elle rejoint le tour en cours ; lue pendant que Claude rédige sa réponse finale, elle devient un tour en file dans le même processus. |
| [Codex](../codex/)                  | `injected` : Codex s’exécute en `codex app-server` pour les dispatchs pilotés et reçoit la consigne avec `turn/steer` dans le tour actif. Sans tour actif, elle démarre le tour suivant du fil.                             |
| Copilot CLI, Kimi Code, Antigravity | `resumed` : Outpost arrête le processus dès que sa conversation est connue, garde le sandbox, puis reprend la même conversation avec la consigne. L’action en cours est interrompue.                                        |

Tous les fournisseurs acceptent l’entrée en direct : local, Docker et Podman transmettent stdin, Firecracker le fait passer par SSH, et Vercel et Daytona ajoutent des morceaux encadrés à un fichier qu’un petit wrapper Node du sandbox transmet à l’agent. Sur Vercel et Daytona, chaque consigne coûte une commande du fournisseur et arrive environ une à deux secondes plus tard.

Les fichiers déjà modifiés par l’agent restent dans le workspace. Avec une remise `resumed`, le tour interrompu figure dans `result.turns` avec `interrupted: "steering"` et émet un événement `stopped` de raison `steered`.

Ce partage vient des CLI des agents : `copilot -p` et `kimi --prompt` prennent un seul prompt, et Antigravity met chaque message stdin en file comme un tour séparé.

## Cibler un sous-agent

Chaque délégation à un [sous-agent intégré](../model-loop/) a un identifiant d’exécution, fourni par son événement `subagent` et porté comme `subagentId` par ses autres événements. Passez-le à `send()` pour viser cette exécution :

```ts
import { createSteering, type DispatchOptions } from "@elie-laloum/outpost";

const steering = createSteering();
const request: DispatchOptions = {
  brief: { text: "Passe en revue le dépôt." },
  steering,
  observe(event) {
    if (event.kind !== "subagent" || event.status !== "started") return;
    if (event.name === "inspect")
      void steering.send("N’inspecte que src/.", { subagent: event.id });
  },
};
```

| Option `subagent` | Destinataire                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| absente           | La première boucle active qui atteint une limite d’étape : le sous-agent au travail, s’il y en a un. |
| un identifiant    | Seulement cette exécution de sous-agent, à toute profondeur.                                         |
| `null`            | Seulement la boucle principale, après le retour de la délégation en cours.                           |

Une consigne encore adressée à une exécution quand celle-ci se termine est rejetée avec le code `steering` et l’identifiant dans `details.subagent`. Les agents CLI ne peuvent pas viser leurs propres sous-agents : une consigne ciblée est rejetée dès qu’un tour CLI la voit.

## Moment de l’envoi

- **Avant le début du tour.** Les messages envoyés avant que le dispatch atteigne son agent sont ajoutés au prompt.
- **Pendant le tour.** Remise décrite ci-dessus.
- **Après la réponse de l’agent.** Outpost reprend la conversation dans un nouveau tour de la même passe : le résultat reflète toujours la dernière consigne. Cela vaut pour tout agent capable de reprendre, harness intégré et Claude Code compris.

Un message que le dispatch ne peut pas remettre est rejeté à la fin du dispatch, par exemple si l’agent s’est arrêté sans signaler de conversation. Le rejet est une `OutpostError` de code `steering`, avec le texte dans `details.text`.

## Cycle de vie

Un contrôleur sert un dispatch à la fois et peut être réutilisé pour le suivant. L’attacher à un second dispatch concurrent échoue. Les messages envoyés quand aucun dispatch ne tourne attendent le prochain dispatch qui utilise le contrôleur ; `close()` les rejette, ainsi que tout `send()` ultérieur.

`dispatch()` partage un même contrôleur entre ses passes. `result.resume()` et `result.fork()` ne le réutilisent pas : repassez `steering`. Dans un workflow, renvoyez-le depuis la `request` d’un [`defineAgentTask` ou d’un `defineIsolatedTask`](../task-dependencies/).

Avant de s’exécuter, un dispatch refuse les agents qui ne peuvent ni recevoir d’entrée en direct ni reprendre une conversation : les [agents de rejeu](../record-replay/) et les adapters avec `resumable: false`. Les candidats d’un [agent de secours](../agent-fallback/) sont validés de la même façon, et le pilotage suit le candidat en cours d’exécution.

## Événements, historique et usage

Chaque remise émet un [événement d’agent](../live-events/) `steer` avec `text`, `mode` et `pass`, ainsi que `subagentId` quand un sous-agent l’a reçue ; le reporter de terminal l’affiche. Les transcripts du harness et les sessions natives enregistrent la consigne comme message utilisateur. Une passe émet toujours un seul `summary`, et `result.usage` inclut les tours interrompus.

Le [rejeu](../record-replay/) d’un run piloté reproduit ses tours : chaque consigne `resumed` ouvre le tour enregistré suivant, et le tour interrompu garde `interrupted: "steering"`, son propre texte et son usage.

## Limites

- Les consignes vivent en mémoire. Pour des questions et réponses qui doivent survivre à un redémarrage, utilisez les [tâches interactives](../interactive-tasks/).
- Quand plusieurs sous-agents tournent en même temps, une consigne sans cible va au premier qui atteint une limite d’étape ; passez un identifiant d’exécution pour choisir.
- Le pilotage de Codex utilise le protocole `app-server`, que Codex marque comme expérimental. Son ouverture de session et sa gestion des échecs ont été vérifiées avec Codex 0.155 ; une exécution réelle de `turn/steer` reste à faire.
- L’injection Claude Code a été vérifiée en réel sur l’hôte, Daytona et Vercel. L’interruption et la reprise pour Copilot, Kimi et Antigravity sont couvertes par des CLI simulées et un sandbox Docker réel, pas par des exécutions réelles.

API : [createSteering](../../reference/createsteering/) · [Steering](../../reference/steering/) · [SteeringDelivery](../../reference/steeringdelivery/) · [DispatchOptions](../../reference/dispatchoptions/).
