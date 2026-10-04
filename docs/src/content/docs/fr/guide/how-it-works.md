---
title: "Fonctionnement"
description: "Trois briques indépendantes, le déroulé d’un run, qui possède quelle ressource et ce qui reste sur le disque."
---

<!-- features -->

- [Agent](../choose-an-agent/): Qui fait le travail : un harness qui exécute la boucle de l’agent et, en option, un modèle.
  - `createAgent()`
  - `createCodexHarness()`
  - `createHarness()`
- [Sandbox](../choose-a-sandbox/): Où les commandes s’exécutent. Docker par défaut.
  - Docker
  - Podman
  - Vercel
  - Daytona
  - Firecracker
  - hôte
- [Workspace](../repository-and-branch/): Le checkout que l’agent modifie, et la branche où atterrissent ses commits.
  - `current`
  - `named`
  - `integrate`

## Remplacer une brique, garder le reste

`run.ts` ouvre un workspace, c’est-à-dire une branche et son checkout, puis y ouvre des sandboxes. Chaque `dispatch()` y lance un agent avec un **brief**, la consigne qui lui est adressée. Les agents viennent de `agents.ts` et les sandboxes de `sandboxes.ts` : changer de brique revient à importer un autre nom.

- **Même sandbox, autre harness** : chaque `dispatch()` peut prendre son propre agent. Ici, Claude relit ce que Codex a corrigé, avec les mêmes fichiers et les mêmes dépendances installées.
- **Même workspace, autre sandbox** : une nouvelle sandbox reprend la branche et ses commits. Fermez d’abord la précédente : un workspace n’accepte qu’une sandbox ouverte à la fois.

<!-- tabs -->

```ts title="run.ts" {21,29}
import { openWorkspace } from "@elie-laloum/outpost";
import { claude, codex } from "./agents.ts";
import { dockerProvider, vercelProvider } from "./sandboxes.ts";

await using workspace = await openWorkspace({
  repository: process.cwd(),
  branch: { mode: "named", name: "outpost/fix-links" },
});

const dockerSandbox = await workspace.sandbox({
  sandboxProvider: dockerProvider,
  agent: codex,
});

await dockerSandbox.dispatch({
  brief: { text: "Fix the broken links in the README." },
});

// Même sandbox, autre harness.
await dockerSandbox.dispatch({
  agent: claude,
  brief: { text: "Review the fix and commit it." },
});

await dockerSandbox.close();

// Même workspace et même branche, autre sandbox.
const vercelSandbox = await workspace.sandbox({
  sandboxProvider: vercelProvider,
  agent: claude,
});

await vercelSandbox.dispatch({
  brief: { text: "Add a link check to the CI and commit it." },
});

await vercelSandbox.close();
```

```ts title="agents.ts"
import {
  createAgent,
  createClaudeHarness,
  createCodexHarness,
} from "@elie-laloum/outpost";

export const codex = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});

export const claude = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
```

```ts title="sandboxes.ts"
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

export const dockerProvider = createDockerSandboxProvider({
  image: "outpost:dev",
});

export const vercelProvider = createVercelSandboxProvider();
```

## Le déroulé d’un run

Un run fait travailler ces objets ensemble. Chaque lien montre qui s’adresse à qui, dans le sens de la flèche.

<!-- canvas -->

- [Déclencheurs](../webhooks/): `serveTriggers()` reçoit les webhooks GitHub, GitLab et Slack ; `runSchedules()` suit les horaires cron.
  - CLI · HTTP
  - → **Workflow**: jobs
- [Workflow](../typed-workflows/): `defineWorkflow()` enchaîne des tâches typées et s’arrête aux gates.
  - workflow
  - → **Tâches**: exécute
  - → **Checkpoints**: état et sorties
- [Tâches](../task-dependencies/): Chacune rend une valeur typée à celles qui en dépendent.
  - workflow
  - **Tâche hôte**: `defineTask()`
    - → **Artefacts**: `publishArtifact()`
  - **Tâche isolée**: `defineIsolatedTask()`
    - → **Workspace**: `dispatch()`
  - **Tâche d’agent**: `defineAgentTask()`
    - → **Sandbox**: `sandbox.dispatch()`
  - **Gate**: `defineApprovalTask()`
    - → **Humain**: décision attendue
  - **Question**: `defineInteractiveAgentTask()`
    - → **Humain**: question
    - → **Workspace**: chaque tour
- [Humain](../approvals/): Votre CLI ou votre service HTTP relance `workflow.start()` avec la décision ou la réponse.
  - CLI · HTTP
  - → **Gate**: décision
  - → **Question**: réponse
- [Votre code](../first-request/): `run.ts` lance un workflow, ou un agent directement avec `dispatch()`.
  - hôte
  - → **Workflow**: `workflow.start()`
  - → **Workspace**: `dispatch()`
- **Dépôt Git**: Votre checkout local et sa branche de base.
  - hôte
  - → **Workspace**: branche de travail
- [Workspace](../repository-and-branch/): Verrouille la branche et crée son worktree sous `.outpost/workspaces`.
  - hôte
  - → **Sandbox**: worktree
  - → **Dépôt Git**: `integrate`
- [Sandbox](../choose-a-sandbox/): Docker, Podman, Vercel, Daytona ou Firecracker. Libérée quoi qu’il arrive.
  - sandbox
  - → **Agents**: un appel à la fois
  - → **Workspace**: commits
