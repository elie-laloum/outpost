---
title: "FileWorkspaceRecord"
description: "FileWorkspaceRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkspaceRecord } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                    | Type                                                                                                                                                    | Présence  | Rôle                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`               | `1`                                                                                                                                                     | Requis    | Version de l’enveloppe persistée ; les versions inconnues sont refusées.                                                                                                                                                                 |
| `id`                   | `string`                                                                                                                                                | Requis    | Identifiant stable de cette ressource, indépendant du chemin de matérialisation.                                                                                                                                                         |
| `kind`                 | `"ephemeral" \| "directory"`                                                                                                                            | Requis    | Discriminant sélectionnant Git, une source dossier ou un workspace initialement vide.                                                                                                                                                    |
| `source`               | `FileWorkspaceSource`                                                                                                                                   | Requis    | Source déclarée pour une ressource possédée ; exclusive de l’emprunt d’un workspace ouvert.                                                                                                                                              |
| `ownership`            | `"owned"`                                                                                                                                               | Requis    | Les matérialisations possédées peuvent être nettoyées ; les sources montées empruntées ne sont jamais supprimées.                                                                                                                        |
| `owner`                | `{ readonly nonce: string; readonly state: "open" \| "released" \| "recovering"; }`                                                                     | Requis    | Nonce du propriétaire et état de lifecycle utilisés pour protéger reprise et récupération explicite.                                                                                                                                     |
| `locks`                | `{ readonly materialization: string; readonly source?: string; }`                                                                                       | Requis    | Identifiants exacts des verrous hôte de matérialisation et de source montée ; la récupération libère uniquement ces verrous.                                                                                                             |
| `materialization`      | `{ readonly device: number; readonly inode: number; }`                                                                                                  | Requis    | Identité device/inode utilisée pour détecter les remplacements et les aliases connus du filesystem.                                                                                                                                      |
| `directory`            | `string`                                                                                                                                                | Requis    | Répertoire local absolu de matérialisation ou de source ; ce chemin n’est pas une identité portable.                                                                                                                                     |
| `runtime`              | `WorkspaceRuntime`                                                                                                                                      | Requis    | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                                                                                                                                                          |
| `inputFingerprint`     | `string`                                                                                                                                                | Requis    | Empreinte canonique des entrées initiales et de leur sélection déclarée, indépendante du travail ultérieur.                                                                                                                              |
| `preparation`          | `"failed" \| "preparing" \| "ready" \| undefined`                                                                                                       | Optionnel | État de préparation enregistré avant les copies et hooks. Une préparation interrompue ou échouée conserve ses fichiers et exige leur adoption explicite lors de la récupération ; un champ absent désigne un ancien enregistrement prêt. |
| `inputs`               | `readonly WorkspaceFileEntry[] \| undefined`                                                                                                            | Optionnel | Manifest initial vérifié conservé pour identifier les entrées et protéger la publication vers la source copiée.                                                                                                                          |
| `publicationBaselines` | `readonly { readonly options: WorkspaceOutputOptions; readonly expected: readonly WorkspaceFileEntry[]; }[] \| undefined`                               | Optionnel | Destinations déclarées et manifests attendus avant exécution, conservés entre les reprises.                                                                                                                                              |
| `publications`         | `readonly { readonly id: string; readonly state: "applying" \| WorkspacePublication["state"]; readonly reference: TransportReference; }[] \| undefined` | Optionnel | États des publications et références de journaux Transport, conservés indépendamment du statut des tâches.                                                                                                                               |
| `mountedFingerprint`   | `string \| undefined`                                                                                                                                   | Optionnel | Empreinte de la source montée exposée ; une source modifiée ou indisponible fait refuser la reprise.                                                                                                                                     |
| `generation`           | `number`                                                                                                                                                | Requis    | Numéro croissant enregistré seulement après vérification d’une génération de fichiers settled.                                                                                                                                           |
| `fingerprint`          | `string`                                                                                                                                                | Requis    | Digest canonique de la dernière génération de fichiers settled vérifiée.                                                                                                                                                                 |
| `snapshot`             | `TransportReference \| undefined`                                                                                                                       | Optionnel | Référence Transport d’un snapshot de fichiers vérifié ; sa restauration n’atteste pas la fermeture d’une sandbox.                                                                                                                        |
| `conversations`        | `readonly WorkspaceConversationArchive[] \| undefined`                                                                                                  | Optionnel | Références de conversations natives archivées, relocalisées avec le workspace possédé restauré.                                                                                                                                          |
| `allocation`           | `WorkspaceAllocationRecord \| undefined`                                                                                                                | Optionnel | État d’allocation de sandbox, incluant les allocations incertaines exigeant une preuve explicite de fermeture.                                                                                                                           |

## Signature

```ts
export interface FileWorkspaceRecord {
  readonly format: 1;
  readonly id: string;
  readonly kind: "directory" | "ephemeral";
  readonly source: FileWorkspaceSource;
  readonly ownership: "owned";
  readonly owner: {
    readonly nonce: string;
    readonly state: "open" | "released" | "recovering";
  };
  readonly locks: {
    readonly materialization: string;
    readonly source?: string;
  };
  readonly materialization: {
    readonly device: number;
    readonly inode: number;
  };
  readonly directory: string;
  readonly runtime: WorkspaceRuntime;
  readonly inputFingerprint: string;
  readonly preparation?: "preparing" | "failed" | "ready";
  readonly inputs?: readonly WorkspaceFileEntry[];
  readonly publicationBaselines?: readonly {
    readonly options: WorkspaceOutputOptions;
    readonly expected: readonly WorkspaceFileEntry[];
  }[];
  readonly publications?: readonly {
    readonly id: string;
    readonly state: "applying" | WorkspacePublication["state"];
    readonly reference: TransportReference;
  }[];
  readonly mountedFingerprint?: string;
  readonly generation: number;
  readonly fingerprint: string;
  readonly snapshot?: TransportReference;
  readonly conversations?: readonly WorkspaceConversationArchive[];
  readonly allocation?: WorkspaceAllocationRecord;
}
```

## Contrats associés

- [FileWorkspaceSource](../fileworkspacesource/)
- [TransportReference](../transportreference/)
- [WorkspaceAllocationRecord](../workspaceallocationrecord/)
- [WorkspaceConversationArchive](../workspaceconversationarchive/)
- [WorkspaceFileEntry](../workspacefileentry/)
- [WorkspaceOutputOptions](../workspaceoutputoptions/)
- [WorkspacePublication](../workspacepublication/)
- [WorkspaceRuntime](../workspaceruntime/)
