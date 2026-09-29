---
title: "Images d’agent"
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

Toutes les versions CLI générées sont épinglées par Outpost. [Antigravity](../antigravity/) utilise des archives versionnées avec vérification SHA-512 et mises à jour automatiques désactivées. Régénérez ou modifiez les recettes existantes puis reconstruisez les images pour adopter cet installateur. Ces versions épinglées ne suffisent pas à rendre l’image entière reproductible octet par octet.

`outpost image remove` supprime l’image sélectionnée. Les volumes de cache de dépendances ont une durée de vie distincte.

API : [agentVersions](../../reference/agentversions/).
