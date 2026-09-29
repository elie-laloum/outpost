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

| Agent et sandbox                                                                                            | Remise                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Harness intégré](../model-loop/)                                                                           | `injected` : ajoutée avant la requête suivante au modèle, après les résultats d’outils en cours. Si le modèle allait terminer, il continue avec la consigne.                                                                |
| [Claude Code](../claude-code/) sur [Docker](../docker/), [Podman](../podman/) ou l’[hôte](../host-process/) | `injected` : écrite sur l’entrée stream-json de Claude. Lue pendant un appel d’outil, elle rejoint le tour en cours ; lue pendant que Claude rédige sa réponse finale, elle devient un tour en file dans le même processus. |
| Codex, Copilot CLI, Kimi Code, Antigravity, et Claude Code sur Vercel, Daytona ou Firecracker               | `resumed` : Outpost arrête le processus dès que sa conversation est connue, garde le sandbox, puis reprend la même conversation avec la consigne. L’action en cours est interrompue.                                        |

Les fichiers déjà modifiés par l’agent restent dans le workspace. Avec une remise `resumed`, le tour interrompu figure dans `result.turns` avec `interrupted: "steering"` et émet un événement `stopped` de raison `steered`.

Ce partage vient des CLI des agents. Claude Code accepte des messages utilisateur sur stdin pendant qu’il travaille ; `codex exec` et les modes prompt de Copilot et Kimi prennent un seul prompt ; Antigravity met chaque message stdin en file comme un tour séparé. Vercel, Daytona et Firecracker préparent stdin avant le démarrage de la commande.

## Moment de l’envoi

- **Avant le début du tour.** Les messages envoyés avant que le dispatch atteigne son agent sont ajoutés au prompt.
- **Pendant le tour.** Remise décrite ci-dessus.
- **Après la réponse de l’agent.** Outpost reprend la conversation dans un nouveau tour de la même passe : le résultat reflète toujours la dernière consigne. Cela vaut pour tout agent capable de reprendre, harness intégré et Claude Code compris.

Un message que le dispatch ne peut pas remettre est rejeté à la fin du dispatch, par exemple si l’agent s’est arrêté sans signaler de conversation. Le rejet est une `OutpostError` de code `steering`, avec le texte dans `details.text`.

## Cycle de vie

Un contrôleur sert un dispatch à la fois et peut être réutilisé pour le suivant. L’attacher à un second dispatch concurrent échoue. Les messages envoyés quand aucun dispatch ne tourne attendent le prochain dispatch qui utilise le contrôleur ; `close()` les rejette, ainsi que tout `send()` ultérieur.

`dispatch()` partage un même contrôleur entre ses passes. `result.resume()` et `result.fork()` ne le réutilisent pas : repassez `steering`. Dans un workflow, renvoyez-le depuis la `request` d’un [`agentTask` ou d’un `isolatedTask`](../task-dependencies/).

Avant de s’exécuter, un dispatch refuse les agents qui ne peuvent ni recevoir d’entrée en direct ni reprendre une conversation : les [agents de rejeu](../record-replay/) et les adapters avec `resumable: false`. Les candidats d’un [agent de secours](../agent-fallback/) sont validés de la même façon, et le pilotage suit le candidat en cours d’exécution.

## Événements, historique et usage

Chaque remise émet un [événement d’agent](../live-events/) `steer` avec `text`, `mode` et `pass` ; le reporter de terminal l’affiche. Les transcripts du harness et les sessions Claude Code enregistrent la consigne comme message utilisateur. Une passe émet toujours un seul `summary`, et `result.usage` inclut les tours interrompus.

## Limites

- Les consignes vivent en mémoire. Pour des questions et réponses qui doivent survivre à un redémarrage, utilisez les [tâches interactives](../interactive-tasks/).
- Les [sous-agents](../model-loop/) intégrés ne reçoivent pas les consignes ; seule la boucle principale les reçoit.
- Rejouer le journal d’un run piloté diverge au prompt de reprise.
- L’injection Claude Code a été vérifiée une fois avec Claude Code 2.1.282. L’interruption et la reprise pour Codex, Copilot, Kimi et Antigravity sont couvertes par des tests déterministes avec des CLI simulées et un sandbox Docker réel, pas par des exécutions réelles.

API : [createSteering](../../reference/createsteering/) · [Steering](../../reference/steering/) · [SteeringDelivery](../../reference/steeringdelivery/) · [DispatchOptions](../../reference/dispatchoptions/).
