---
title: "Fournisseurs de modèles — Vue d’ensemble"
description: "Un fournisseur de modèles envoie du texte directement à une API, indépendamment de l’allocation de sandbox."
sidebar:
  label: Vue d’ensemble
  order: 0
---

:::caution[Expérimental]
Cette famille expose uniquement des appels textuels directs. Le harness d’agent pour les outils, les modifications du dépôt et les conversations est prévu en deuxième phase ; ces contrats peuvent évoluer.
:::

Un fournisseur de modèles envoie des requêtes textuelles directement à une API. La première implémentation expérimentale, `openaiCompatible()`, fonctionne sans Codex via Chat Completions ou Responses. Un provider de sandbox possède séparément l’environnement où les commandes s’exécutent.

## Fonctionnement et philosophie

Créez le client avec une URL de base d’API, un modèle et une clé bearer explicites (ou false sans authentification), puis appelez `generate()` avec du texte. Chaque appel s’exécute dans le processus appelant, gère son délai et renvoie le texte complet et la consommation déclarée si présente. Aucune sandbox n’est allouée.

## Limites et responsabilités

La première phase accepte uniquement le texte sans streaming. L’exécution d’outils, la modification du dépôt, la persistance des conversations et l’intégration au dispatch attendent le harness d’agent en deuxième phase. Le client refuse les réponses non prises en charge et ne répète aucun appel automatiquement. Ses contrats publics restent expérimentaux ; les fixtures HTTP locales ne prouvent pas la compatibilité avec un service réel.

## Points d’entrée

- [openaiCompatible](../../openaicompatible/)
- [OpenAICompatibleOptions](../../openaicompatibleoptions/)
- [ModelProvider](../../modelprovider/)
- [ModelRequest](../../modelrequest/)
- [ModelResult](../../modelresult/)

[Passer à la pratique avec le Guide](../../../guide/advanced/model-providers/).
