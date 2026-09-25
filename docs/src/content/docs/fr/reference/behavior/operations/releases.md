---
title: "Releases des packages et de la documentation"
description: "Releases des packages et de la documentation — Outpost"
sidebar:
  order: 5
---

Créez commits et tags de version sur GitLab. Le miroir les transmet à GitHub, où Actions vérifie et publie. Ne publiez pas les changements de source directement dans le miroir GitHub.

## Procédure de release

1. Mettre à jour `package.json`, son lockfile et `CHANGELOG.md` avec la prochaine version stable.
2. Lancer `npm run docs:sync` et les contrôles nécessaires ; commiter sur GitLab.
3. Attendre la réussite de la CI sur le commit miroir.
4. Créer `v<version>` sur GitLab à ce commit exact.
5. Vérifier les packages, l’archive de release GitHub et le déploiement Pages.

`Release` vérifie tag/version, lance la CI réutilisable, compile, publie GitHub Packages et crée une release avec son `.tgz`. npm utilise OIDC trusted publishing et la provenance lorsque `NPM_PUBLISH=true`. Les deux registres reçoivent des métadonnées de dépôt correspondant à l’origine GitHub du workflow ; GitLab reste la source de vérité.

La confiance npm doit viser le propriétaire `elie-laloum`, le dépôt `outpost` et le workflow `release.yml`. Aucun jeton de publication ne doit être versionné. Les versions sont immuables : examinez une publication partielle avant de relancer, et utilisez une nouvelle version pour un contenu modifié. Ne déplacez jamais un tag publié.

## Un seul site documentaire

Le site est [elie-laloum.github.io/outpost](https://elie-laloum.github.io/outpost/). Aucun dépôt ou déploiement de preview séparé. `main` et les pull requests vérifient seulement la documentation. Une release stable réussie déploie les documents de son commit exact, avec l’anglais à la racine et le français sous `/fr/`.

Le déploiement vérifie que la release est toujours la dernière version stable publiée avant de mettre à jour Pages. Il utilise l’environnement `github-pages`, `pages: write` et `id-token: write` ; les vérifications ordinaires sont en lecture seule. Activez Pages avec GitHub Actions comme source.
