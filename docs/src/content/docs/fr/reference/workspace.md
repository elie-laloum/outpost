---
title: "Workspace"
description: "Workspace — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Workspace } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                     | Type                                                                                                                                                                                                         | Présence | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dispatch`              | `<T = undefined>(options: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace"> & DispatchOptions<T> & { readonly agent: DispatchAgent; }) => Promise<DispatchResult<T>>` | Requis   | Exécute un dispatch dans une nouvelle sandbox sur ce workspace. En cas de succès, il fusionne une branche integrate, puis ferme la sandbox et laisse le workspace ouvert. Échoue avec le code configuration si une autre sandbox occupe le workspace ou après close().                                                                                                                                                                                                                                                                                                          |
| `sandbox`               | `(options?: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace">) => Promise<Sandbox>`                                                                                   | Requis   | Alloue une sandbox réutilisable sur ce workspace. Les hooks qui lui sont passés remplacent hostReady et sandboxReady du workspace ; la fermer laisse le workspace ouvert et ne fusionne jamais. Une seconde sandbox ouverte échoue avec le code configuration.                                                                                                                                                                                                                                                                                                                  |
| `attach`                | `(options: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace"> & AttachOptions & { readonly agent: Agent; }) => Promise<AttachResult>`                                  | Requis   | Ouvre le terminal interactif d’un agent dans une nouvelle sandbox sur ce workspace. Si le terminal sort avec le statut 0, il fusionne une branche integrate ; la sandbox est fermée et le workspace reste ouvert.                                                                                                                                                                                                                                                                                                                                                               |
| `close`                 | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                                                                                                                                          | Requis   | Libère le verrou et supprime un worktree géré propre ; une branche integrate est supprimée une fois fusionnée, une branche named est conservée. Après un refus du garde-fou de diff, avec preserve: true, un HEAD détaché ou des fichiers modifiés, non suivis ou ignorés, le worktree est conservé et renvoyé dans retainedDirectory. Échoue avec le code configuration tant qu’une sandbox est ouverte ; les appels suivants renvoient le premier résultat.                                                                                                                   |
| `integrate`             | `() => Promise<void>`                                                                                                                                                                                        | Requis   | Fusionne la branche integrate dans la branche de base avec git merge --no-edit dans le checkout hôte ; ne fait rien en modes current et named. Échoue avec le code conflict si le checkout hôte a changé de branche, si une autre intégration détient le verrou de fusion ou si la fusion échoue ; la branche de travail reste. Avec guard, inspecte le diff commité final depuis l’unique ancêtre commun avec l’hôte, revérifie les références et fusionne le commit inspecté. Un refus ou une inspection incomplète lève le code guard et conserve la branche et le worktree. |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                                                                                                                                                                        | Requis   | Ferme le workspace comme close() sans options, pour await using.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `repository`            | `string`                                                                                                                                                                                                     | Requis   | Chemin réel du répertoire racine du checkout hôte.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `directory`             | `string`                                                                                                                                                                                                     | Requis   | Dossier hôte dans lequel l’agent travaille : le worktree sous .outpost/workspaces, ou le checkout lui-même en mode current.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `branch`                | `string`                                                                                                                                                                                                     | Requis   | Nom de la branche de travail. En mode current, la branche extraite, ou HEAD si elle est détachée.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `baseBranch`            | `string`                                                                                                                                                                                                     | Requis   | Branche extraite dans le checkout hôte à l’ouverture du workspace, et cible de integrate(). Vide si HEAD était détaché.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `baseline`              | `string`                                                                                                                                                                                                     | Requis   | Commit extrait dans le workspace à son ouverture. Chaque dispatch liste les commits depuis son propre commit de départ, pas depuis celui-ci.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `gitDirectories`        | `readonly string[]`                                                                                                                                                                                          | Requis   | Chemins hôtes du dossier Git du worktree et du dossier Git commun du dépôt. Les providers de conteneurs les montent, sauf si repositoryMode vaut isolated.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `policy`                | `BranchPolicy`                                                                                                                                                                                               | Requis   | Politique de branche appliquée, { mode: "current" } si aucune n’a été fournie.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

## Signature

```ts
export interface Workspace extends WorkspaceRecord {
  dispatch<T = undefined>(
    options: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    > &
      DispatchOptions<T> & {
        readonly agent: DispatchAgent;
      },
  ): Promise<DispatchResult<T>>;
  sandbox(
    options?: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    >,
  ): Promise<Sandbox>;
  attach(
    options: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    > &
      AttachOptions & {
        readonly agent: Agent;
      },
  ): Promise<AttachResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  integrate(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Contrats associés

- [Agent](../type-agent/)
- [AttachOptions](../attachoptions/)
- [AttachResult](../attachresult/)
- [DispatchAgent](../dispatchagent/)
- [DispatchOptions](../dispatchoptions/)
- [DispatchResult](../dispatchresult/)
- [Disposal](../disposal/)
- [Sandbox](../sandbox/)
- [SandboxOptions](../sandboxoptions/)
- [WorkspaceOptions](../workspaceoptions/)
- [WorkspaceRecord](../workspacerecord/)
