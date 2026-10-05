---
title: "Installation"
description: "Installez Outpost, construisez l’image des agents et créez votre configuration TypeScript."
---

## Avant de commencer

Il vous faut Node.js 24 ou une version plus récente, Git, un dépôt contenant au moins un commit et Docker en cours d’exécution. Ce guide utilise Codex ; vous pourrez ensuite [choisir un autre agent](../choose-an-agent/).

Exécutez les commandes suivantes dans le dossier où vous souhaitez écrire vos scripts. Vous pouvez utiliser votre dépôt ou un dossier séparé.

## Installer le paquet

Vos scripts importent la bibliothèque depuis ce paquet. La deuxième commande ajoute `"type": "module"` au `package.json` du dossier pour que Node.js exécute les exemples `.ts` comme des modules ESM. Si votre dépôt utilise CommonJS, gardez ces scripts dans un dossier séparé avec son propre `package.json`.

```sh
npm install @elie-laloum/outpost
npm pkg set type=module
```

La commande `outpost` sert notamment à construire les images et à vérifier votre environnement.

## Construire l’image des agents

Générez et construisez l’image dans un dossier dédié :

```sh
npx outpost init --yes --directory .outpost-image --image outpost:dev
```

La première construction télécharge les outils des agents et peut prendre quelques minutes. Attendez qu’elle se termine avant de lancer une tâche.

Ici, `init` prépare le Dockerfile et construit l’image. La commande génère aussi des exemples de workflow dans `.outpost-image` ; dans la suite du guide, vous écrirez vos propres scripts. Vous n’avez pas besoin d’exécuter le projet généré.

Vous pouvez modifier `.outpost-image/Dockerfile` pour ajouter les outils de votre projet, puis reconstruire l’image avec `npx outpost image build --directory .outpost-image --image outpost:dev`. La page [Construire une image d’agent](../agent-images/) explique aussi comment utiliser Podman.

## Préparer l’accès de l’agent

La configuration ci-dessous utilise votre compte Codex. Connectez-vous d’abord sur votre machine en enregistrant les identifiants dans un fichier. La page [Configurer Codex](../codex/#se-connecter-avec-son-compte) indique la commande et l’emplacement de ce fichier.

Pour utiliser une clé d’API ou un autre agent, consultez [Authentification](../authentication/). L’accès par compte et l’accès par API sont facturés séparément.

## Créer le fichier de configuration

Enregistrez ce fichier à côté de vos scripts. Il déclare l’agent, l’image et le dépôt ; vos scripts importeront ces valeurs explicitement.

```ts title="outpost.config.ts"
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const coder = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});
export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
});
export const repository = process.env.OUTPOST_REPOSITORY ?? process.cwd();
```

`repository` utilise le dossier courant, sauf si vous définissez `OUTPOST_REPOSITORY` avec le chemin absolu d’un autre dépôt. Si vos scripts se trouvent hors du dépôt, renseignez cette variable avant de les exécuter.

Tous les fichiers TypeScript du guide utilisent l’extension `.ts`, y compris dans les imports. Node.js 24 les exécute directement ; vous n’avez pas besoin de les compiler avant de les lancer.

Les exemples plus longs du guide sont répartis en plusieurs fichiers, présentés dans des onglets. Enregistrez chaque onglet sous le nom indiqué, dans le même répertoire que cette configuration. Le texte précise quel script exécuter.

## Vérifier l’image

`doctor` vérifie les outils locaux et l’image. Il n’envoie aucune requête au modèle et ne teste pas votre connexion. Si une vérification échoue, la commande se termine avec le code 1 ; la page [Diagnostiquer un problème](../diagnostics/) explique le rapport.

```sh
npx outpost doctor --image outpost:dev
```

Vous pouvez maintenant [lancer votre première tâche](../first-request/).
