---
title: "Sécurité"
description: "Comprendre ce qu’expose votre environnement d’exécution."
---

Les agents de code exécutent les commandes du projet. Choisissez dépôt, identifiants, montages et accès réseau aussi délibérément que pour tout programme exécutant ce code.

## Accès au système de fichiers

Docker et Podman montent par défaut le checkout et des métadonnées Git inscriptibles. Ce n’est pas une frontière hostile protégeant le dépôt hôte d’un agent. Le [mode Git privé](../private-git/) évite ces montages, tandis que l’exécution locale n’apporte aucune isolation.

Périphériques, volumes hôte et caches partagés supplémentaires étendent les accès. Un montage en lecture seule expose malgré tout son contenu. Un agent peut lire les identifiants transmis à son environnement.

## Identifiants et données

Outpost lit uniquement les fichiers CLI sélectionnés et jamais un trousseau système. Les copies isolées utilisent des dossiers et fichiers privés. N’intégrez pas de secrets dans les images ou scripts suivis par Git. Les fournisseurs cloud reçoivent historique et entrées choisies ; les transports reçoivent les objets configurés pour persistance.

Les [serveurs MCP](../mcp-servers/) agissent avec l’autorité de l’agent et reçoivent les variables que vous nommez. Outpost n’écrit que des références de variables dans leur configuration. Avec le fournisseur local, les entrées Kimi et Antigravity sont fusionnées dans votre propre home. Une [connexion MCP](../mcp-oauth/) copiée dans une sandbox peut faire tourner le refresh token et invalider la connexion de l’hôte.

## Autorité applicative

Acteur d’approbation, producteur d’artefact et PID distant enregistré sont des métadonnées. Votre application authentifie les utilisateurs, autorise la publication et établit si un propriétaire distant est réellement arrêté. Empreintes et écritures conditionnelles protègent intégrité et concurrence ; elles n’établissent pas l’identité. De même, quiconque peut écrire dans le transport d’un [cache de tâches](../task-cache/) contrôle les résultats que les tâches en cache restaurent.

Utilisez les [règles de sortie](../network-restrictions/) lorsqu’elles sont prises en charge, mais vérifiez les capacités du fournisseur avant de considérer une politique comme imposée.
