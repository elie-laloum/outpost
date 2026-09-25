---
title: "Installation"
description: "Installation — Outpost"
sidebar:
  order: 1
---

## Prérequis

- Node.js **24+** et Git sur l’hôte.
- Un dépôt Git existant, avec au moins un commit et une identité de commit configurée.
- Docker ou Podman démarré pour l’isolation locale, ou les identifiants d’un provider cloud pris en charge.
- Les identifiants de votre agent de code. Les identifiants Git n’authentifient pas le modèle.

Outpost utilise exclusivement ESM. Écrivez un script `.mts`, ou `.ts` dans un package déclarant `"type": "module"`. Node 24 exécute directement les exemples, sans outil TypeScript supplémentaire. Ne placez pas vos scripts exécutables dans `node_modules`.

## Installer depuis npm

```sh
npm install --save-dev @elie-laloum/outpost
npx outpost --help
```

Installez le package dans le dépôt sur lequel vous allez travailler. Ajoutez un numéro de version au nom du package pour figer une release. Docker, Podman et l’exécution locale ne nécessitent aucun SDK cloud.

## Dépendances cloud

```sh
npm install @vercel/sandbox
```

Pour Daytona, installez plutôt `@daytona/sdk`. Importez chaque provider via son sous-chemin `@elie-laloum/outpost/providers/*` : les autres SDK cloud restent facultatifs. Consultez le [choix du provider](../../environment/providers/overview/).

## Autres registres et compilation locale

L’archive `.tgz` d’une [release GitHub](https://github.com/elie-laloum/outpost/releases) s’installe avec `npm install --save-dev ./downloaded-package.tgz`. GitHub Packages est également disponible : configurez `@elie-laloum:registry=https://npm.pkg.github.com` dans `.npmrc`, puis authentifiez-vous séparément. Ne versionnez jamais les jetons de registre.

Depuis les sources, lancez `npm ci`, `npm run build`, puis `npm pack`. Installez ensuite l’archive dans votre projet. Le package contient JavaScript, déclarations, source maps et licence ; le site documentaire possède ses propres dépendances.

Continuez avec le [démarrage rapide](../quickstart/).
