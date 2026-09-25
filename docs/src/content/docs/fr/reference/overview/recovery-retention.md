---
title: "Récupération et rétention — Vue d’ensemble"
description: "Les données de récupération préservent le travail lorsque le nettoyage normal supprimerait des éléments utiles ou des modifications."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Les données de récupération préservent le travail lorsque le nettoyage normal supprimerait des éléments utiles ou des modifications. La rétention décide des données stockées pouvant être supprimées plus tard. Ces responsabilités sont séparées : l’échec d’une opération ne doit pas détruire automatiquement les éléments nécessaires pour la comprendre ou récupérer son travail.

## Fonctionnement et philosophie

Vérifiez un transfert conservé avant d’envisager sa restauration. La planification de rétention décrit les candidats et motifs sans les supprimer. Le nettoyage effectue la suppression explicite après reprise de propriété et nouvelle validation des candidats. Les contrôles de quota comparent le stockage observé à une limite configurée.

## Limites et responsabilités

Un plan peut devenir obsolète pendant d’autres opérations. La rétention n’est pas une politique de sauvegarde, et les contrôles de stockage observé ne sont pas des quotas physiques du système de fichiers. Utilisez la famille de restauration pour appliquer les données conservées plutôt que les supprimer.

## Points d’entrée

- [verifyRecoveryTransfer](../../verifyrecoverytransfer/)
- [planRecoveryRetention](../../planrecoveryretention/)
- [pruneRecoveryRetention](../../prunerecoveryretention/)
- [assertRecoveryQuota](../../assertrecoveryquota/)
- [RecoveryRetentionPlan](../../recoveryretentionplan/)

[Passer à la pratique avec le Guide](../../../guide/operations/recovery/).
