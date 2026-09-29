---
title: "Réservations de stockage — Vue d’ensemble"
description: "Réservez des octets dans un registre partagé avant d’écrire, pour que des écrivains coopératifs respectent une même limite sous le .outpost d’un dépôt."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Ce qui compte dans maxBytes

L’admission réussit quand l’usage observé, les réservations actives et `reserveBytes` restent ensemble inférieurs ou égaux à `maxBytes`. Le registre est l’objet `reservations/ledger` du transport choisi.

| Terme                | Transport par défaut (`.outpost/storage`)                                                    | `transporter` explicite                                 |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Usage observé        | Octets des fichiers sous `.outpost/recovery`, `logs`, `locks`, `workspaces` et `storage`     | Tailles de tous les objets listés, sauf le registre     |
| Réservations actives | Somme des `reserveBytes` de toutes les entrées du registre, abandonnées comprises            | Idem                                                    |
| Limite d’inventaire  | `maxEntries` fichiers et répertoires, 100000 par défaut ; un inventaire incomplet est refusé | `maxEntries` objets, 100000 par défaut ; au-delà, refus |

:::caution
Une réservation n’engage que les écrivains qui réservent. Ce n’est pas un quota du système de fichiers : d’autres processus peuvent toujours écrire dans `.outpost` ou remplir le disque.
:::

## Fin d’une réservation

| Événement                                                                         | Résultat                                                                             |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| La demande tient dans la limite                                                   | Entrée ajoutée par écriture conditionnelle ; se résout avec une `StorageReservation` |
| Au-delà de `maxBytes`, inventaire incomplet, options invalides, registre malformé | Rejette avec le code `configuration`                                                 |
| 100 écritures du registre en conflit d’affilée                                    | Rejette avec `Storage reservation contention limit exceeded`                         |
| `signal` annulé avant l’écriture de l’entrée                                      | Rejette avec la raison de l’annulation                                               |
| `release()` ou fin d’un bloc `await using`                                        | Entrée supprimée ; les appels suivants sont sans effet                               |
| Le propriétaire s’arrête sans libérer                                             | L’entrée reste et continue de compter ; elle n’expire jamais                         |

:::caution
Outpost ne fournit aucun appel pour effacer une réservation abandonnée. Après avoir vérifié que son propriétaire s’est arrêté, retirez son id de `reservations/ledger` par une écriture conditionnelle via le même transport.
:::

## Points d’entrée

Guide : [Rétention et nettoyage](../../../guide/retention/) · [Où vivent les données](../../../guide/storage/)

- [reserveRecoveryStorage](../../reserverecoverystorage/)
- [assertRecoveryQuota](../../assertrecoveryquota/)
- [RecoveryStorageReservationOptions](../../recoverystoragereservationoptions/)
- [StorageReservationOptions](../../storagereservationoptions/)
- [StorageReservation](../../storagereservation/)
- [WorkspaceOptions](../../workspaceoptions/)
