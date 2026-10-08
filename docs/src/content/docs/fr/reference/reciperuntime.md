---
title: "RecipeRuntime"
description: "RecipeRuntime — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeRuntime } from "@elie-laloum/outpost/recipes";
```

## Paramètres et propriétés

| Nom                     | Type                                                       | Présence | Rôle                                                                                                                                                                                                                     |
| ----------------------- | ---------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `serve`                 | `(options: RecipeServeOptions) => Promise<void>`           | Requis   | Démarre un service nommé et ses dépendances jusqu’à annulation ou fermeture du runtime ; les autres services déclarés restent non construits.                                                                            |
| `enqueue`               | `(options: RecipeEnqueueOptions) => Promise<QueueJob>`     | Requis   | Publie les paramètres typés vers une file nommée sans démarrer de workflow ni service ; ferme uniquement les ressources de file possédées.                                                                               |
| `run`                   | `(options?: RecipeRunOptions) => Promise<RecipeReport>`    | Requis   | Exécute une invocation à la fois ; ferme ses ressources possédées avant de renvoyer son rapport.                                                                                                                         |
| `resume`                | `(options: RecipeResumeOptions) => Promise<RecipeReport>`  | Requis   | Reprend une exécution durable existante avec ses paramètres, workspaces et compteurs cumulés. Une identité modifiée ou un workspace absent échoue ; les tâches interrompues exigent une autorisation explicite de rejeu. |
| `status`                | `(runId: string) => Promise<RecipeRunStatus \| undefined>` | Requis   | Lit révision, propriété, résumés des tâches et workspaces du checkpoint sans l’acquérir ; les exécutions terminées incluent leur rapport expurgé.                                                                        |
| `close`                 | `() => Promise<void>`                                      | Requis   | Empêche de nouvelles exécutions, annule l’exécution active et attend son nettoyage ; les appels répétés sont sûrs.                                                                                                       |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                      | Requis   | Ferme le runtime à la sortie d’un scope await using.                                                                                                                                                                     |

## Signature

```ts
export interface RecipeRuntime {
  serve(options: RecipeServeOptions): Promise<void>;
  enqueue(options: RecipeEnqueueOptions): Promise<QueueJob>;
  run(options?: RecipeRunOptions): Promise<RecipeReport>;
  resume(options: RecipeResumeOptions): Promise<RecipeReport>;
  status(runId: string): Promise<RecipeRunStatus | undefined>;
  close(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Contrats associés

- [QueueJob](../queuejob/)
- [RecipeEnqueueOptions](../recipeenqueueoptions/)
- [RecipeReport](../support-recipereport/)
- [RecipeResumeOptions](../reciperesumeoptions/)
- [RecipeRunOptions](../reciperunoptions/)
- [RecipeRunStatus](../reciperunstatus/)
- [RecipeServeOptions](../recipeserveoptions/)
