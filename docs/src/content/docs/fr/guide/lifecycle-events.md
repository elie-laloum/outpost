---
title: "Hooks de préparation"
description: "Préparer un workspace et une sandbox avant le travail."
---

Passez `hooks` dans les options du workspace ou de la sandbox pour lancer des commandes de préparation. Elles s’exécutent dans l’ordre déclaré ; une commande échouée arrête la préparation.

```ts
import type { LifecycleHooks } from "@elie-laloum/outpost";

const hooks: LifecycleHooks = {
  workspaceReady: [{ executable: "git", arguments: ["status", "--short"] }],
  sandboxReady: [{ executable: "npm", arguments: ["ci"] }],
};
```

## Choisir le lieu d’exécution

| Hook             | Exécution                                            |
| ---------------- | ---------------------------------------------------- |
| `workspaceReady` | Sur l’hôte après préparation du workspace Git.       |
| `hostReady`      | Sur l’hôte pendant la préparation de la sandbox.     |
| `sandboxReady`   | Dans la sandbox allouée avant le travail de l’agent. |

Installez les dépendances du projet dans `sandboxReady` pour correspondre à l’environnement d’exécution. Utilisez `workspaceReady` pour une préparation sur l’hôte liée à la durée de vie du workspace.

Une sandbox chaude ne rejoue pas la préparation avant chaque tour. Une allocation à froid la rejoue. Mettez en cache les téléchargements de paquets avec les [volumes de dépendances](../persistent-caches/) lorsque les installations répétées coûtent cher.

Ces hooks exécutent des commandes. Ceux de la boucle de modèle interceptent les appels d’outils et les événements du modèle : voir [Politiques des outils](../tool-policies/).

API : [LifecycleHooks](../../reference/lifecyclehooks/).
