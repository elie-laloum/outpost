---
title: "Erreurs — Vue d’ensemble"
description: "Les erreurs expliquent pourquoi une opération Outpost a échoué et quelles informations restent disponibles."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Les erreurs expliquent pourquoi une opération Outpost a échoué et quelles informations restent disponibles. Un code de faute permet un traitement programmatique ; le message décrit le problème immédiat ; les détails de récupération localisent le travail conservé lorsque l’échec a laissé un état récupérable.

## Fonctionnement et philosophie

Utilisez `OutpostError` et `FaultCode` pour reconnaître les échecs documentés sans analyser leur formulation. `recoveryDetails` extrait les informations de récupération prises en charge depuis une erreur. `quotaFault` reconnaît les limites d’usage et de débit, y compris imbriquées, et renvoie l’heure de réinitialisation signalée. Distinguez échec d’opération, résultat de commande non nul et tâche de workflow en échec : leurs contrats exposent ces résultats différemment.

## Limites et responsabilités

Ne relancez pas aveuglément après un échec ayant des effets externes. Examinez l’état conservé et déterminez si une autre tentative est sûre. Toute valeur levée n’est pas une erreur Outpost, et tout échec ne produit pas des artefacts de récupération. Le nettoyage doit préserver les éléments utiles sans masquer le problème initial.

## Points d’entrée

- [OutpostError](../../outposterror/)
- [FaultCode](../../faultcode/)
- [recoveryDetails](../../recoverydetails/)
- [quotaFault](../../quotafault/)

[Passer à la pratique avec le Guide](../../../guide/operations/recovery/).
