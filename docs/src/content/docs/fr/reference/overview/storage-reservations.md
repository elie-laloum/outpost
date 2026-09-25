---
title: "Réservations de stockage — Vue d’ensemble"
description: "Une réservation de stockage coordonne l’admission avant que des opérations coopérantes écrivent leurs données de récupération."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Une réservation de stockage coordonne l’admission avant que des opérations coopérantes écrivent leurs données de récupération. Elle enregistre une demande de stockage prévue pour que plusieurs writers tiennent compte les uns des autres, au lieu de décider depuis le même inventaire obsolète.

## Fonctionnement et philosophie

`reserveRecoveryStorage` renvoie une réservation avec une durée de vie explicite. Ses options décrivent les limites d’admission et la propriété. Un workspace peut posséder la réservation dans son cycle de vie ; les autres appelants doivent libérer celles dont ils sont responsables.

## Limites et responsabilités

Les réservations coordonnent les writers coopérants ; elles ne contraignent pas les processus arbitraires et ne garantissent pas l’espace disque libre. Distinguez-les de la rétention, qui supprime des données stockées, et de l’inspection des quotas, qui observe le stockage courant. Une réservation n’est pas un quota physique du système de fichiers.

## Points d’entrée

- [reserveRecoveryStorage](../../reserverecoverystorage/)
- [RecoveryStorageReservationOptions](../../recoverystoragereservationoptions/)
- [StorageReservation](../../storagereservation/)
- [StorageReservationOptions](../../storagereservationoptions/)

[Passer à la pratique avec le Guide](../../../guide/operations/storage-retention/).
