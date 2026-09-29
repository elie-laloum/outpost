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

Réutiliser une sandbox partage les fichiers, pas le contexte conversationnel. Utilisez l’[historique de discussion](../conversations/) pour reprendre une conversation capturée.

## Propriété

Une sandbox créée sans workspace possède celui qu’elle crée. Une sandbox qui emprunte un workspace explicite le laisse ouvert. La fermeture est idempotente ; elle attend les opérations actives et libère les ressources possédées.

Les opérations sur une même sandbox sont exclusives. Attendez chaque commande ou requête. Pour paralléliser, allouez des sandboxes distinctes et coordonnez-les avec les [dépendances des tâches](../task-dependencies/).

## Accès interactif

`sandbox.attach()` connecte un terminal à l’agent sélectionné. Docker, Podman, l’exécution locale et Daytona prennent en charge cet accès ; Vercel le rejette. L’attachement exige un véritable terminal et ne remplace pas une commande sans interface.

API : [createSandbox](../../reference/createsandbox/) · [Sandbox](../../reference/sandbox/) · [attach](../../reference/attach/).

## Exécution des processus

Appelez `sandbox.command(command)` dans une [session de sandbox](../sandbox-sessions/) ouverte. Le résultat comprend `status`, `stdout` et `stderr`. Un code de sortie non nul est un résultat de commande : vérifiez-le explicitement.

```ts title="command.mts"
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const sandbox = await createSandbox({ repository, sandboxProvider });
try {
  const result = await sandbox.command({
    executable: "node",
    arguments: ["--version"],
  });
  if (result.status !== 0) throw new Error(result.stderr);
  console.log(result.stdout.trim());
} finally {
  await sandbox.close();
}
```

Pour les commandes longues, ajoutez diffusion et limites :

```ts
import type { Command } from "@elie-laloum/outpost";

const testCommand: Command = {
  executable: "npm",
  arguments: ["test"],
  deadlineMs: 120_000,
  retain: 100_000,
  observe(channel, text) {
    if (channel === "stderr") process.stderr.write(text);
  },
};
```

### Arguments et répertoires

`arguments` est un tableau transmis à l’exécutable. Les opérateurs shell ne sont pas développés automatiquement ; invoquez explicitement un shell pour les pipelines. `directory` sélectionne le répertoire de travail dans la sandbox. `variables` ajoute les valeurs d’environnement de la commande ; `stdin` fournit son entrée texte.

### Sortie et fin d’exécution

`observe` diffuse la sortie tandis que `retain` borne la quantité conservée. Une commande se termine lorsque son processus sort, même si ses flux se sont fermés plus tôt. Ne déduisez pas la réussite du texte sur stdout.

### Annulation

Fournissez `signal` ou `deadlineMs` pour arrêter un processus. Les fournisseurs terminent son groupe de processus et ses descendants lorsqu’ils le permettent, en gardant la sandbox réutilisable. Un signal n’arrête pas du JavaScript arbitraire ; les outils et tâches personnalisés doivent coopérer.

Les fichiers binaires passent par les méthodes de transfert du fournisseur, pas par une sortie texte capturée. Voir [Échange de fichiers](../cloud-sandboxes/).

API : [Command](../../reference/command/) · [CommandResult](../../reference/commandresult/).
