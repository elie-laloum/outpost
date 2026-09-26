---
title: "Images de conteneurs"
description: "Construire une image avec les outils de votre agent et du projet."
---

Générez une recette d’image avec `outpost init`. Les projets Docker et Podman construisent leur image par défaut.

```sh
npx outpost init --yes --sandbox-provider docker --image outpost:dev
```

## Reconstruire après personnalisation

Ajoutez les outils du projet à la recette générée, puis reconstruisez avec le même nom d’image que dans la configuration du fournisseur.

```sh
npx outpost image build --engine docker --image outpost:dev
```

Utilisez `--file` pour une recette personnalisée et `--directory` pour un autre contexte de build. `--uid` et `--gid` contrôlent la configuration de l’utilisateur du conteneur lorsque le build le permet.

## Garder l’état hors de l’image

Installez les binaires et paquets système dans l’image. Fournissez les identifiants de compte à l’exécution via le harness. Le home privé de l’agent est éphémère et doit appartenir au bon utilisateur ; n’intégrez pas de connexion hôte dans une couche d’image.

Les versions CLI npm générées sont fixées par Outpost. Antigravity utilise un installateur téléchargeant la version courante. Fournissez votre image figée si la reproductibilité exige un binaire Antigravity vérifié.

`outpost image remove` supprime l’image sélectionnée. Les volumes de cache de dépendances ont une durée de vie distincte.

API : [agentVersions](../../reference/agentversions/).
