---
title: "Fonctionnement d’Outpost"
description: "Le modèle mental d’Outpost : agent, provider de sandbox et workspace, le cycle de vie d’un dispatch, qui possède chaque ressource et ce qui reste sur disque."
---

Outpost exécute un agent de code sur un checkout Git, dans l’environnement de votre choix, puis rend à votre code la réponse, la consommation et les commits. Cette page présente les pièces en jeu et ce qui se passe entre l’appel et le résultat. Lisez-la une fois avant les tutoriels : le reste du Guide s’appuie dessus.

## Trois pièces indépendantes

Chaque tâche d’agent combine trois choix. Chacun répond à une question différente, et en changer un ne vous oblige jamais à changer les autres.

- **Agent** : qui fait le travail. `createAgent({ harness, model })` associe un **harness**, le programme qui fait tourner la boucle de l’agent, à un modèle facultatif. Le harness est soit un preset CLI comme `createCodexHarness()` ou `createClaudeHarness()`, soit le [harness intégré](../harness/) d’Outpost, qui pilote directement un provider de modèle. Voir [Choisir un agent](../choose-an-agent/).
- **Provider de sandbox** : où s’exécutent les commandes. Docker, Podman, Firecracker, une sandbox cloud ou l’hôte lui-même. Sans provider, Outpost utilise Docker. Voir [Choisir une sandbox](../choose-a-sandbox/).
- **Workspace** : le checkout que l’agent modifie et la branche où arrivent ses commits. `repository` désigne le checkout et `branch` fixe la politique de branche : `current` (le checkout lui-même), `named` ou `integrate` (un worktree séparé). Voir [Dépôt et branche](../repository-and-branch/).

`dispatch()` reçoit les trois, avec un **brief**, l’instruction destinée à l’agent :

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

Passer de Codex à Claude Code ne change que `coder`. Passer de Docker à une sandbox cloud ne change que `sandboxProvider`. Le brief, la politique de branche et le code qui lit `result` restent identiques.

## La vie d’un dispatch

Un `dispatch()` de premier niveau suit ces étapes, dans cet ordre :

```text
hôte                sandbox
──────────────────  ──────────────────
1 vérification
2 ouverture du
  workspace
                    3 allocation
4 hooks ready ───── 4 hooks ready
                    5 identifiants
                    6 tours d’agent
7 retour des    ◀── (distant seulement)
  changements
8 intégration
9 fermeture
```

1. **Vérifier la demande.** Outpost valide les options et l’agent avant toute allocation. Si vous poursuivez une conversation, il localise aussi le transcript enregistré.
2. **Ouvrir le workspace.** Outpost pose un verrou sur le checkout ou la branche dans `.outpost/locks`. En mode `named` ou `integrate`, il crée un worktree Git sous `.outpost/workspaces` sur la branche de travail ; `current` travaille directement dans le checkout. Il copie les entrées `copies`, puis exécute les [hooks](../environment-setup/) `workspaceReady` sur l’hôte.
3. **Allouer la sandbox.** Le provider démarre l’environnement. Les conteneurs montent le worktree et ses métadonnées Git. Les providers distants reçoivent à la place l’historique Git et les entrées choisies, et installent une CLI prise en charge quand l’image ne la contient pas.
4. **Exécuter les hooks ready.** Les commandes `hostReady` s’exécutent sur l’hôte pendant que les commandes `sandboxReady` s’exécutent dans la sandbox. Le premier échec arrête les deux.
5. **Préparer l’agent.** Pour un harness CLI, Outpost copie les fichiers d’identifiants qu’il déclare dans le home privé de l’agent, dans la sandbox, applique la configuration de la CLI, par exemple les [serveurs MCP](../mcp-servers/), et restaure la conversation poursuivie.
6. **Exécuter l’agent.** Outpost note le commit courant, produit le brief et lance le tour de l’agent. Les passes supplémentaires et les réparations de [réponses typées](../typed-responses/) sont des tours de plus. Après chaque tour, il enregistre la conversation sur l’hôte quand l’agent prend en charge la capture.
7. **Rapatrier les changements.** Les providers distants téléchargent les nouveaux commits et fichiers, les valident, sauvegardent l’état de l’hôte puis les appliquent. Outpost liste ensuite dans `result.commits` les commits créés depuis l’étape 6.
8. **Intégrer.** En mode `integrate`, Outpost fusionne la branche de travail dans la branche de base, qui doit toujours être celle extraite sur l’hôte. `current` et `named` laissent les commits où ils sont. Rien n’est poussé.
9. **Fermer.** Outpost libère la sandbox et supprime le worktree s’il est propre. Une branche `named` reste disponible pour la revue. Le verrou est libéré et `dispatch()` rend la main.

Si une étape ultérieure échoue, Outpost ferme quand même la sandbox mais conserve le workspace, et l’erreur contient de quoi récupérer le travail : branche, dossier, commits et transcript, à lire avec [recoveryDetails()](../../reference/recoverydetails/). Les transferts distants qui n’ont pas pu être appliqués restent sous `.outpost/recovery`. Un worktree modifié ou détaché est aussi conservé après un succès et signalé dans `result.retainedDirectory`. Voir [Récupérer du travail](../recovery/).

## Exécution à froid et à chaud

