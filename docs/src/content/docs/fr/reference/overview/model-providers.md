---
title: "Model providers — Vue d’ensemble"
description: "Un fournisseur de modèles porte le transport de requêtes utilisé par un harness personnalisé."
sidebar:
  label: Vue d’ensemble
  order: 0
---

:::caution[Expérimental — refonte non publiée]
Les requêtes bornées avec messages, appels d’outils, rejeu du raisonnement et cache d’historique sont implémentées, avec les callbacks personnalisés. La boucle d’outils intégrée, le streaming et les conversations natives personnalisées restent prévus.
:::

Un fournisseur de modèles porte le transport de requêtes utilisé par un harness personnalisé. `openaiModelProvider()` prend en charge les services Chat Completions et Responses ; `anthropicModelProvider()` utilise Anthropic Messages avec cache optionnel du préfixe système. L’allocation du sandbox est indépendante.

## Fonctionnement

Configurez endpoint, credentials explicites et limites, puis transmettez le fournisseur à `harness({ modelProvider, run })`. Le callback utilise `context.modelProvider.request()` avec le modèle de l’agent. Les requêtes tournent dans le processus Outpost et héritent de l’annulation ; l’usage rapporté est cumulé une fois par appel.

## Frontières et responsabilités

Le modèle de l’agent est un nom non vide, éventuellement accompagné de `reasoning` et `maxOutputTokens` que le fournisseur valide à la composition. Le service vérifie la disponibilité lors de l’appel ; aucun catalogue local, retry ni repli de protocole. Ces transports traduisent les appels d’outils sans jamais les exécuter ; les résultats indiquent une raison d’arrêt normalisée au lieu de masquer une troncature ou un refus. Les fixtures HTTP locales valident les contrats sans prouver la compatibilité authentifiée de tous les services.

## Points d’entrée

- [openaiModelProvider](../../openaimodelprovider/)
- [anthropicModelProvider](../../anthropicmodelprovider/)
- [ModelProvider](../../modelprovider/)
- [ModelRequest](../../modelrequest/)
- [ModelResult](../../modelresult/)

[Apprendre avec le guide pratique](../../../guide/advanced/model-providers/).
