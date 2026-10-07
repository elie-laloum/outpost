---
title: "ObservationHub"
description: "ObservationHub — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationHub } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                                                                                          | Présence | Rôle                                                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `redacting` | `boolean`                                                                                                     | Requis   | True lorsque ce scope possède des règles de masquage, y compris héritées. La capture l’utilise pour refuser le filtrage binaire non pris en charge uniquement lorsqu’il est activé.                                                     |
| `scope`     | `ObservationScope`                                                                                            | Requis   | Champs de corrélation immuables hérités par les émissions de ce hub.                                                                                                                                                                    |
| `errors`    | `readonly unknown[]`                                                                                          | Requis   | Collection partagée et bornée des erreurs de récepteur, sérialisation, saturation et délai ; conserve les 100 premières indépendamment de l’exécution.                                                                                  |
| `dropped`   | `number`                                                                                                      | Requis   | Compteur partagé des livraisons perdues par les récepteurs, notamment lors de saturation ou de désactivation.                                                                                                                           |
| `verbose`   | `boolean`                                                                                                     | Requis   | Autorise les producteurs à émettre les requêtes et réponses modèle complètes ; la conservation dans le journal se configure séparément.                                                                                                 |
| `redact`    | `<T>(value: T) => T`                                                                                          | Requis   | Copie une valeur structurée et applique les règles de ce scope sans modifier l’original. Utilisée par le stockage de transcripts avant sérialisation.                                                                                   |
| `emit`      | `(source: ObservationSource, event: ObservationEvent) => void`                                                | Requis   | Attribue à un événement un seq, un horodatage, sa source et le scope de ce hub, puis en remet une copie aux sinks hérités et locaux. Sans effet après close() ; les échecs des sinks vont dans errors et ne sont jamais levés.          |
| `child`     | `(scope: ObservationScope, sinks?: readonly ObservationSink[], redact?: readonly RegExp[]) => ObservationHub` | Requis   | Crée un scope enfant héritant des récepteurs et règles de masquage ; les récepteurs et expressions supplémentaires s’appliquent avant tous les récepteurs hérités et locaux. Fermer l’enfant vide ses livraisons sans fermer le parent. |
| `flush`     | `() => Promise<void>`                                                                                         | Requis   | Vide les livraisons présentes à l’appel et les récepteurs enregistrés avec des attentes bornées ; les émissions ultérieures appartiennent à un appel suivant.                                                                           |
| `close`     | `() => Promise<void>`                                                                                         | Requis   | Arrête les émissions de cet enfant et de ses descendants, vide ses livraisons et détache ses récepteurs sans fermer ceux du parent appartenant à l’appelant.                                                                            |

## Signature

```ts
export interface ObservationHub {
  readonly redacting: boolean;
  readonly scope: ObservationScope;
  readonly errors: readonly unknown[];
  readonly dropped: number;
  readonly verbose: boolean;
  redact<T>(value: T): T;
  emit(source: ObservationSource, event: ObservationEvent): void;
  child(
    scope: ObservationScope,
    sinks?: readonly ObservationSink[],
    redact?: readonly RegExp[],
  ): ObservationHub;
  flush(): Promise<void>;
  close(): Promise<void>;
}
```

## Contrats associés

- [ObservationEvent](../observationevent/)
- [ObservationScope](../observationscope/)
- [ObservationSink](../observationsink/)
- [ObservationSource](../observationsource/)
