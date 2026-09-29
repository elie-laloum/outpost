---
title: "Introduction"
description: "Exécutez des agents de code depuis TypeScript, dans la sandbox et sur la branche de votre choix, et composez leur travail en workflows."
---

Outpost est une bibliothèque et une CLI TypeScript qui exécutent des agents de code en CLI (Claude Code, Codex, GitHub Copilot CLI, Kimi Code, Antigravity) ou son propre harness intégré. Chaque agent travaille dans la sandbox de votre choix (Docker, Podman, Vercel, Daytona, Firecracker ou l’hôte), sur un workspace Git que vous contrôlez. Outpost compose ensuite leurs résultats en workflows typés qui survivent aux interruptions.

Servez-vous-en pour automatiser le travail d’agents depuis votre propre code : vous décidez des identifiants que reçoit l’agent, de la branche sur laquelle il écrit et du moment où ses commits sont intégrés.

## Une tâche en code

`dispatch()` démarre une sandbox, exécute l’agent sur une branche, collecte ses commits et libère la sandbox. `coder`, `repository` et `sandboxProvider` viennent du fichier de configuration créé dans [Mise en place](../setup/).

```ts title="fix.mts"
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-tests" },
  brief: { text: "Fix the failing tests, run them and commit the fix." },
});

console.log(result.text); // la réponse finale de l’agent
console.log(result.commits.map((commit) => commit.subject)); // commits sur outpost/fix-tests
console.log(result.usage); // tokens en entrée, en cache et en sortie
```

## Ce que vous pouvez construire

### Exécuter une tâche d’agent

- Décrire le travail avec du texte, des fichiers et des variables : [Rédiger le brief](../briefs/).
- Choisir le checkout et la branche qui reçoit les commits : [Dépôt et branche](../repository-and-branch/).
- Obtenir des données validées plutôt que du texte libre : [Réponses typées](../typed-responses/).
- Lancer des tests entre deux tours d’agent dans un environnement préparé : [Sessions de sandbox](../sandbox-sessions/), [Préparer l’environnement](../environment-setup/).
- Poursuivre ou dériver la conversation d’un agent : [Conversations](../conversations/).
- Borner, annuler, réorienter et suivre un agent en cours : [Limites et annulation](../limits-and-cancellation/), [Piloter un agent en cours](../steering/), [Suivre la progression](../progress/).

### Choisir les agents et les sandboxes

- Choisir un agent CLI et son mode d’authentification : [Choisir un agent](../choose-an-agent/), [Authentification](../authentication/).
- Donner aux agents les outils de serveurs Model Context Protocol, y compris derrière une connexion : [Serveurs MCP](../mcp-servers/), [Connexion aux serveurs MCP](../mcp-oauth/).
- Confier une tâche à un autre agent quand le premier atteint une limite ou tombe en panne : [Agents de secours](../fallback-agents/).
- Piloter des modèles OpenAI ou Anthropic avec la boucle d’Outpost, ses outils, ses permissions et ses sous-agents : [Harness intégré](../harness/).
- Choisir où s’exécutent les commandes : [Choisir une sandbox](../choose-a-sandbox/), puis [Docker et Podman](../containers/), [Sandboxes cloud](../cloud-sandboxes/), [MicroVM Firecracker](../firecracker/) ou [Exécution sur l’hôte](../host-process/).
- Contrôler ce que reçoit une sandbox : [Images d’agent](../agent-images/), [Variables d’environnement](../environment-variables/), [Restrictions réseau](../network-restrictions/), [Git privé](../private-git/).

### Composer des workflows

- Relier des tâches typées en un graphe qui exécute en parallèle le travail indépendant : [Tâches et dépendances](../task-dependencies/), [Concurrence, relances et délais](../concurrency-and-retries/).
- Répéter le travail jusqu’à ce qu’une vérification l’accepte : [Boucles de vérification](../verification-loops/).
- Modifier plusieurs dépôts, chacun dans sa sandbox : [Plusieurs dépôts](../multiple-repositories/).
- Lancer des candidats concurrents et garder celui qui passe : [Candidats concurrents](../speculation/).
- Plafonner tentatives et tokens, et réutiliser les résultats dont les entrées n’ont pas changé : [Budgets](../budgets/), [Cache de résultats](../task-cache/).
- Partager des résultats typés entre processus : [Artefacts](../artifacts/).

### Exécuter durablement et impliquer des humains

- Reprendre un workflow après un plantage sans refaire les tâches terminées : [Exécutions persistantes](../durable-runs/).
- Faire une pause sur une limite d’usage et reprendre après sa réinitialisation : [Pauses sur quota](../quota-pauses/).
- Attendre une décision humaine, ou laisser l’agent poser des questions : [Approbations](../approvals/), [Tâches interactives](../interactive-tasks/).

### Exécuter sans surveillance

- Exécuter dans un pipeline de CI : [Exécuter en CI](../ci-automation/).
- Exécuter des jobs via une file durable et des workers : [Files de jobs et workers](../job-queues/), [Redis et BullMQ](../redis-workers/).
- Démarrer des workflows selon un planning ou depuis un webhook : [Planification cron](../cron-schedules/), [Webhooks](../webhooks/).

### Stocker, observer et exploiter

- Conserver les données durables sur disque ou dans S3 et R2 : [Où vivent les données](../storage/), [S3 et R2](../object-storage/).
- Enregistrer chaque dispatch, exporter des traces et rejouer une exécution sans modèle : [Journaux](../journals/), [Hub d’observation et OpenTelemetry](../observability/), [Rejouer sans modèle](../record-replay/).
- Vérifier les prérequis, traiter les erreurs et récupérer le travail préservé : [Diagnostic](../diagnostics/), [Erreurs](../error-handling/), [Récupérer du travail](../recovery/).
- Nettoyer, mesurer l’exposition et utiliser la CLI : [Rétention et nettoyage](../retention/), [Sécurité](../security/), [Commandes CLI](../cli/).

### Étendre Outpost

- Étendre une capacité sans remplacer le runtime, ou brancher une autre CLI d’agent ou un autre environnement d’exécution : [Ports d’intégration](../integration-ports/), [Ajouter un agent CLI](../custom-agents/), [Formats de conversation natifs](../conversation-formats/), [Ajouter un provider de sandbox](../custom-sandbox-providers/).

### Exemples complets

[Réparer une CI en échec](../fix-failing-ci/) · [Relire une pull request à la demande](../review-on-label/) · [Maintenance nocturne](../nightly-maintenance/) · [Modifier plusieurs dépôts](../multi-repository-change/) · [Mettre des agents en concurrence](../compete-agents/) · [Rédiger une spécification avec un humain](../specify-with-a-human/)

## Par où commencer

1. [Fonctionnement d’Outpost](../how-it-works/) présente l’agent, la sandbox et le workspace, et qui possède chacun.
2. [Mise en place](../setup/) installe Outpost, construit une image et crée `outpost.config.mts`.
3. [Votre première tâche](../first-request/) exécute une tâche et lit sa réponse, sa consommation et ses commits.
4. [D’une tâche à un workflow](../first-workflow/) transforme cette tâche en workflow vérifié, approuvé et reprenable.