Un `dispatch()` de premier niveau est **à froid** : il alloue une sandbox, exécute une tâche et ferme tout. L’appel suivant repart d’un environnement neuf.

`createSandbox()` est **à chaud** : il garde un environnement ouvert pour `sandbox.dispatch()`, `sandbox.command()` et `sandbox.attach()`, jusqu’à ce que vous appeliez `sandbox.close()`. Les dépendances installées, les résultats de build et les fichiers modifiés persistent d’une opération à l’autre. L’intégration est alors entre vos mains, comme le montre [Dépôt et branche](../repository-and-branch/).

Les fichiers persistent, les conversations non. Chaque `sandbox.dispatch()` démarre une nouvelle conversation, sauf si vous en reprenez une explicitement. Voir [Conversations](../conversations/) et [Sessions de sandbox](../sandbox-sessions/).

## Qui possède quoi

Celui qui ouvre une ressource la ferme.

- `dispatch()` ouvre et ferme son propre workspace et sa propre sandbox.
- `createSandbox()` sans `workspace` ouvre un workspace et le possède : `sandbox.close()` ferme les deux.
- `openWorkspace()` vous donne un workspace à prêter à `createSandbox({ workspace })` ou `workspace.sandbox()`. Fermez d’abord la sandbox, puis le workspace. Un workspace ne sert qu’une sandbox à la fois.

`close()` est idempotent : un second appel renvoie le même résultat. Il arrête l’opération en cours, attend qu’elle se termine, puis libère ce que l’objet possède. `await using` fonctionne aussi. Sur `SIGINT` ou `SIGTERM`, Outpost ferme les sandboxes ouvertes et conserve leurs worktrees.

Une sandbox exécute une seule opération à la fois : un second `dispatch()` ou `command()` lancé avant la fin du premier est refusé. Pour paralléliser, ouvrez une sandbox par tâche, chacune sur sa propre branche `named` ou `integrate`, car le checkout `current` n’accepte qu’un workspace à la fois. Les [dépendances entre tâches](../task-dependencies/) les coordonnent.

## Des tâches aux workflows

Un workflow est un graphe de tâches construit sur ces mêmes appels. `defineAgentTask()` exécute une demande sur une sandbox que vous fournissez, `defineIsolatedTask()` exécute un dispatch à froid avec sa propre sandbox, et `defineTask()` exécute du code applicatif ordinaire. `defineWorkflow()` valide le graphe ; rien ne s’exécute avant `start()`. Un store de checkpoints enregistre chaque tâche réussie sous un identifiant d’exécution, si bien qu’une exécution relancée saute le travail terminé. Commencez par [D’une tâche à un workflow](../first-workflow/), puis [Tâches et dépendances](../task-dependencies/) et [Exécutions persistantes](../durable-runs/).

## Ce qu’Outpost conserve dans `.outpost`

Outpost écrit son état d’exécution dans le dossier `.outpost` du dépôt cible et ajoute ces chemins au fichier `.git/info/exclude` du dépôt, pour que Git les ignore.

| Chemin                    | Contenu                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `.outpost/workspaces/`    | Worktrees des workspaces `named` et `integrate`, y compris ceux conservés.                                 |
| `.outpost/locks/`         | Verrous de propriété des checkouts, des branches et de l’intégration.                                      |
| `.outpost/storage/`       | Transport local par défaut : [journaux](../journals/), checkpoints, artefacts, activité des ressources.    |
| `.outpost/conversations/` | Transcripts du harness intégré et bundles de session Copilot et Kimi.                                      |
| `.outpost/recovery/`      | Transferts distants conservés après une synchronisation échouée, et zone de préparation des conversations. |

Les transcripts de Claude Code et de Codex vont dans le stockage propre à leur CLI, dans votre dossier personnel, comme l’explique [Conversations](../conversations/).

Ce dossier peut contenir la seule copie d’un travail inachevé. Ne le supprimez pas par simple nettoyage : inspectez-le avec [Récupérer du travail](../recovery/) et purgez-le avec une politique de [Rétention et nettoyage](../retention/).

## Lire les noms de l’API

Le nom d’une fonction indique quand son travail a lieu.

- `create*` construit un objet que vous conservez et transmettez : `createAgent()`, `createCodexHarness()`, `createDockerSandboxProvider()`, `createLocalTransport()`. Sa création ne lance aucun processus. `createSandbox()` fait exception, car l’objet qu’il renvoie est un environnement en marche.
- `define*` déclare ce qu’un moteur exécutera plus tard : `defineWorkflow()`, `defineAgentTask()`, `defineJsonResponse()`, `defineHarnessTool()`. Rien ne s’exécute au moment de la déclaration.
- Les verbes agissent immédiatement et rendent la main une fois le travail fini : `dispatch()`, `openWorkspace()`, `attach()`, `speculate()`, `readJournal()`.

## Limites de sécurité

L’agent exécute les commandes du projet avec les accès que vous lui donnez. Docker et Podman montent le checkout et ses métadonnées Git en écriture, ce qui ne constitue pas une barrière contre un agent malveillant. Le provider hôte n’offre aucune isolation. Les identifiants sont copiés dans un home privé de l’agent qui disparaît avec la sandbox ; le provider hôte ne reçoit que des variables. Lisez [Sécurité](../security/) avant de lancer des agents sur du code non fiable.