- [Agents](../choose-an-agent/): Chacun reçoit ses identifiants dans un home privé et déroule ses tours.
  - sandbox
  - **Codex**: corrige les liens
  - **Claude Code**: relit la correction
  - **Tout autre agent**: autant d’appels que nécessaire
  - → **Modèle**: requêtes
  - → **Conversations**: transcript
  - → **Journaux**: événements
- [Modèle](../authentication/): L’API du fournisseur, avec votre compte ou une clé d’API.
  - fournisseur
  - → **Agents**: réponses
- [Stockage](../storage/): `.outpost/storage` par défaut, ou tout autre `Transport`.
  - hôte
  - **Conversations**: pour reprendre ou forker
  - **Checkpoints**: pour reprendre un workflow
  - **Artefacts**: sorties publiées par les tâches
  - **Journaux**: le déroulé de chaque `dispatch()`

Si un run échoue, rien d’important n’est perdu :

<!-- cards -->

- **Sandbox libérée**: Fermée quoi qu’il arrive : aucun conteneur ni machine cloud ne reste allumé.
- **Workspace conservé**: Sa branche, son dossier et ses commits restent sur le disque.
- **Historique enregistré**: Checkpoints, artifacts, conversations et journaux restent dans le [stockage](../storage/).
- **Travail restauré**: Pour reprendre votre run, vous pouvez [récupérer votre travail](../recovery/).

## Sandbox neuve ou réutilisée

`dispatch()` repart d’un environnement neuf à chaque appel. `sandbox.dispatch()` s’exécute dans une sandbox qui reste ouverte : les fichiers et les dépendances installées passent d’une opération à la suivante.

<!-- tabs -->

```ts title="cold.mts"
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const options = { agent: coder, sandboxProvider, repository };
await dispatch({ ...options, brief: { text: "Fix the failing date tests." } });
// Nouvelle sandbox : les fichiers et dépendances du premier appel ont disparu.
await dispatch({ ...options, brief: { text: "Document the date helpers." } });
```

```ts title="warm.mts"
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({
  agent: coder,
  sandboxProvider,
  repository,
  branch: { mode: "integrate" },
});
await sandbox.dispatch({ brief: { text: "Fix the failing date tests." } });
// Même sandbox : le test voit tout de suite les modifications de l’agent.
const tests = await sandbox.command({ executable: "npm", arguments: ["test"] });
// C’est vous qui décidez quand la branche est fusionnée.
if (tests.status === 0) await sandbox.workspace.integrate();
```

<!-- compare -->

- `dispatch()`: Un environnement neuf à chaque appel.
  - **Fichiers et dépendances**: Jetés à la fin de l’appel
  - **Conversations**: `result.resume()` en restaure une dans une nouvelle sandbox
  - **Intégration**: Automatique, selon la politique de branche
  - **À utiliser pour**: Une tâche ponctuelle
- `sandbox.dispatch()`: Un seul environnement, ouvert jusqu’à `close()`.
  - **Fichiers et dépendances**: Conservés d’une opération à l’autre
  - **Conversations**: Une nouvelle par appel, sauf si vous en [reprenez](../conversations/) une
  - **Intégration**: À vous d’appeler `sandbox.workspace.integrate()`
  - **À utiliser pour**: Des workflows déterministes ou plus complexes

## Qui ferme quoi

Celui qui ouvre une ressource la ferme.

| Ouvert avec                        | Fermé par                                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `dispatch()`                       | `dispatch()` lui-même, à la fin de l’appel, avec sa sandbox et son workspace.             |
| `createSandbox()` sans `workspace` | Vous, avec `sandbox.close()`, qui ferme aussi son workspace.                              |
| `openWorkspace()`                  | Vous : chaque sandbox avec `sandbox.close()`, puis le workspace avec `workspace.close()`. |

<!-- features -->

- **Fermeture sans risque**: `close()` accepte un second appel ; il interrompt l’opération en cours et attend sa fin.
- **Ordre inverse**: `await using` ferme dans l’ordre inverse de l’ouverture : la sandbox avant son workspace.
- **Une opération à la fois**: Une deuxième opération est refusée, pas mise en attente. Pour paralléliser, ouvrez plusieurs sandboxes coordonnées par les [dépendances entre tâches](../task-dependencies/).

## Ce qui reste dans `.outpost`

Outpost garde son état d’exécution dans le dépôt cible et le masque à Git via `.git/info/exclude`.

<!-- files -->

- `.outpost/`
  - `workspaces/`: Les worktrees des branches `named` et `integrate`, y compris ceux que vous conservez.
  - `locks/`: La propriété des checkouts, des branches et de l’intégration.
  - `storage/`: Par défaut, les [journaux](../journals/) et l’activité des ressources, plus les checkpoints, artefacts et caches dont vous y dirigez le store ([Où vivent les données](../storage/)).
  - `conversations/`: Les transcripts du harness intégré et les sessions Copilot et Kimi.
  - `recovery/`: Les transferts conservés après une synchronisation en échec.

Claude Code et Codex, eux, gardent leurs transcripts dans leur propre stockage, au sein de votre dossier personnel. Le dossier `.outpost` peut contenir la seule copie d’un travail inachevé : inspectez-le avec [Récupérer du travail](../recovery/) et purgez-le avec [Rétention et nettoyage](../retention/), jamais à la main.
