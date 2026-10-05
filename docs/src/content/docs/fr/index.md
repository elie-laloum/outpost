---
title: "Outpost — Agents de code et workflows TypeScript"
description: "Exécutez vos agents de code dans des sandboxes et composez des workflows TypeScript. Outpost gère les espaces Git, les tests, les validations et la reprise."
tableOfContents: false
head:
  - tag: title
    content: "Outpost — Agents de code et workflows TypeScript"
  - tag: meta
    attrs: { property: "og:type", content: "website" }
landing:
  category: "L’orchestration des agents, en TypeScript"
  headline: ["Vos agents.", "Un workflow TypeScript."]
  lead: "Un brief devient du code, des commits et un résultat à vérifier. Choisissez l’agent et sa sandbox. Reliez les tâches, les tests et les décisions dans le code de votre projet."
  primary: { label: "Essayer sur mon projet", href: "guide/setup/" }
  secondary:
    { label: "Voir un workflow complet", href: "guide/development-workflow/" }
  story:
    label: "Exemple de workflow"
    title: "Du brief au commit, un parcours explicite."
    steps:
      - title: "Définir le travail"
        text: "Un dépôt, un brief et une branche pour la tâche."
        role: "Vous"
        icon: "branch"
        href: "guide/repository-and-branch/"
      - title: "Lancer votre agent"
        text: "Codex, Claude Code ou un autre agent dans la sandbox choisie."
        role: "Agent"
        icon: "agent"
        href: "guide/development-workflow/"
      - title: "Exécuter vos tests"
        text: "Vos critères décident de la suite : corriger, poursuivre ou arrêter."
        role: "Workflow"
        icon: "ci"
        href: "guide/verification-loops/"
      - title: "Relire les commits"
        text: "Vous choisissez les changements à intégrer."
        role: "Vous"
        icon: "branch"
        href: "guide/repository-and-branch/"
    result:
      label: "Une branche pour votre revue"
      branch: "outpost/fix-tests"
      text: "Le correctif et ses commits, prêts à être relus."
      href: "guide/repository-and-branch/"
    link:
      { label: "Construire ce workflow", href: "guide/development-workflow/" }
  overview:
    - title: "Moins de préparation à chaque tâche"
      text: "Outpost prépare la sandbox et l’espace de travail Git. Concentrez-vous sur le changement."
      href: "guide/how-it-works/"
    - title: "Vos critères, vos validations"
      text: "Placez vos tests et vos décisions entre la proposition de l’agent et l’étape suivante."
      href: "guide/approvals/"
    - title: "Un travail qui se poursuit"
      text: "Enregistrez l’état du workflow pour le reprendre après une interruption."
      href: "guide/durable-runs/"
  install:
    managers: "Gestionnaire de paquets"
    commands:
      - { label: "npm", command: "npm install @elie-laloum/outpost" }
      - { label: "yarn", command: "yarn add @elie-laloum/outpost" }
      - { label: "bun", command: "bun add @elie-laloum/outpost" }
      - { label: "pnpm", command: "pnpm add @elie-laloum/outpost" }
    copy: "Copier la commande d’installation"
    copied: "Copié"
    failed: "La copie a échoué. Sélectionnez la commande pour la copier."
    prerequisites: "Node.js 24+ · Git · Docker pour l’exemple ci-dessous"
  capabilities:
    title: "Ce que vous pouvez construire avec Outpost"
    text: "Choisissez vos agents, coordonnez leurs tâches et conservez les résultats pour la suite. Chaque fonctionnalité dispose de son guide."
    items:
      - title: "Agents et sandboxes"
        text: "Choisissez l’agent de code indépendamment de son environnement : conteneurs, sandboxes cloud ou exécution locale explicite."
        href: "guide/choose-an-agent/"
      - title: "Espaces de travail Git"
        text: "Donnez à chaque tâche son worktree, conservez les branches nommées et choisissez quand intégrer les commits."
        href: "guide/repository-and-branch/"
      - title: "Workflows typés"
        text: "Reliez les résultats par des dépendances. Exécutez les tâches indépendantes en parallèle et transmettez des valeurs typées entre les étapes."
        href: "guide/task-dependencies/"
      - title: "Réponses validées"
        text: "Définissez le schéma JSON attendu, validez la réponse et demandez une réparation si l’agent renvoie un résultat invalide."
        href: "guide/typed-responses/"
      - title: "Décisions humaines"
        text: "Mettez en pause pour une validation ou laissez l’agent poser ses questions. Enregistrez les réponses avant de poursuivre."
        href: "guide/approvals/"
      - title: "Reprise des exécutions"
        text: "Enregistrez les tâches terminées et la consommation cumulée dans un checkpoint. Reprenez un workflow après une récupération explicite."
        href: "guide/durable-runs/"
      - title: "Votre propre boucle d’agent"
        text: "Composez un fournisseur de modèles, des outils en sandbox, des serveurs MCP et des sous-agents bornés avec le harness intégré."
        href: "guide/harness/"
      - title: "Automatisation planifiée"
        text: "Publiez des jobs depuis des planifications et des webhooks vérifiés. Les workers exécutent les workflows mis en file."
        href: "guide/cron-schedules/"
      - title: "Consommation et traces"
        text: "Suivez les événements, consultez les journaux et exportez la télémétrie. Comptabilisez les tokens remontés et fixez des budgets."
        href: "guide/observability/"
  footer:
    documentation:
      title: "Documentation"
      links:
        - { label: "Guide", href: "guide/introduction/" }
        - { label: "API", href: "reference/" }
    source:
      title: "Projet"
      links:
        - {
            label: "GitLab",
            href: "https://gitlab.elielaloum.com/elielaloum/outpost",
          }
        - { label: "GitHub", href: "https://github.com/elie-laloum/outpost" }
        - {
            label: "npm",
            href: "https://www.npmjs.com/package/@elie-laloum/outpost",
          }
    license: "Licence MIT"
