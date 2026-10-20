---
title: "ObservationClient"
description: "ObservationClient — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationClient } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                     | Type                                                                                                          | Présence | Rôle                                                                                                                                                                                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flush`                 | `() => Promise<void>`                                                                                         | Requis   | Vide les livraisons en mémoire et celles des suivis actifs sans les fermer. La livraison reste bornée ; erreurs et pertes restent consultables.                                                                                                                                                                     |
| `close`                 | `() => Promise<void>`                                                                                         | Requis   | Refuse les nouveaux suivis, attend les suivis actifs de ce client et de ses enfants, puis vide et ferme les livraisons en mémoire. Idempotent. N’annule aucune exécution et ne ferme pas les sorties, le transport ou les SDK empruntés. Les lecteurs restent utilisables.                                          |
| `readRun`               | `(id: string, options?: ObservationReadOptions) => Promise<RunSnapshot \| undefined>`                         | Requis   | Lit l’état pour id avec signal et maxBytes optionnels ; renvoie undefined si absent. Demande le transport configuré. Les états actifs expirés sont signalés abandonnés sans modifier le stockage.                                                                                                                   |
| `watchRun`              | `(id: string, options?: ObservationWatchOptions) => AsyncIterable<RunEvent>`                                  | Requis   | Suit les événements persistés pour id après options.from (0 par défaut), par lecture périodique jusqu’à stabilisation ou expiration. Accepte signal, pollMs et maxBytes. L’annulation arrête seulement la lecture. L’enregistrement doit exister ; événements absents et curseurs invalides échouent explicitement. |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                                                                         | Requis   | Attend close() : refuse les nouvelles exécutions, attend les suivis actifs et vide les livraisons. N’annule pas les exécutions et ne ferme pas les sorties ou le transport empruntés.                                                                                                                               |
| `redacting`             | `boolean`                                                                                                     | Requis   | True lorsque ce scope possède des règles de masquage, y compris héritées. La capture l’utilise pour refuser le filtrage binaire non pris en charge uniquement lorsqu’il est activé.                                                                                                                                 |
| `scope`                 | `ObservationScope`                                                                                            | Requis   | Champs de corrélation immuables hérités par les émissions de ce hub.                                                                                                                                                                                                                                                |
| `errors`                | `readonly unknown[]`                                                                                          | Requis   | Collection partagée et bornée des erreurs de récepteur, sérialisation, saturation et délai ; conserve les 100 premières indépendamment de l’exécution.                                                                                                                                                              |
| `dropped`               | `number`                                                                                                      | Requis   | Compteur partagé des livraisons perdues par les récepteurs, notamment lors de saturation ou de désactivation.                                                                                                                                                                                                       |
| `verbose`               | `boolean`                                                                                                     | Requis   | Autorise les producteurs à émettre les requêtes et réponses modèle complètes ; la conservation dans le journal se configure séparément.                                                                                                                                                                             |
| `redact`                | `<T>(value: T) => T`                                                                                          | Requis   | Copie une valeur structurée et applique les règles de ce scope sans modifier l’original. Utilisée par le stockage de transcripts avant sérialisation.                                                                                                                                                               |
| `emit`                  | `(source: ObservationSource, event: ObservationEvent) => void`                                                | Requis   | Attribue à un événement un seq, un horodatage, sa source et le scope de ce hub, puis en remet une copie aux sinks hérités et locaux. Sans effet après close() ; les échecs des sinks vont dans errors et ne sont jamais levés.                                                                                      |
| `child`                 | `(scope: ObservationScope, sinks?: readonly ObservationSink[], redact?: readonly RegExp[]) => ObservationHub` | Requis   | Crée un scope enfant héritant des récepteurs et règles de masquage ; les récepteurs et expressions supplémentaires s’appliquent avant tous les récepteurs hérités et locaux. Fermer l’enfant vide ses livraisons sans fermer le parent.                                                                             |

## Signature

```ts
export interface ObservationClient extends ObservationHub {
  flush(): Promise<void>;
  close(): Promise<void>;
  readRun(
    id: string,
    options?: ObservationReadOptions,
  ): Promise<RunSnapshot | undefined>;
  watchRun(
    id: string,
    options?: ObservationWatchOptions,
  ): AsyncIterable<RunEvent>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Contrats associés

- [ObservationHub](../observationhub/)
- [ObservationReadOptions](../observationreadoptions/)
- [ObservationWatchOptions](../observationwatchoptions/)
- [RunEvent](../runevent/)
- [RunSnapshot](../runsnapshot/)
