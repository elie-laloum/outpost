---
title: "Dispatch — Vue d’ensemble"
description: "Le dispatch est l’opération qui confie un brief à un agent et collecte ce qui s’est passé : tours, texte, sortie typée, usage, commits et données de conversation disponibles."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Le dispatch est l’opération qui confie un brief à un agent et collecte ce qui s’est passé : tours, texte, sortie typée, usage, commits et données de conversation disponibles. Il relie le protocole de l’agent au workspace dans lequel il agit.

## Fonctionnement et philosophie

La fonction `dispatch` de premier niveau alloue et ferme son propre environnement. Appeler `sandbox.dispatch` utilise plutôt un environnement déjà actif appartenant à l’appelant. Passes, délais, annulation et validation de réponse encadrent l’opération ; la continuation peut transmettre le contexte natif de l’agent à une exécution ultérieure.

## Limites et responsabilités

Lisez le résultat selon son contrat. Un marqueur de fin, une réponse produite ou un commit ne prouve pas que les tests ont réussi. Utilisez une vraie commande ou un contrôle de workflow pour les vérifications que le programme doit imposer. L’intégration Git reste une décision de politique distincte.

## Points d’entrée

- [dispatch](../../dispatch/)
- [DispatchOptions](../../dispatchoptions/)
- [DispatchResult](../../dispatchresult/)
- [WarmDispatchResult](../../warmdispatchresult/)
- [ContinuationOptions](../../continuationoptions/)

[Passer à la pratique avec le Guide](../../../guide/agents/dispatch/).