---

## Une tâche pour commencer. Un workflow pour la suite.

Confiez un correctif à Codex dans sa sandbox Docker et son espace de travail Git. Votre checkout courant reste disponible pendant que l’agent travaille. La branche nommée conserve les commits à relire ; cet appel ne les intègre pas.

Enregistrez ces deux fichiers dans votre dépôt et lancez `node task.ts`. Le reporter affiche la progression et la consommation de tokens ; `result` conserve la réponse et les commits pour votre code. Choisissez un nouveau nom de branche pour chaque tâche. Demander à l’agent de lancer les tests est une consigne ; la [boucle de vérification](guide/verification-loops/) ajoute le contrôle qui décide si le travail est accepté.

[Votre première tâche](guide/first-request/) explique le résultat. [Votre premier workflow](guide/first-workflow/) montre ensuite comment relier cette tâche à la suivante.

<!-- tabs -->

```ts title="outpost.config.ts"
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const coder = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});
export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
});
export const repository = process.cwd();
```

```ts title="task.ts"
import { createReporter, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  observe: createReporter(),
  branch: { mode: "named", name: "outpost/fix-tests" },
  brief: { text: "Fix the failing tests, run them and commit the fix." },
});

// Example output:
// [outpost · pass 1] running · codex
// Fixed the failing tests and committed the change.
// [outpost · pass 1] finished · 12.00s · status 0 · input 1200 · cache read 0 · cache write 0 · output 320
```

:::note[Avant de lancer l’exemple]
Suivez [Installation](guide/setup/) pour construire `outpost:dev`, préparer la connexion de l’agent et déclarer `"type": "module"` dans votre `package.json`. Node.js 24 exécute directement ces fichiers `.ts`.
:::

## Livrer un export CSV, du ticket à la branche

Un ticket demande un export CSV de la liste des commandes. Un agent prépare le plan : fichiers à modifier, format et cas limites. Un autre écrit le code et les tests. Les tests et la revue par un second agent tournent en parallèle, puis leurs résultats sont réunis. Si un contrôle échoue, ses retours repartent vers l’agent qui code, dans la limite de trois essais. Quand les deux contrôles acceptent le travail, le mainteneur valide la livraison.

<!-- canvas -->

