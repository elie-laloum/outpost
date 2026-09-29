---
title: "Fonctionnement d’Outpost"
description: "Trois pièces indépendantes, la vie d’un dispatch, qui possède chaque ressource et ce qui reste sur disque."
---

## Trois pièces indépendantes

Chaque tâche d’agent combine trois choix. En changer un ne vous oblige jamais à changer les autres.

<!-- features -->

- [Agent](../choose-an-agent/): Qui fait le travail : un harness qui fait tourner la boucle de l’agent, plus un modèle facultatif.
  - `createAgent()`
  - `createCodexHarness()`
  - `createHarness()`
- [Provider de sandbox](../choose-a-sandbox/): Où s’exécutent les commandes. Sans provider, Outpost utilise Docker.
  - Docker
  - Podman
  - Vercel
  - Daytona
  - Firecracker
  - hôte
- [Workspace](../repository-and-branch/): Quel checkout l’agent modifie et où arrivent ses commits.
  - `current`
  - `named`
  - `integrate`

## Changer une pièce, garder le reste

`dispatch()` reçoit les trois pièces et un **brief**, l’instruction destinée à l’agent.

Passer de Codex à Claude Code ne change que `coder`. Passer à une sandbox cloud ne change que `sandboxProvider`. Le reste du code ne bouge pas.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  agent: coder,
  sandboxProvider,
  repository,
  branch: { mode: "named", name: "outpost/fix-links" },
  brief: { text: "Fix the broken links in the README and commit the change." },
});
console.log(result.branch, result.commits.length);
```

## La vie d’un dispatch

<!-- flow -->

1. **Préparer**: Avant le démarrage de l’agent.
   - **Vérifier la demande**: Les options et l’agent sont validés avant toute allocation.
   - **Ouvrir le workspace**: Verrouiller la branche, créer son worktree sous `.outpost/workspaces`, exécuter les hooks `workspaceReady`.
     - hôte
   - **Allouer la sandbox**: Les conteneurs montent le worktree. Les sandboxes cloud reçoivent l’historique Git et installent la CLI si besoin.
     - sandbox
   - **Préparer l’agent**: Exécuter les hooks `hostReady` et `sandboxReady`, copier les identifiants dans un home privé, restaurer une conversation.
     - hôte
     - sandbox
2. **Exécuter**: L’agent travaille dans le worktree.
   - **Exécuter les tours**: Le brief, les passes supplémentaires et les réparations de réponses typées s’exécutent chacun comme un tour.
     - sandbox
   - **Enregistrer la conversation**: Après chaque tour, quand l’agent prend en charge la capture.
     - hôte
3. **Terminer**: Quoi qu’il arrive, la sandbox est libérée.
   - **Rapatrier les changements**: Les sandboxes cloud téléchargent, valident et appliquent les nouveaux commits.
     - hôte
   - **Intégrer**: `integrate` fusionne la branche de travail dans sa base. Rien n’est poussé.
     - hôte
   - **Fermer**: Libérer la sandbox, supprimer un worktree propre, conserver une branche `named`.
     - hôte
     - sandbox

Quand une étape échoue, Outpost libère quand même la sandbox et conserve le workspace. [`recoveryDetails()`](../../reference/recoverydetails/) lit dans l’erreur la branche, le dossier, les commits et le transcript ; [Récupérer du travail](../recovery/) les restaure.

## À froid ou à chaud

|                         | `dispatch()`                               | `createSandbox()`                                  |
| ----------------------- | ------------------------------------------ | -------------------------------------------------- |
| Environnement           | Neuf à chaque appel                        | Gardé ouvert jusqu’à `close()`                     |
| Fichiers et dépendances | Supprimés après l’appel                    | Conservés entre les opérations                     |
| Opérations              | Une tâche d’agent                          | `dispatch()`, `command()`, `attach()`, tour à tour |
| Intégration             | Automatique, selon la politique de branche | Vous appelez `sandbox.workspace.integrate()`       |
| À utiliser pour         | Une tâche ponctuelle                       | Des tests entre les tours de l’agent               |

Les fichiers persistent dans une sandbox à chaud, les conversations non : chaque `sandbox.dispatch()` en démarre une nouvelle, sauf si vous en [reprenez](../conversations/) une.

## Qui ferme quoi

Celui qui ouvre une ressource la ferme. `close()` peut être appelé deux fois, arrête l’opération en cours et attend sa fin ; `await using` fonctionne aussi.

| Ouvert par                         | Fermé par                                           |
| ---------------------------------- | --------------------------------------------------- |
| `dispatch()`                       | Lui-même, workspace et sandbox                      |
| `createSandbox()` sans `workspace` | `sandbox.close()`, qui ferme aussi son workspace    |
| `openWorkspace()`                  | Vous : fermez d’abord sa sandbox, puis le workspace |

Une sandbox exécute une seule opération à la fois ; une seconde est refusée, pas mise en attente. Exécutez le travail parallèle dans des sandboxes séparées, chacune sur sa propre branche, et coordonnez-les avec les [dépendances entre tâches](../task-dependencies/).

## Des tâches aux workflows

Un workflow est un graphe de tâches construit sur ces mêmes appels : `defineIsolatedTask()` exécute un dispatch à froid, `defineAgentTask()` utilise une sandbox que vous possédez, `defineTask()` exécute du code ordinaire. Un checkpoint enregistre chaque tâche terminée, si bien qu’une exécution relancée la saute. Commencez par [D’une tâche à un workflow](../first-workflow/).

## Ce qui reste dans `.outpost`

Outpost conserve son état d’exécution dans le dépôt cible et le masque à Git via `.git/info/exclude`.

<!-- files -->

- `.outpost/`
  - `workspaces/`: Worktrees des branches `named` et `integrate`, y compris ceux conservés.
  - `locks/`: Propriété des checkouts, des branches et de l’intégration.
  - `storage/`: [Journaux](../journals/), checkpoints, artefacts et activité des ressources.
  - `conversations/`: Transcripts du harness intégré, sessions Copilot et Kimi.
  - `recovery/`: Transferts conservés après une synchronisation échouée.

Claude Code et Codex conservent leurs transcripts dans leur propre stockage, dans votre dossier personnel. Le dossier `.outpost` peut contenir la seule copie d’un travail inachevé : inspectez-le avec [Récupérer du travail](../recovery/) et purgez-le avec [Rétention et nettoyage](../retention/), jamais à la main.

## Lire les noms de l’API

| Nom       | Quand il agit                                                                            | Exemples                                                                   |
| --------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `create*` | Construit un objet que vous conservez ; ne lance aucun processus, sauf `createSandbox()` | `createAgent()`, `createDockerSandboxProvider()`, `createLocalTransport()` |
| `define*` | Déclare ce qu’un moteur exécutera plus tard                                              | `defineWorkflow()`, `defineAgentTask()`, `defineJsonResponse()`            |
| verbes    | Agissent immédiatement et rendent la main une fois le travail fini                       | `dispatch()`, `openWorkspace()`, `attach()`, `readJournal()`               |

## Sécurité

:::caution
L’agent exécute les commandes du projet avec les accès que vous lui donnez. Docker et Podman montent le checkout et ses métadonnées Git ; le provider hôte n’offre aucune isolation. Lisez [Sécurité](../security/) avant de lancer des agents sur du code non fiable.
:::
