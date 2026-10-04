---
title: "Introduction"
description: "Outpost lance des agents de code depuis votre code TypeScript : la CLI d’agent de votre choix ou son propre harness, dans la sandbox que vous désignez, sur la branche Git que vous décidez. Ce qu’ils produisent revient en données typées, qu’un workflow peut vérifier, faire approuver et reprendre."
---

## Une tâche écrite en code

`dispatch()` démarre une sandbox, y fait tourner l’agent sur une branche, récupère ses commits, puis libère la sandbox.

Les trois imports viennent du fichier de configuration écrit à l’étape [Installation](../setup/).

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

console.log(result.text); // the agent's final answer
console.log(result.commits.map((commit) => commit.subject)); // commits on outpost/fix-tests
console.log(result.usage); // input, cached and output token counts
```

## Fonctionnalités

<!-- features -->

- [Rédiger le brief](../briefs/): Donnez vos instructions en texte, ou dans un modèle Markdown avec variables et sorties de commandes.
  - `{ text }`
  - `{ file, values }`
- [Choisir un agent](../choose-an-agent/): Cinq CLI d’agent, authentifiées par votre compte ou, pour la plupart, par une clé d’API.
  - Claude Code
  - Codex
  - Copilot CLI
  - Kimi Code
  - Antigravity
- [Harness intégré](../harness/): Pilotez un modèle avec vos outils, vos permissions et vos sous-agents.
  - OpenAI
  - Anthropic
  - `createHarness()`
- [Choisir une sandbox](../choose-a-sandbox/): Un conteneur local, une sandbox cloud, une microVM ou l’hôte.
  - Docker
  - Podman
  - Vercel
  - Daytona
  - Firecracker
- [Serveurs MCP](../mcp-servers/): Donnez à vos agents des serveurs Model Context Protocol, avec des secrets désignés par leur nom.
  - stdio
  - HTTP
  - OAuth
- [Isolation](../isolation/): Limitez le trafic sortant et gardez les métadonnées Git privées.
  - règles de sortie
  - Git privé
- [Workflows typés](../typed-workflows/): Les tâches se passent des résultats typés, réessaient et bouclent jusqu’à ce que les vérifications passent.
  - `defineWorkflow()`
  - `defineLoopTask()`
- [Exécutions durables](../durable-runs/): Enregistrez l’avancement, faites une pause quand un quota est atteint, reprenez sans tout refaire.
  - checkpoints
  - pauses sur quota
  - cache
- [Approbations](../approvals/): Arrêtez le workflow à une gate jusqu’à ce qu’une personne approuve ou rejette.
  - `defineApprovalTask()`
  - `definePauseTask()`
  - gates signées
- [Exécutions sans surveillance](../unattended-runs/): Déclenchez depuis la CI, une file de jobs, un horaire cron ou un webhook vérifié.
  - SQLite
  - Redis
  - GitHub
  - GitLab
  - Slack
- [Observer et récupérer](../observe-and-recover/): Journaux, traces, rejeu hors ligne et travail conservé quand une exécution s’interrompt.
  - OpenTelemetry
  - rejeu
  - récupération
- [Ports d’intégration](../integration-ports/): Branchez votre propre CLI d’agent, votre sandbox ou votre stockage.
  - `AgentAdapter`
  - `SandboxProvider`
  - `Transport`

## Exemples complets

<!-- features -->

- [Construire un workflow de développement](../development-workflow/): D’un ticket à une branche relue : questions, plan, tests rouges, puis code.
- [Réparer une CI en échec](../fix-failing-ci/): Bouclez tant que la commande de test ne passe pas.
- [Relire une pull request à la demande](../review-on-label/): Un label posé sur la pull request déclenche la revue.
- [Maintenance nocturne](../nightly-maintenance/): Une exécution planifiée qui survit aux redémarrages et aux limites de quota.
- [Modifier plusieurs dépôts](../multi-repository-change/): Un même changement, une sandbox par dépôt.
- [Mettre des agents en concurrence](../compete-agents/): Lancez plusieurs approches, gardez celle qui passe.

## Par où commencer

<!-- path -->

1. [Fonctionnement](../how-it-works/): L’agent, la sandbox et le workspace.
2. [Installation](../setup/): Installez Outpost et rédigez son fichier de configuration.
3. [Votre première tâche](../first-request/): Lancez un agent et lisez son résultat.
4. [D’une tâche à un workflow](../first-workflow/): Vérifiez, approuvez et reprenez.
