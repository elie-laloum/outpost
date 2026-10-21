---
title: "Installer Outpost"
description: "Préparer le paquet, l’image et la configuration pour une première tâche."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="préparer-laccès-de-lagent"></span>
<span id="créer-le-fichier-de-configuration"></span>

## Avant de commencer

Ce tutoriel utilise Codex dans Docker pour travailler sur un dépôt Git. Préparez Node.js 24 ou une version ultérieure, Git, un dépôt contenant au moins un commit et un moteur Docker démarré. Vos scripts peuvent se trouver dans ce dépôt ou dans un dossier séparé.

## Installer le paquet

Exécutez ces commandes dans le dossier de vos scripts. La seconde en fait un projet ESM afin que Node.js exécute directement les exemples TypeScript. Si votre projet utilise déjà CommonJS, créez un dossier de scripts séparé avec son propre manifeste.

```sh
npm install @elie-laloum/outpost
npm pkg set type=module
```

Les fonctions d’exécution s’importent depuis `@elie-laloum/outpost/core`. Les workflows utilisent `/workflows`, les fournisseurs leur entrée `/providers/*`. Consultez les [points d’entrée du paquet](../integration-ports/#choisir-un-point-dentrée-du-paquet) pour remplacer les imports racine d’un script existant.

## Construire l’image des agents

Écrivez la recette officielle de l’image Codex dans un dossier dédié, puis construisez-la pour votre utilisateur. La première construction télécharge la CLI Codex et peut prendre plusieurs minutes.

```sh
npx outpost image eject --image codex --directory images/codex
npx outpost image build --directory images/codex --tag outpost-codex:dev
```

Attendez la réussite de la construction. Commitez `images/codex` avec vos scripts si vous voulez la réutiliser ou la personnaliser. Pour ajouter les outils du projet, utiliser un autre agent ou Podman, consultez [Images d’agent](../agent-images/).

## Préparer l’accès à l’agent

La configuration ci-dessous utilise une session Codex enregistrée sur votre machine. Suivez [Configurer Codex](../codex/#se-connecter-avec-son-compte) avant de lancer une tâche. Pour une clé API, consultez [Authentification](../authentication/) : les accès par compte et par API ont des facturations distinctes.

## Enregistrer la configuration

Enregistrez `outpost.config.ts` à côté de vos scripts. Remplacez le chemin du dépôt par le chemin absolu de votre copie de travail. Les scripts importent explicitement ces valeurs ; aucun chargement automatique de configuration n’est nécessaire.

```ts title="outpost.config.ts"
import { createAgent, createCodexHarness } from "@elie-laloum/outpost/core";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const coder = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});
export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost-codex:dev",
});
export const repository = "/absolute/path/to/your-repository";
```

Enregistrez ensuite chaque onglet de code sous le nom indiqué, à côté de cette configuration sauf précision contraire. Les exemples utilisent des fichiers et imports `.ts`, exécutables avec Node.js 24+ sans compilation préalable.

## Vérifier l’image

Lancez les contrôles locaux avant un appel au modèle :

```sh
npx outpost doctor --image outpost-codex:dev
```

Corrigez les lignes `FAIL` à l’aide du guide [Diagnostic](../diagnostics/). `doctor` vérifie les outils et l’image, pas votre connexion ni l’accès au modèle. Vous pouvez maintenant lancer [votre première tâche](../first-request/) ou [votre première recette YAML](../yaml-recipes/).
