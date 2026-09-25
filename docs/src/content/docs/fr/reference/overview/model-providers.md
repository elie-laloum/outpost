---
title: "Model providers — Vue d’ensemble"
description: "Un fournisseur de modèles porte le transport de requêtes utilisé par un harness personnalisé."
sidebar:
  label: Vue d’ensemble
  order: 0
---

:::caution[Expérimental — refonte non publiée]
Les requêtes texte bornées et les callbacks personnalisés sont implémentés. La boucle d’outils intégrée, le streaming et les conversations natives personnalisées restent prévus.
:::

Un fournisseur de modèles porte le transport de requêtes utilisé par un harness personnalisé. `openaiModelProvider()` prend en charge les services Chat Completions et Responses ; `anthropicModelProvider()` utilise Anthropic Messages avec cache optionnel du préfixe système. L’allocation du sandbox est indépendante.

## Fonctionnement

Configurez endpoint, credentials explicites et limites, puis transmettez le fournisseur à `customHarness({ modelProvider, run })`. Le callback utilise `context.modelProvider.request()` avec le modèle de l’agent. Les requêtes tournent dans le processus Outpost et héritent de l’annulation ; l’usage rapporté est cumulé une fois par appel.

## Frontières et responsabilités

Les identifiants sont des chaînes non vides arbitraires. Le service vérifie la disponibilité lors de l’appel ; aucun catalogue local, retry ni repli de protocole. Ces transports refusent les réponses d’outils et sorties incomplètes. Les fixtures HTTP locales valident les contrats sans prouver la compatibilité authentifiée de tous les services.

## Points d’entrée

- [openaiModelProvider](../../openaimodelprovider/)
- [anthropicModelProvider](../../anthropicmodelprovider/)
- [ModelProvider](../../modelprovider/)
- [ModelRequest](../../modelrequest/)
- [ModelResult](../../modelresult/)

[Apprendre avec le guide pratique](../../../guide/advanced/model-providers/).
