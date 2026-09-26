---
title: "Sessions de sandbox"
description: "Réutiliser un environnement entre commandes et tours d’agent."
---

Utilisez `createSandbox()` pour partager les dépendances installées et les fichiers entre commandes et tours d’agent. Vous possédez la sandbox renvoyée et devez la fermer.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
try {
  await sandbox.dispatch({ brief: { text: "Inspect the test setup." } });
  const tests = await sandbox.command({
    executable: "npm",
    arguments: ["test"],
  });
  console.log(tests.status, tests.stdout);
} finally {
  await sandbox.close();
}
```

## Exécution à froid et à chaud

Un `dispatch()` de premier niveau possède sa sandbox et la ferme après utilisation. Chaque passe à froid alloue un environnement neuf. Le `dispatch()` d’une sandbox conserve l’environnement pour les opérations suivantes.

Réutiliser une sandbox partage les fichiers, pas le contexte conversationnel. Utilisez l’[historique de discussion](../chat-history/) pour reprendre une conversation capturée.

## Propriété

Une sandbox créée sans workspace possède celui qu’elle crée. Une sandbox qui emprunte un workspace explicite le laisse ouvert. La fermeture est idempotente ; elle attend les opérations actives et libère les ressources possédées.

Les opérations sur une même sandbox sont exclusives. Attendez chaque commande ou requête. Pour paralléliser, allouez des sandboxes distinctes et coordonnez-les avec les [dépendances des tâches](../task-dependencies/).

## Accès interactif

`sandbox.attach()` connecte un terminal à l’agent sélectionné. Docker, Podman, l’exécution locale et Daytona prennent en charge cet accès ; Vercel le rejette. L’attachement exige un véritable terminal et ne remplace pas une commande sans interface.

API : [createSandbox](../../reference/createsandbox/) · [Sandbox](../../reference/sandbox/) · [attach](../../reference/attach/).