- [**Ticket export CSV**](guide/briefs/): Exporter les commandes filtrées, avec leurs dates et leurs montants.
  - Mainteneur
  - → **Préparer le plan**: brief
- [**Préparer le plan**](guide/typed-responses/): Identifier les fichiers, le format CSV et les cas limites à couvrir.
  - Agents
  - → **Implémenter l’export**: plan validé
- [**Implémenter l’export**](guide/sandbox-sessions/): Écrire le code et les tests dans un espace Git dédié.
  - Agents
  - → **Exécuter les tests**: en parallèle
  - → **Relire le diff**: en parallèle
- [**Exécuter les tests**](guide/task-dependencies/): Lancer npm test ; récupérer le code de sortie et les erreurs.
  - Contrôles
  - → **Réunir les verdicts**: résultat des tests
- [**Relire le diff**](guide/typed-responses/): Un second agent vérifie le format CSV et renvoie un verdict structuré.
  - Agents
  - → **Réunir les verdicts**: résultat de la revue
- [**Réunir les verdicts**](guide/verification-loops/): Attendre les deux contrôles ; accepter ou renvoyer leurs retours.
  - Contrôles
  - → **Implémenter l’export**: corrections · 3 essais maximum
  - → **Valider la livraison**: tests et revue acceptés
  - → **Arrêter le run**: essais épuisés
- [**Valider la livraison**](guide/approvals/): Mettre en pause pour laisser le mainteneur examiner les changements.
  - Mainteneur
  - → **Préparer la branche**: approuvé
  - → **Arrêter le run**: refusé
- [**Préparer la branche**](guide/repository-and-branch/): Commiter le travail accepté sur outpost/csv-export pour l’intégration.
  - Contrôles
- [**Arrêter le run**](guide/recovery/): Conserver l’espace de travail et les retours pour examiner le problème.
  - Contrôles

Les dépendances réunissent tests et revue avant le verdict. La boucle de correction réutilise l’espace de travail ; la validation humaine enregistre sa décision en attente dans un checkpoint. Chaque flèche représente une étape contrôlée par votre code TypeScript.

<!-- features -->

- [**Réinjecter les retours dans l’essai suivant**](guide/verification-loops/): Transmettre les erreurs des tests et les remarques de la revue, avec un nombre de tours borné.
- [**Exécuter les contrôles indépendants ensemble**](guide/concurrency-and-retries/): Déclarer les dépendances et choisir combien de tâches peuvent tourner à la fois.
- [**Valider la livraison avant de poursuivre**](guide/approvals/): Enregistrer la décision en attente et reprendre avec la réponse du mainteneur.

## Commencez par ce qui vous attend déjà

Une CI qui bloque, une pull request à relire, une mise à jour toujours repoussée : partez d’un besoin concret. Ces recettes montrent quels agents lancer, quoi vérifier et quel résultat récupérer.

<!-- features -->

- [**Débloquer une CI en échec**](guide/fix-failing-ci/): Confiez l’erreur à un agent, lancez les vérifications et renvoyez-lui ce qui reste à corriger.
- [**Avoir un second regard sur une pull request**](guide/review-on-label/): Déclenchez une revue depuis un label et récupérez un avis structuré que le workflow peut exploiter.
- [**Donner un rythme à la maintenance**](guide/nightly-maintenance/): Planifiez les mises à jour sur des branches datées et récupérez un rapport.

## Vos outils habituels. Votre façon de les assembler.

Utilisez Codex pour une tâche, Claude Code pour une autre, ou votre propre boucle d’agent. Choisissez l’environnement d’exécution indépendamment. Votre workflow reste du TypeScript que vous pouvez lire, versionner et faire évoluer avec votre projet.

<!-- features -->

- [**Choisir l’agent pour la tâche**](guide/choose-an-agent/): Comparez Codex, Claude Code, Kimi Code, Copilot CLI et Antigravity.
- [**Exécuter au bon endroit**](guide/choose-a-sandbox/): Choisissez Docker, Podman ou une sandbox cloud prise en charge.
- [**Composer votre propre agent**](guide/harness/): Associez un fournisseur de modèles, des outils en sandbox et des limites explicites.
