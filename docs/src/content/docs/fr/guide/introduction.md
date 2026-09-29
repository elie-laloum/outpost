---
title: "Introduction"
description: "Outpost exécute des agents de code depuis votre code TypeScript : n’importe quelle CLI d’agent prise en charge ou sa propre boucle, dans la sandbox de votre choix, sur une branche Git que vous contrôlez. Leurs résultats deviennent des données typées que les workflows peuvent vérifier, approuver et reprendre."
---

## Une tâche en code

`dispatch()` démarre une sandbox, exécute l’agent sur une branche, récupère ses commits et libère la sandbox.

Les trois imports proviennent de la configuration écrite dans [Installation](../setup/).

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

## Ce que vous pouvez construire

<!-- features -->

- [Tâches d’agent](../briefs/): Confiez un brief à un agent, choisissez sa branche et récupérez des données typées.
  - `dispatch()`
  - `createSandbox()`
- [Tout agent de code](../choose-an-agent/): Cinq CLI d’agent, connectées avec votre compte ou, pour la plupart, une clé d’API.
  - Claude Code
  - Codex
  - Copilot CLI
  - Kimi Code
  - Antigravity
- [Votre propre boucle d’agent](../harness/): Pilotez un modèle avec vos outils, vos permissions et vos sous-agents.
  - OpenAI
  - Anthropic
  - `createHarness()`
- [Toute sandbox](../choose-a-sandbox/): Conteneurs locaux, sandboxes cloud, une microVM ou l’hôte.
  - Docker
  - Podman
  - Vercel
  - Daytona
  - Firecracker
- [Outils MCP](../mcp-servers/): Donnez aux agents des serveurs Model Context Protocol, avec des secrets transmis par nom.
  - stdio
  - HTTP
  - OAuth
- [Isolation](../network-restrictions/): Restreignez le trafic sortant et gardez les métadonnées Git privées.
  - règles de sortie
  - Git privé
- [Workflows typés](../task-dependencies/): Les tâches se transmettent des résultats typés, réessaient et bouclent jusqu’à ce que les vérifications passent.
  - `defineWorkflow()`
  - `defineLoopTask()`
- [Exécutions persistantes](../durable-runs/): Enregistrez la progression, faites une pause sur quota, reprenez sans refaire le travail.
  - checkpoints
  - pauses sur quota
  - cache
- [Humains dans la boucle](../approvals/): Attendez une approbation ou laissez l’agent poser des questions.
  - `defineApprovalTask()`
  - `defineInteractiveAgentTask()`
- [Exécutions sans surveillance](../job-queues/): Lancez depuis la CI, des files, des planifications cron et des webhooks vérifiés.
  - SQLite
  - Redis
  - GitHub
  - GitLab
  - Slack
- [Observer et récupérer](../observability/): Journaux, traces, rejeu hors ligne et travail préservé.
  - OpenTelemetry
  - rejeu
  - récupération
- [Étendre Outpost](../integration-ports/): Branchez une autre CLI d’agent, une autre sandbox ou un autre stockage.
  - `AgentAdapter`
  - `SandboxProvider`
  - `Transport`

## Exemples complets

<!-- features -->

- [Réparer une CI en échec](../fix-failing-ci/): Bouclez jusqu’à ce que la commande de test passe.
- [Relire une pull request à la demande](../review-on-label/): Un label ou un commentaire lance une revue.
- [Maintenance nocturne](../nightly-maintenance/): Une exécution planifiée qui survit aux redémarrages et aux limites.
- [Modifier plusieurs dépôts](../multi-repository-change/): Un changement, une sandbox par dépôt.
- [Mettre des agents en concurrence](../compete-agents/): Essayez plusieurs approches, gardez celle qui passe.
- [Rédiger une spécification avec un humain](../specify-with-a-human/): Les questions d’abord, le code après approbation.

## Par où commencer

<!-- path -->

1. [Fonctionnement d’Outpost](../how-it-works/): L’agent, la sandbox et le workspace.
2. [Installation](../setup/): Installez Outpost et écrivez sa configuration.
3. [Votre première tâche](../first-request/): Lancez un agent et lisez son résultat.
4. [D’une tâche à un workflow](../first-workflow/): Vérifiez, approuvez et reprenez.
