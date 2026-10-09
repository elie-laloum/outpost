---
title: "FileDispatchResult"
description: "FileDispatchResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileDispatchResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                   | Type                                                                             | Présence  | Rôle                                                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `logReference`        | `TransportReference \| undefined`                                                | Optionnel | Référence du journal Transport de cette exécution ; les effets de replay de fichiers sont refusés lorsqu’ils ne peuvent pas être reproduits. |
| `observerErrors`      | `readonly unknown[] \| undefined`                                                | Optionnel | Échecs d’observer recueillis séparément sans modifier les résultats d’exécution.                                                             |
| `transcript`          | `string \| undefined`                                                            | Optionnel | Contenu de conversation capturé ou sa référence Transport, indépendant de l’authentification de l’agent.                                     |
| `transcriptReference` | `TransportReference \| undefined`                                                | Optionnel | Contenu de conversation capturé ou sa référence Transport, indépendant de l’authentification de l’agent.                                     |
| `fallback`            | `FallbackRecord \| undefined`                                                    | Optionnel | Tentatives de fallback explicites et leur usage, en conservant chaque conversation capturée.                                                 |
| `workspaceInfo`       | `FileWorkspaceRecord`                                                            | Requis    | Description versionnée du workspace conservant sa propriété, sa génération settled et ses références de récupération.                        |
| `directory`           | `string`                                                                         | Requis    | Répertoire local absolu de matérialisation ou de source ; ce chemin n’est pas une identité portable.                                         |
| `fileOutputs`         | `readonly WorkspacePublication[]`                                                | Requis    | Résultats de publication vérifiés, séparés des commits Git et de l’intégration de branche.                                                   |
| `report`              | `(options?: RunReportOptions) => string`                                         | Requis    | Rapport d’exécution de fichiers version 2 ; les rapports Git legacy conservent la version 1.                                                 |
| `resume`              | `<U = undefined>(options: DispatchOptions<U>) => Promise<FileDispatchResult<U>>` | Requis    | Continue une conversation capturée dans le même workspace de fichiers conservé sans recopier les entrées initiales.                          |
| `fork`                | `<U = undefined>(options: DispatchOptions<U>) => Promise<FileDispatchResult<U>>` | Requis    | Bifurque une conversation capturée lorsque cela est pris en charge, en conservant les fichiers actuels du workspace.                         |
| `text`                | `string`                                                                         | Requis    | Texte de tous les tours de l’exécution, joints par des sauts de ligne, y compris les tours de réparation de réponse.                         |
| `turns`               | `readonly Turn[]`                                                                | Requis    | Tous les tours dans l’ordre, y compris les corrections de réponse et les tours repris par le steering.                                       |
| `usage`               | `Usage`                                                                          | Requis    | Compteurs de tokens additionnés sur tous les tours ; pas un coût.                                                                            |
| `conversation`        | `string \| undefined`                                                            | Optionnel | Identifiant de conversation native du dernier tour, quand l’agent en a fourni un.                                                            |
| `value`               | `T`                                                                              | Requis    | Réponse analysée et validée ; undefined sans option response.                                                                                |
| `completed`           | `boolean`                                                                        | Requis    | Vrai quand le texte du dernier tour contient un marqueur de fin, ou quand une réponse typée a été validée.                                   |
| `completion`          | `string \| undefined`                                                            | Optionnel | Marqueur de fin trouvé dans le texte du dernier tour.                                                                                        |

## Signature

```ts
export interface FileDispatchResult<T> extends Execution<T> {
  readonly logReference?: TransportReference;
  readonly observerErrors?: readonly unknown[];
  readonly transcript?: string;
  readonly transcriptReference?: TransportReference;
  readonly fallback?: FallbackRecord;
  readonly workspaceInfo: FileWorkspaceRecord;
  readonly directory: string;
  readonly fileOutputs: readonly WorkspacePublication[];
  report(options?: RunReportOptions): string;
  resume<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<FileDispatchResult<U>>;
  fork<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<FileDispatchResult<U>>;
}
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
- [Execution](../execution/)
- [FileWorkspaceRecord](../fileworkspacerecord/)
- [WorkspacePublication](../workspacepublication/)
