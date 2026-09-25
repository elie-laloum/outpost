---
title: "Exécution spéculative — Vue d’ensemble"
description: "L’exécution spéculative explore plusieurs implémentations candidates avant d’en sélectionner une à intégrer."
sidebar:
  label: Vue d’ensemble
  order: 0
---

L’exécution spéculative explore plusieurs implémentations candidates avant d’en sélectionner une à intégrer. Chaque candidat produit son propre travail et ses éléments de validation. La comparaison devient une décision d’orchestration explicite, plutôt que de laisser des agents concurrents modifier le même checkout.

## Fonctionnement et philosophie

`speculate` coordonne exécution, validation et sélection des candidats via ses contrats d’options et de résultat. Les sorties candidates et l’instantané hôte fournissent les éléments nécessaires pour évaluer et appliquer correctement le résultat sélectionné. Le parallélisme ne supprime ni la propriété des workspaces ni les contrôles d’intégration.

## Limites et responsabilités

Cet assistant est une capacité de recherche activée explicitement. La sélection ne prouve pas la correction : imposez une validation pertinente avant l’intégration. Tenez compte des ressources et de l’usage des modèles pour tous les candidats, et préservez le travail récupérable en cas d’échec de validation ou de contrôle de l’état hôte.

## Points d’entrée

- [speculate](../../speculate/)
- [SpeculationOptions](../../speculationoptions/)
- [SpeculationResult](../../speculationresult/)
- [SpeculativeCandidate](../../speculativecandidate/)
- [SpeculativeValidation](../../speculativevalidation/)

[Passer à la pratique avec le Guide](../../../guide/advanced/speculation/).
