---
title: "SandboxProvider"
description: "SandboxProvider — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxProvider } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                                                              | Présence  | Rôle                                                                                                                                                                                                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `recover`   | `((resourceId: string, options?: TransferOptions) => Promise<void>) \| undefined` | Optionnel | Supprime une ressource enregistrée par registerRecovery après l’arrêt de son coordinateur, dans les limites de signal et deadlineMs. Un nouvel appel doit réussir et ne jamais supprimer de données du dépôt hôte. La spéculation durable l’exige ; Docker et Podman le fournissent en mode mounted. |
| `name`      | `string`                                                                          | Requis    | Identifiant enregistré dans les diagnostics et l’activité des ressources : docker, podman, local, vercel, daytona ou firecracker pour les providers intégrés.                                                                                                                                        |
| `placement` | `"mounted" \| "remote" \| "host"`                                                 | Requis    | Façon dont le dépôt atteint la sandbox : mounted (worktree hôte monté), remote (historique envoyé, changements resynchronisés) ou host (commandes exécutées dans le worktree hôte). Le placement remote refuse le mode de branche current et utilise integrate par défaut.                           |
| `variables` | `Readonly<Record<string, string>> \| undefined`                                   | Optionnel | Variables d’environnement définies pour chaque commande de la sandbox, en valeurs littérales ; elles remplacent les entrées de .outpost/.env. Une clé aussi déclarée par l’agent échoue avec le code configuration.                                                                                  |
| `acquire`   | `(context: SandboxContext) => Promise<SandboxLease>`                              | Requis    | Alloue un environnement pour une sandbox et renvoie son bail. Outpost l’appelle une fois par sandbox et appelle release() à la fermeture de la sandbox ; respectez context.signal.                                                                                                                   |

## Signature

```ts
export interface SandboxProvider {
  readonly recover?: (
    resourceId: string,
    options?: TransferOptions,
  ) => Promise<void>;
  readonly name: string;
  readonly placement: "mounted" | "remote" | "host";
  readonly variables?: Variables;
  acquire(context: SandboxContext): Promise<SandboxLease>;
}
```

## Contrats associés

- [SandboxContext](../sandboxcontext/)
- [SandboxLease](../sandboxlease/)
- [TransferOptions](../transferoptions/)
- [Variables](../variables/)
