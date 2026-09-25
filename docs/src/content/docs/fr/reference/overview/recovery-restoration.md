---
title: "Restauration de récupération — Vue d’ensemble"
description: "La restauration applique les données d’un transfert conservé à un dépôt explicite après l’échec d’une synchronisation normale."
sidebar:
  label: Vue d’ensemble
  order: 0
---

La restauration applique les données d’un transfert conservé à un dépôt explicite après l’échec d’une synchronisation normale. Elle permet de récupérer délibérément le travail avec un plan examinable, sans traiter un transfert en échec comme une permission d’écraser le checkout hôte.

## Fonctionnement et philosophie

`planRecoveryRestore` décrit la restauration proposée et ses prérequis. `restoreRecoveryTransfer` effectue l’application selon ses règles de propriété et de validation. La vérification du transfert reste un prérequis distinct ; le plan et le résultat exposent ce qui doit être appliqué et ce qui s’est passé.

## Limites et responsabilités

Un dossier conservé est un élément à examiner, pas la preuve que toutes les données nécessaires existent. Vérifiez d’abord le transfert et le dépôt cible. Les modifications hôtes concurrentes doivent rester protégées, et les artefacts récupérables doivent survivre aux échecs empêchant une terminaison sûre.

## Points d’entrée

- [planRecoveryRestore](../../planrecoveryrestore/)
- [restoreRecoveryTransfer](../../restorerecoverytransfer/)
- [RecoveryRestoreOptions](../../recoveryrestoreoptions/)
- [RecoveryRestorePlan](../../recoveryrestoreplan/)
- [RecoveryRestoreResult](../../recoveryrestoreresult/)

[Passer à la pratique avec le Guide](../../../guide/operations/recovery-restoration/).
