---
title: "Envoyer des consignes pendant une tâche"
description: "Donnez une nouvelle consigne à un agent en cours d’exécution et suivez sa transmission."
---

La réorientation ajoute une consigne à une tâche active sans l’annuler. Conservez la promesse renvoyée par `send()` pour distinguer livraison et échec ; une consigne livrée n’est pas nécessairement suivie par l’agent.

## Envoyer une consigne

Créez un contrôleur de réorientation et passez-le à la tâche. Pendant l’exécution, `send()` envoie une nouvelle consigne et se termine lorsqu’Outpost peut indiquer comment elle a été transmise.

```ts
import { createSteering, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const steering = createSteering();
const running = dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/auth-refactor" },
  brief: { text: "Refactor the auth module." },
  steering,
});
const delivery = await steering.send("Leave the legacy/ folder untouched.");
console.log(delivery.mode);
// Example output: "injected" ou "resumed"
const result = await running;
```

`send()` se résout quand l’agent reçoit le texte, pas quand il l’a appliqué. L’agent le lit comme un message utilisateur de plus ; le brief reste valable.

## Comment la consigne arrive à chaque agent

| Agent                                                                                      | `mode`     | Ce qui se passe                                                                                                                     |
| ------------------------------------------------------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [Harness intégré](../harness/)                                                             | `injected` | Ajoutée à la requête suivante au modèle, après les résultats d’outils en cours. Un modèle qui allait terminer continue.             |
| [Claude Code](../claude-code/)                                                             | `injected` | Écrite sur son entrée stream-json. Elle rejoint le tour en cours, ou passe ensuite dans le même processus si Claude répondait déjà. |
| [Codex](../codex/)                                                                         | `injected` | Un dispatch avec `steering` lance `codex app-server`. `turn/steer` ajoute le texte au tour actif, ou démarre le suivant.            |
| [Copilot CLI](../copilot-cli/), [Kimi Code](../kimi-code/), [Antigravity](../antigravity/) | `resumed`  | Outpost arrête le processus dès que sa conversation est connue, puis la reprend avec le texte dans la même sandbox.                 |

Avec `resumed`, l’action en cours est interrompue, mais les fichiers déjà modifiés restent dans le workspace. Tous les fournisseurs de sandbox transmettent l’entrée en direct ; sur Vercel et Daytona, chaque consigne coûte une commande du fournisseur et arrive avec un léger délai.

## Selon le moment de l’envoi

| Vous l’envoyez                               | Ce qui se passe                                                                     | `mode`                 |
| -------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| Avant le démarrage de l’agent                | Ajoutée au prompt.                                                                  | `injected`             |
| Pendant le tour                              | Remise comme dans le tableau ci-dessus.                                             | `injected` / `resumed` |
| Après la réponse de l’agent                  | Outpost reprend la conversation dans un nouveau tour : le résultat en tient compte. | `resumed`              |
| Quand aucun dispatch n’utilise le contrôleur | Attend le prochain dispatch qui reçoit le contrôleur.                               | ―                      |

Une consigne que le dispatch ne peut pas remettre, par exemple parce que l’agent n’a jamais signalé de conversation, est rejetée à la fin du dispatch. Le rejet est une [`OutpostError`](../error-handling/) de code `steering`, avec le texte dans `details.text`.

## Envoyer une consigne à un sous-agent

Chaque exécution d’un [sous-agent intégré](../subagents/) a un identifiant, fourni par son événement `subagent`. Passez-le dans `subagent` pour ne viser que cette exécution.

```ts
import { createSteering, type DispatchOptions } from "@elie-laloum/outpost";

const steering = createSteering();
const request: DispatchOptions = {
  brief: { text: "Review the repository." },
  steering,
  observe(event) {
    if (event.kind !== "subagent" || event.status !== "started") return;
    if (event.name === "inspect")
      void steering.send("Only inspect src/.", { subagent: event.id });
  },
};
```

Référence API : [SteeringSendOptions](../../reference/steeringsendoptions/).

Une consigne encore en attente quand son exécution se termine est rejetée avec le code `steering` et l’identifiant dans `details.subagent`.

## Réutiliser le contrôleur

Un contrôleur sert un dispatch à la fois, sur toutes ses passes ; l’attacher à un second dispatch concurrent échoue. Une fois un dispatch terminé, le suivant peut l’utiliser. `close()` rejette les consignes en attente et tout `send()` ultérieur.

`result.resume()` et `result.fork()` n’en héritent pas : repassez `steering` dans leurs options.

Dans un workflow, renvoyez `steering` depuis la `request` d’un [`defineAgentTask()` ou d’un `defineIsolatedTask()`](../task-dependencies/). Avec un [agent de secours](../fallback-agents/), la réorientation suit le candidat en cours d’exécution.

## Événements et consommation

Chaque remise émet un [événement d’agent](../progress/) `steer` avec `text`, `mode`, `pass`, et `subagentId` quand un sous-agent l’a reçue. Le reporter de terminal l’affiche, et la conversation l’enregistre comme message utilisateur.

Une remise `resumed` termine le tour interrompu par un événement `stopped` de raison `steered` ; ce tour figure dans `result.turns` avec `interrupted: "steering"`. Une passe émet toujours un seul `summary`, et `result.usage` inclut les tours interrompus. Un [rejeu](../record-replay/) reproduit les exécutions réorientées tour par tour.

## Limites

- Les consignes vivent en mémoire. Pour des questions et réponses qui doivent survivre à un redémarrage, utilisez les [tâches interactives](../interactive-tasks/).
- Un dispatch avec `steering` refuse les agents qui ne peuvent ni recevoir d’entrée en direct ni reprendre une conversation, dont les [agents de rejeu](../record-replay/).
- La réorientation de Codex utilise le protocole `app-server`, que Codex marque comme expérimental.
- Les sous-agents des agents CLI ne sont pas adressables : une consigne avec `subagent` est rejetée dès qu’un tour CLI la voit.

API : [createSteering](../../reference/createsteering/) · [Steering](../../reference/steering/) · [SteeringSendOptions](../../reference/steeringsendoptions/) · [SteeringDelivery](../../reference/steeringdelivery/) · [DispatchOptions](../../reference/dispatchoptions/).
