---
title: "Model providers — Vue d’ensemble"
description: "Un fournisseur de modèles porte le transport de requêtes utilisé par un harness personnalisé."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Le contrat `ModelProvider` et les adaptateurs OpenAI et Anthropic sont stables en 7.0.0. Le [bilan de validation](../../../guide/model-providers/#validation) précise les modèles et configurations testés.

Un fournisseur de modèles porte le transport de requêtes utilisé par un harness personnalisé. `createOpenAIModelProvider()` prend en charge les services Chat Completions et Responses ; `createAnthropicModelProvider()` utilise Anthropic Messages avec cache optionnel du préfixe système. L’allocation du sandbox est indépendante.

## Fonctionnement

Configurez l’endpoint, les identifiants explicites et les bornes des requêtes, puis passez le fournisseur à `createHarness({ modelProvider, tools, instructions, limits })`. Composez ce harness avec `createAgent({ harness, model })` ; la boucle Outpost appelle le modèle et exécute ses outils dans la sandbox empruntée. Les requêtes tournent dans le processus Outpost, propagent l’annulation et comptabilisent une seule fois l’usage rapporté, y compris celui des enfants et des résumés de contexte.

## Frontières et responsabilités

Le modèle de l’agent est un nom non vide, éventuellement accompagné de `reasoning` et `maxOutputTokens` que le fournisseur valide à la composition. Le service vérifie la disponibilité lors de l’appel ; aucun catalogue local, retry ni repli de protocole. Ces transports traduisent les appels d’outils sans jamais les exécuter ; les résultats indiquent une raison d’arrêt normalisée au lieu de masquer une troncature ou un refus. Les fixtures HTTP locales valident les contrats sans prouver la compatibilité authentifiée de tous les services.

## Points d’entrée

- [createOpenAIModelProvider](../../createopenaimodelprovider/)
- [createAnthropicModelProvider](../../createanthropicmodelprovider/)
- [ModelProvider](../../modelprovider/)
- [ModelRequest](../../modelrequest/)
- [ModelResult](../../modelresult/)

[Apprendre avec le guide pratique](../../../guide/model-providers/).
