---
title: Outpost
description: "Automatisez les corrections, les revues de code et la maintenance avec vos agents. Outpost gère les sandboxes et les espaces de travail Git ; vous composez les étapes, les tests et les validations en TypeScript."
tableOfContents: false
landing:
  category: "L’orchestration d’agents de code, en TypeScript"
  headline: ["Vos agents codent.", "Vous gardez la main."]
  lead: "Confiez vos corrections, vos revues de code et votre maintenance à des agents. Outpost gère leurs sandboxes et leurs espaces de travail Git. Vous reliez leur travail avec des tests et des validations en TypeScript."
  primary: { label: "Lancer ma première tâche", href: "guide/setup/" }
  secondary: { label: "Explorer l’API", href: "reference/" }
  overview:
    - title: "Vos agents habituels"
      text: "Retrouvez Codex, Claude Code et les autres agents pris en charge. Choisissez celui qui convient à chaque tâche."
      href: "guide/choose-an-agent/"
    - title: "L’environnement qui convient"
      text: "Exécutez les tâches dans Docker, Podman ou une sandbox cloud prise en charge."
      href: "guide/choose-a-sandbox/"
    - title: "Des changements à relire"
      text: "Récupérez une branche Git, les commits et la réponse de l’agent. Choisissez ce que vous voulez intégrer."
      href: "guide/repository-and-branch/"
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
  next:
    title: "Confiez votre prochaine tâche à un agent."
    text: "Installez Outpost, construisez votre image et lancez un premier correctif depuis un script TypeScript."
    guide: { label: "Lancer ma première tâche", href: "guide/setup/" }
    reference: { label: "Explorer l’API", href: "reference/" }
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

## Un premier correctif, en deux fichiers TypeScript

Confiez les tests en échec à Codex et demandez-lui un correctif. Outpost prépare son espace de travail dans une sandbox Docker et conserve ses commits sur une branche séparée. Vous pouvez continuer à travailler dans votre checkout courant pendant que l’agent s’occupe de sa tâche.

Enregistrez les deux fichiers dans votre dépôt. Lancez `node task.ts`, puis relisez la réponse et les commits sur la branche renvoyée. Choisissez un nouveau nom de branche pour chaque tâche indépendante.

[Votre première tâche](guide/first-request/) explique le résultat. La [référence API](reference/dispatch/) décrit le contrat complet.

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
  branch: { mode: "named", name: "outpost/fix-tests" },
  brief: { text: "Fix the failing tests, run them and commit the fix." },
});

console.log(result.text);
console.log(result.branch, result.commits);
```

:::note[Avant de lancer l’exemple]
Suivez [Installation](guide/setup/) pour construire `outpost:dev`, préparer la connexion de l’agent et déclarer `"type": "module"` dans votre `package.json`. Node.js 24 exécute directement ces fichiers `.ts`.
:::

## Chaque tâche a son espace de travail

Outpost s’occupe de préparer l’espace de travail Git, d’ouvrir la sandbox et de lancer l’agent. Lorsque `dispatch()` se termine, il ferme la sandbox qu’il a ouverte. Vous retrouvez la branche nommée et ses commits, prêts à être relus et intégrés quand vous le décidez.

<!-- canvas -->

- **Votre demande**: Choisissez l’agent, le dépôt et la sandbox en TypeScript.
  - Tâche
  - → **Espace de travail et sandbox**: préparer
- **Espace de travail et sandbox**: Outpost prépare le checkout de travail et ouvre l’environnement d’exécution.
  - Tâche
  - → **Travail de l’agent**: exécuter
- **Travail de l’agent**: L’agent lit les instructions, modifie les fichiers et lance des commandes.
  - Tâche
  - → **Résultat à relire**: récupérer
- **Résultat à relire**: Lisez la réponse, les commits et la consommation. Choisissez ce que vous voulez intégrer.
  - Tâche

Les instructions données à l’agent ne garantissent pas que les tests passent. Ajoutez une [étape de vérification](guide/verification-loops/) lorsque la réussite des tests doit décider de l’acceptation du travail. [Comment Outpost exécute une tâche](guide/how-it-works/) explique qui possède chaque ressource.

## Intégrez les agents à votre façon de travailler

Gardez une CLI prise en charge que vous connaissez, essayez un autre agent pour une tâche précise ou construisez votre propre boucle avec le harness Outpost. Choisissez séparément où il travaille. Le guide de chaque fournisseur vous aide à trouver l’environnement adapté et à le préparer.

<!-- features -->

- [**Agents de code**](guide/choose-an-agent/): Configurez Codex, Claude Code, Kimi Code, Copilot CLI ou Antigravity.
- [**Sandboxes**](guide/choose-a-sandbox/): Choisissez des conteneurs locaux ou un fournisseur cloud adapté à votre tâche.
- [**Votre propre boucle d’agent**](guide/harness/): Composez un fournisseur de modèles, des outils en sandbox et des limites explicites.

## Automatisez le travail qui revient

Une CI à réparer, une pull request à relire, des dépendances à mettre à jour : transformez ces tâches récurrentes en workflows que vous pouvez relancer. Reliez les étapes, lancez les tâches indépendantes en parallèle et choisissez où placer les tests et les validations humaines. Le guide [Votre premier workflow](guide/first-workflow/) montre comment aller plus loin à partir d’une tâche d’agent.

Commencez par un workflow pour l’un des besoins de votre équipe :

<!-- features -->

- [**Corriger une CI en échec**](guide/fix-failing-ci/): Renvoyez les échecs des tests à l’agent et vérifiez chaque nouvelle tentative.
- [**Relire une pull request**](guide/review-on-label/): Déclenchez une revue avec un label et récupérez un verdict typé.
- [**Lancer la maintenance chaque nuit**](guide/nightly-maintenance/): Planifiez les mises à jour sur des branches datées et récupérez un rapport.

Ajoutez des [réponses typées](guide/typed-responses/) lorsqu’une tâche attend des données structurées, des [validations humaines](guide/approvals/) pour faire approuver une étape, ou des [exécutions durables](guide/durable-runs/) pour reprendre après une interruption.
