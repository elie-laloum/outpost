---
title: "Conversations — Vue d’ensemble"
description: "Une conversation est l’historique natif de l’agent, stocké séparément des fichiers Git et des ressources de sandbox."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Une conversation est l’historique natif de l’agent, stocké séparément des fichiers Git et des ressources de sandbox. Le conserver permet de poursuivre une investigation lors d’une exécution ultérieure, sans confondre réutilisation d’une branche et restauration du contexte de l’agent.

## Fonctionnement et philosophie

Un store de conversations localise, capture et restaure les transcripts natifs. Une continuation reprend une identité ; un fork crée une alternative à partir du contexte capturé. La relocalisation des chemins adapte les transcripts lors d’un changement d’environnement. Claude et Codex proposent des stores natifs ; un store personnalisé implémente le même port de persistance.

## Limites et responsabilités

Bifurquer une conversation ne bifurque pas ses fichiers. Choisissez un workspace séparé lorsque les alternatives doivent rester isolées. L’authentification est indépendante du stockage des transcripts, qui peuvent contenir des données sensibles. Gemini ne propose actuellement ni capture native, ni reprise, ni fork.

## Points d’entrée

- [conversations](../../conversations/)
- [ConversationStore](../../conversationstore/)
- [ConversationContext](../../conversationcontext/)
- [ConversationRecord](../../conversationrecord/)
- [ConversationFormat](../../conversationformat/)

[Passer à la pratique avec le Guide](../../../guide/agents/conversations/).
