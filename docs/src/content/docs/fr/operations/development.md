---
title: "Développer et vérifier Outpost"
description: "Développer et vérifier Outpost — Outpost"
sidebar:
  order: 4
---

Le dépôt modifiable est [GitLab](https://gitlab.elielaloum.com/elielaloum/outpost). GitHub est le miroir utilisé pour la CI, les packages et l’hébergement documentaire.

```sh
npm ci
npm run check
npm run coverage
npm run test:package
npm run format:check
```

`check` lance contrôles d’architecture, vérification TypeScript, tests unitaires/fonctionnels et compilation du package. La couverture impose 80 % au minimum pour lignes, fonctions et branches. Les modules de types effacés sont exclus de la couverture d’exécution ; le typage et le consommateur du package vérifient les déclarations.

Les tests unitaires/fonctionnels utilisent agents factices et dépôts temporaires, sans accès modèle payant. Le test du package installe l’archive dans un projet isolé, vérifie imports et déclarations, puis lance l’initialisation. Les tests de containers exigent Docker/Podman et l’image générée `outpost-ci:latest`.

La CI couvre Linux, Windows et macOS, plus de vraies exécutions Docker/Podman. Les contrats des SDK cloud utilisent des doubles ; disponibilité cloud/modèle et comptes réels exigent des tests séparés.

## Développer la documentation

```sh
npm ci --prefix docs
npm run docs:sync
npm run docs:check
npm run docs:dev
```

Les pages Markdown résident dans `docs/src/content/docs`, avec leurs équivalents français dans `fr`. Ajoutez les deux langues pour chaque guide. Les pages API et copies du changelog sont synchronisées depuis les déclarations du package et le changelog racine. Ne modifiez pas les contrats générés à la main ; changez les sources puis lancez `docs:sync`.

`npm run docs:build` construit le site statique ; `npm run docs:test` valide liens émis, routes de langue, recherche et exemples de code. La CI vérifie `main` et les pull requests sans les déployer. Les releases publient le site.
