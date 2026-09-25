---
title: "Activité des ressources — Vue d’ensemble"
description: "Les traces d’activité décrivent les durées de vie et opérations observées localement par Outpost."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Les traces d’activité décrivent les durées de vie et opérations observées localement par Outpost. Elles relient un workspace conservé, un bail ou une opération en échec à l’exécution qui l’a créé, sans supposer que la ressource distante existe toujours.

## Fonctionnement et philosophie

`inspectRecovery` collecte les informations de récupération à examiner. Les traces identifient phases, opérations et résultats enregistrés ; les entrées d’inspection expriment ce qui peut être établi depuis ces éléments locaux. Utilisez ces rapports pour choisir un diagnostic, une restauration ou une action de rétention.

## Limites et responsabilités

L’observation n’est ni l’inventaire d’un compte distant, ni une preuve d’activité, ni un nettoyage automatique. Un processus peut s’arrêter avant d’écrire sa dernière trace. Traitez prudemment la propriété incertaine et séparez l’inspection des actions qui modifient ou libèrent les ressources.

## Points d’entrée

- [inspectRecovery](../../inspectrecovery/)
- [RecoveryInspection](../../recoveryinspection/)
- [ResourceActivityRecord](../../resourceactivityrecord/)
- [ResourceInspection](../../resourceinspection/)
- [ResourceOperation](../../resourceoperation/)

[Passer à la pratique avec le Guide](../../../guide/operations/recovery/).
