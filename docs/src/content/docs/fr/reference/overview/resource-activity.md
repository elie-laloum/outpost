---
title: "Activité des ressources — Vue d’ensemble"
description: "Phases et opérations observées d’une sandbox, enregistrées pendant sa vie, et l’inspection qui juge qui les possède encore."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Signification de la phase d’un enregistrement

Outpost écrit un enregistrement par sandbox sous `resources/` avant que le provider ne l’alloue, puis le supprime après une fermeture propre. Un enregistrement encore présent signale une sandbox en cours d’exécution ou mal fermée.

| `phase`                | Signification                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `allocating`           | Le provider acquiert la sandbox ; l’amorçage et les hooks de disponibilité suivent                      |
| `ready`                | La sandbox est prête ; `operations` liste ce qui s’exécute en ce moment                                 |
| `closing`              | La libération est en cours, après `close()` ou un échec de démarrage                                    |
| `cleanup-failed`       | La libération, la fin des opérations ou la fermeture du workspace a échoué ; le workspace est conservé  |
| `allocation-uncertain` | Le démarrage a échoué pendant l’acquisition : le provider détient peut-être une sandbox jamais utilisée |

## Jugement de la possession

`inspectRecovery({ resources: true })` lit les enregistrements du dépôt et compare l’identité du processus qui a écrit chacun d’eux avec le processus courant. Avec `transporter`, elle lit les enregistrements stockés via `activityTransport` et ne déduit jamais la possession d’un PID.

| `ownership.status` | `reason`                                                   | Cas                                                                                            |
| ------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `active`           | `LOCAL_IDENTITY_MATCH`                                     | Même hôte, démarrage et espace de noms PID ; le PID tourne avec son heure de début enregistrée |
| `inactive`         | `PROCESS_EXITED`                                           | Même hôte, démarrage et espace de noms PID ; aucun processus n’a ce PID                        |
| `unknown`          | `PID_REUSED`                                               | Le PID appartient à un processus démarré à un autre moment                                     |
| `unknown`          | `OTHER_HOST`, `OTHER_BOOT`, `OTHER_PID_NAMESPACE`          | L’enregistrement vient d’une autre machine, d’un autre démarrage ou d’un autre conteneur       |
| `unknown`          | `LEGACY_OR_INVALID_IDENTITY`, `LOCAL_IDENTITY_UNAVAILABLE` | L’auteur ou l’inspecteur n’a pas d’identité ; elle n’est lue que sous Linux                    |
| `unknown`          | `PROCESS_INACCESSIBLE`, `PROCESS_IDENTITY_UNAVAILABLE`     | Le PID existe mais ne peut être ni signalé ni lu                                               |
| `unknown`          | `REMOTE_OWNER_UNVERIFIED`                                  | Tout enregistrement lu depuis un transport                                                     |
| `unknown`          | `RESOURCE_RECORD_UNREADABLE`                               | L’enregistrement est invalide ou a changé pendant l’inspection                                 |

:::caution
Un enregistrement `inactive` ou `unknown` ne prouve pas que la sandbox du provider a disparu. L’inspection n’interroge jamais le provider : vérifiez sa console avant de supprimer une sandbox `remote` ou `allocation-uncertain`.
:::

## Points d’entrée

Guide : [Récupérer du travail](../../../guide/recovery/) · [Où vivent les données](../../../guide/storage/)

- [inspectRecovery](../../inspectrecovery/)
- [RecoveryInspectionOptions](../../recoveryinspectionoptions/)
- [RecoveryInspection](../../recoveryinspection/)
- [ResourceInspection](../../resourceinspection/)
- [ResourceInspectionEntry](../../resourceinspectionentry/)
- [ResourceActivityRecord](../../resourceactivityrecord/)
- [ResourcePhase](../../resourcephase/)
- [ResourceOperation](../../resourceoperation/)
- [ResourceOperationResult](../../resourceoperationresult/)
