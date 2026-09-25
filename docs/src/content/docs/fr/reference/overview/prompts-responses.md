---
title: "Prompts et réponses — Vue d’ensemble"
description: "Les prompts décrivent le travail demandé à l’agent ; les contrats de réponse décrivent les données que le programme accepte de sa réponse."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Les prompts décrivent le travail demandé à l’agent ; les contrats de réponse décrivent les données que le programme accepte de sa réponse. Séparer ces responsabilités garde la tâche lisible tout en fournissant une valeur validée au code qui suit.

## Fonctionnement et philosophie

Un brief peut fournir un texte littéral ou un fichier avec des substitutions déclarées. `response.text` extrait un texte balisé ; `response.json` analyse et valide du JSON balisé. La validation précise la sortie inconnue du modèle avant son utilisation par le programme. Les adapters compatibles peuvent demander un nombre borné de réparations.

## Limites et responsabilités

Une réponse valide ne prouve pas que ses affirmations sont vraies ni que le code proposé passe les tests. Gardez les vérifications factuelles et les contrôles d’exécution explicites. L’expansion de commandes dans les templates possède aussi sa frontière de confiance : les valeurs insérées dans une commande shell existante doivent être fiables ou protégées par l’auteur du prompt.

## Points d’entrée

- [Brief](../../brief/)
- [PromptVariables](../../promptvariables/)
- [response](../../response/)
- [ResponseSpec](../../responsespec/)
- [StandardValidator](../../standardvalidator/)
- [ResponseError](../../responseerror/)

[Passer à la pratique avec le Guide](../../../guide/agents/responses/).
