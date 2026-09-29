---
title: "Sessions de sandbox"
description: "Garder une sandbox ouverte pour enchaîner tours d’agent, commandes de test et terminal interactif dans le même environnement."
---

## Ouvrir une sandbox

`createSandbox()` alloue une sandbox et la garde ouverte jusqu’à ce que vous la fermiez. Les tours d’agent et les commandes partagent alors ses fichiers et ses dépendances installées. `await using` la ferme à la fin du bloc.

```ts title="session.mts"
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
await sandbox.dispatch({ brief: { text: "Fix the failing date tests." } });
const tests = await sandbox.command({
  executable: "npm",
  arguments: ["test"],
});
console.log(tests.status === 0 ? "Tests pass" : tests.stderr);
```

L’agent modifie le worktree, puis `npm test` s’exécute dans la même sandbox, sur ses modifications. La différence avec un `dispatch()` ponctuel, et qui ferme quoi, sont expliquées dans [Fonctionnement d’Outpost](../how-it-works/).

## Lancer des tours d’agent

`sandbox.dispatch()` accepte le même brief et les mêmes options de tour que `dispatch()`, sans les réglages de dépôt et de sandbox. Chaque appel démarre une nouvelle conversation : poursuivez-en une avec `sandbox.resume(id, options)` ou `sandbox.fork(id, options)` ([Conversations](../conversations/)).

Un `agent` passé à `sandbox.dispatch()` remplace celui donné à `createSandbox()`.

## Exécuter une commande

`sandbox.command()` lance un exécutable avec un tableau d’arguments. Aucun shell ne les interprète : `*`, `|` et `$HOME` arrivent au programme tels quels. Appelez vous-même un shell quand il vous en faut un.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({ repository, sandboxProvider });
const result = await sandbox.command({
  executable: "sh",
  arguments: ["-c", "npm test 2>&1 | tail -n 20"],
  directory: `${sandbox.root}/packages/api`,
  variables: { CI: "1" },
});
console.log(result.status, result.stdout);
```

`sandbox.root` est le chemin du dépôt dans la sandbox et le répertoire de travail par défaut.

| Option       | Effet                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| `executable` | Programme à lancer, obligatoire.                                                                           |
| `arguments`  | Arguments transmis tels quels, sans expansion shell.                                                       |
| `directory`  | Répertoire de travail dans la sandbox. Par défaut, `sandbox.root`.                                         |
| `variables`  | Valeurs d’environnement propres à cette commande ([Variables d’environnement](../environment-variables/)). |
| `stdin`      | Texte écrit sur l’entrée standard, qui se ferme ensuite.                                                   |
| `input`      | Flux `Readable` écrit après `stdin` ; l’entrée standard reste ouverte jusqu’à sa fin.                      |
| `observe`    | Callback qui reçoit chaque fragment de `stdout` ou `stderr` dès son arrivée.                               |
| `retain`     | Nombre de derniers caractères conservés par flux dans le résultat. Par défaut, 65 536.                     |
| `deadlineMs` | Durée maximale avant qu’Outpost arrête le processus. Par défaut, 10 minutes.                               |
| `signal`     | `AbortSignal` qui annule la commande.                                                                      |
| `elevated`   | Exécute en root sur les providers qui le permettent : Docker, Podman, Vercel et Daytona.                   |

## Vérifier le résultat

Une commande qui se termine résout avec `status`, `stdout` et `stderr`, quel que soit son code de sortie. Une commande qu’Outpost a dû arrêter rejette.

| Issue                                    | Résultat                                           |
| ---------------------------------------- | -------------------------------------------------- |
| Le processus sort, même avec le statut 1 | Résout ; testez `result.status`.                   |
| `deadlineMs` expire                      | Rejette avec une `OutpostError` de code `timeout`. |
| `signal` est déclenché                   | Rejette avec la raison du signal.                  |
| La sandbox se ferme pendant la commande  | Rejette ; le processus est arrêté.                 |

Le résultat attend la sortie du processus, pas la fermeture de ses flux. Lisez `status` plutôt que de déduire la réussite de `stdout`. Les codes d’erreur sont listés dans [Erreurs](../error-handling/).

## Suivre une commande longue

`observe` affiche la sortie pendant l’exécution. `retain` borne seulement ce que garde le résultat, pas ce que reçoit `observe`.

```ts
import type { Command } from "@elie-laloum/outpost";

const build: Command = {
  executable: "npm",
  arguments: ["run", "build"],
  deadlineMs: 120_000,
  observe(channel, text) {
    (channel === "stderr" ? process.stderr : process.stdout).write(text);
  },
};
```

Passez-le à `sandbox.command(build)`. Arrêter une commande termine son groupe de processus et ses descendants. La sandbox reste ouverte pour l’opération suivante.

:::caution
Une exception levée dans `observe` arrête la commande, qui rejette alors avec cette exception.
:::

## Ouvrir un terminal interactif

`sandbox.attach()` lance la CLI de l’agent dans votre terminal, à l’intérieur de la sandbox. Vous travaillez avec elle à la main ; l’appel résout quand vous quittez, avec `status` et les `commits` créés pendant la session.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
const session = await sandbox.attach({
  brief: { text: "Walk me through the payment module." },
});
console.log(session.status, session.commits);
```

Lancez-le depuis un vrai terminal. `continuation` rouvre une conversation capturée. La fonction [`attach()`](../../reference/attach/) de premier niveau ouvre et ferme sa propre sandbox, et applique la politique de branche quand la session sort avec le statut 0.

| Provider             | `attach()`     |
| -------------------- | -------------- |
| Docker, Podman, hôte | Pris en charge |
| Daytona              | Pris en charge |
| Vercel, Firecracker  | Rejeté         |

`attach()` exige un agent CLI comme Codex ou Claude Code. Le [harness intégré](../harness/) et les [agents de secours](../fallback-agents/) sont rejetés.

## Intégrer le travail vous-même

Une sandbox que vous créez ne fusionne jamais sa branche d’elle-même. Avec `branch: { mode: "integrate" }`, appelez `sandbox.workspace.integrate()` avant la fermeture pour fusionner la branche de travail dans sa base.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "integrate" },
});
await sandbox.dispatch({
  brief: { text: "Fix the failing tests and commit." },
});
const tests = await sandbox.command({ executable: "npm", arguments: ["test"] });
if (tests.status === 0) await sandbox.workspace.integrate();
```

Avec les autres modes de branche, `integrate()` ne fait rien. Un conflit de fusion, ou une branche de l’hôte changée pendant l’exécution, rejette avec le code `conflict` et conserve le worktree. `close({ preserve: true })` le conserve aussi pour inspection ([Récupérer du travail](../recovery/)).

## Limites

- Une sandbox exécute une opération à la fois : un second appel lancé pendant qu’une opération tourne est rejeté, pas mis en file. Utilisez des sandboxes distinctes pour le travail parallèle.
- La sortie est capturée sous forme de texte. Déplacez les fichiers binaires avec les méthodes de transfert du provider ([Sandboxes cloud](../cloud-sandboxes/)).

API : [createSandbox](../../reference/createsandbox/) · [Sandbox](../../reference/sandbox/) · [Command](../../reference/command/) · [CommandResult](../../reference/commandresult/) · [AttachOptions](../../reference/attachoptions/) · [attach](../../reference/attach/).
