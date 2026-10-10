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
  secondary: { label: "Relier deux tâches", href: "guide/first-workflow/" }
  story:
    label: "Exemple de workflow"
    title: "Du brief au commit, un parcours explicite."
    steps:
      - title: "Définir le travail"
        text: "Un dépôt, un brief et une branche pour la tâche."
        role: "Vous"
        icon: "branch"
        href: "guide/git-workspaces/"
      - title: "Lancer votre agent"
        text: "Codex, Claude Code ou un autre agent dans la sandbox choisie."
        role: "Agent"
        icon: "agent"
        href: "guide/first-workflow/"
      - title: "Exécuter vos tests"
        text: "Vos critères décident de la suite : corriger, poursuivre ou arrêter."
        role: "Workflow"
        icon: "ci"
        href: "guide/verification-loops/"
      - title: "Relire les commits"
        text: "Vous choisissez les changements à intégrer."
        role: "Vous"
        icon: "branch"
        href: "guide/git-workspaces/"
    result:
      label: "Une branche pour votre revue"
      branch: "outpost/fix-tests"
      text: "Le correctif et ses commits, prêts à être relus."
      href: "guide/git-workspaces/"
    link: { label: "Construire ce workflow", href: "guide/first-workflow/" }
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
    text: "Après votre première tâche, choisissez le problème à résoudre. Ces guides se consultent indépendamment."
    items:
      - title: "Agents et sandboxes"
        text: "Choisissez l’agent de code indépendamment de son environnement : conteneurs, sandboxes cloud ou exécution locale explicite."
        href: "guide/choose-an-agent/"
      - title: "Workflows typés"
        text: "Reliez les résultats par des dépendances. Exécutez les tâches indépendantes en parallèle et transmettez des valeurs typées entre les étapes."
        href: "guide/task-dependencies/"
      - title: "Reprise des exécutions"
        text: "Enregistrez les tâches terminées et la consommation cumulée dans un checkpoint. Reprenez un workflow après une récupération explicite."
        href: "guide/durable-runs/"
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

<span id="une-tâche-pour-commencer-un-workflow-pour-la-suite"></span>

Choisissez votre point de départ : [un script TypeScript](guide/setup/) ou [une première recette YAML](guide/yaml-recipes/). Les deux utilisent les mêmes agents et sandboxes.

## Lancer une tâche et lire la réponse

Demandez à un agent de relire votre README dans sa propre sandbox Docker et son espace de travail Git. Partez d’un dépôt contenant un `README.md` commité ; cet exemple ne demande ni tests en échec ni vérifications propres au projet.

Suivez l’[installation](guide/setup/) pour installer le paquet, construire `outpost:dev`, préparer la connexion de l’agent et activer ESM. Enregistrez ces deux fichiers à la racine du dépôt, puis lancez `node task.ts` avec Node.js 24 ou une version ultérieure.

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
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/readme-review" },
  brief: {
    text: "Review README.md for unclear instructions. Do not edit files.",
  },
});
console.log(result.text);
```

Le script affiche la revue de l’agent. Il peut aussi ne trouver aucun problème. La consigne demande de ne rien modifier ; elle n’impose pas un accès en lecture seule. Inspectez les éventuels commits sur `outpost/readme-review` avant de les intégrer, et choisissez un nouveau nom de branche pour une autre tâche. [Votre première tâche](guide/first-request/) détaille ces vérifications.

<span id="livrer-un-export-csv-du-ticket-à-la-branche"></span>

## Relier le résultat à l’étape suivante

Une fois la tâche en place, un workflow peut transmettre son résultat à votre code TypeScript. Commencez par deux étapes ; ajoutez les tests, approbations ou nouvelles tentatives dont votre tâche a besoin.

<!-- canvas -->

- [**Relire le README**](guide/first-request/): Un agent produit ses remarques depuis un espace de travail séparé.
  - Agent
  - → **Préparer un résumé**: résultat de la tâche
- [**Préparer un résumé**](guide/first-workflow/): Votre fonction TypeScript sélectionne la réponse et la branche.
  - Workflow
  - → **Examiner le résultat**: valeur typée
- [**Examiner le résultat**](guide/first-workflow/): Affichez le résumé et décidez de la suite.
  - Vous

[Votre premier workflow](guide/first-workflow/) fournit les fichiers complets et la commande. Vous préférez les fichiers de configuration ? [Lancez une première recette YAML](guide/yaml-recipes/) pour obtenir le même point de départ.

<span id="commencez-par-ce-qui-vous-attend-déjà"></span>

<span id="vos-outils-habituels-votre-façon-de-les-assembler"></span>

## Choisir la suite

Ces parcours partent du premier résultat. Suivez celui qui répond à votre besoin.

<!-- features -->

- [**Vérifier le travail d’un agent**](guide/verification-loops/): Exécutez une vraie vérification et transmettez ses échecs à une boucle de correction bornée.
- [**Conserver les changements pour revue**](guide/git-workspaces/): Choisissez une branche et inspectez ses commits avant l’intégration.
- [**Obtenir une réponse structurée**](guide/typed-responses/): Validez le JSON avant de le transmettre à une autre tâche.
