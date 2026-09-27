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

| Nom       | Type                                                                              | Présence | Rôle                                                                                                                                                          |
| --------- | --------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scope`   | `ObservationScope`                                                                | Requis   | Champs de corrélation immuables hérités par les émissions de ce hub.                                                                                          |
| `errors`  | `readonly unknown[]`                                                              | Requis   | Collection partagée et bornée des erreurs de récepteur, sérialisation, saturation et délai ; conserve les 100 premières indépendamment de l’exécution.        |
| `dropped` | `number`                                                                          | Requis   | Compteur partagé des livraisons perdues par les récepteurs, notamment lors de saturation ou de désactivation.                                                 |
| `verbose` | `boolean`                                                                         | Requis   | Autorise les producteurs à émettre les requêtes et réponses modèle complètes ; la conservation dans le journal se configure séparément.                       |
| `emit`    | `(source: ObservationSource, event: ObservationEvent) => void`                    | Requis   | Horodate et livre un événement typé aux récepteurs hérités et locaux ; les erreurs sont collectées sans être levées.                                          |
| `child`   | `(scope: ObservationScope, sinks?: readonly ObservationSink[]) => ObservationHub` | Requis   | Crée un enfant contextualisé partageant séquence et diagnostics de livraison, avec des récepteurs supplémentaires limités à cet enfant et ses descendants.    |
| `flush`   | `() => Promise<void>`                                                             | Requis   | Vide les livraisons présentes à l’appel et les récepteurs enregistrés avec des attentes bornées ; les émissions ultérieures appartiennent à un appel suivant. |
| `close`   | `() => Promise<void>`                                                             | Requis   | Arrête les émissions de cet enfant et de ses descendants, vide ses livraisons et détache ses récepteurs sans fermer ceux du parent appartenant à l’appelant.  |

## Signature

```ts
export interface ObservationHub {
  readonly scope: ObservationScope;
  readonly errors: readonly unknown[];
  readonly dropped: number;
  readonly verbose: boolean;
  emit(source: ObservationSource, event: ObservationEvent): void;
  child(
    scope: ObservationScope,
    sinks?: readonly ObservationSink[],
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
