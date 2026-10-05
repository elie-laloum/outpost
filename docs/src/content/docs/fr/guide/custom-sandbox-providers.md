---
title: "Ajouter un fournisseur de sandbox"
description: "Connectez un environnement capable d’exécuter des commandes, de transférer des fichiers et de libérer ses ressources."
---

## Écrire un fournisseur minimal

Implémentez un `SandboxProvider` pour ouvrir un environnement d’exécution. Il renvoie un `SandboxLease` qu’Outpost utilise pour lancer les commandes et transférer les fichiers. L’exemple ci-dessous présente une intégration de machines virtuelles ; `vms` représente le SDK de la plateforme.

Adaptez ces contrats du SDK et ces fonctions d’exécution à votre plateforme de VM.

<!-- tabs -->

```ts title="vm.types.ts"
export interface Vm {
  run(
    argv: readonly string[],
    options: {
      cwd: string;
      env: Record<string, string>;
      stdin?: string | undefined;
      signal: AbortSignal;
      onOutput?:
        ((channel: "stdout" | "stderr", text: string) => void) | undefined;
    },
  ): Promise<{ exitCode: number; stdout: string; stderr: string }>;
  put(local: string, remote: string, signal: AbortSignal): Promise<void>;
  get(remote: string, local: string, signal: AbortSignal): Promise<void>;
}
```

```ts title="vm-sdk.types.ts"
import type { Vm } from "./vm.types.ts";

export declare const vms: {
  create(name: string, signal?: AbortSignal): Promise<Vm>;
  remove(name: string, signal?: AbortSignal): Promise<void>;
};
```

```ts title="deadline.ts"
import type { TransferOptions } from "@elie-laloum/outpost";

export const bounded = ({ signal, deadlineMs }: TransferOptions) =>
  AbortSignal.any([
    ...(signal ? [signal] : []),
    ...(deadlineMs ? [AbortSignal.timeout(deadlineMs)] : []),
  ]);
```

```ts title="command-options.ts"
import type { SandboxContext, Command } from "@elie-laloum/outpost";
import { bounded } from "./deadline.ts";

export function commandOptions(context: SandboxContext, command: Command) {
  return {
    cwd: command.directory ?? "/workspace",
    env: { ...context.variables, ...command.variables },
    stdin: command.stdin,
    signal: bounded(command),
    onOutput: command.observe,
  };
}
```

```ts title="invoke-vm.ts"
import type { Vm } from "./vm.types.ts";
import type { SandboxContext, SandboxLease } from "@elie-laloum/outpost";
import { commandOptions } from "./command-options.ts";

export function invokeVm(
  vm: Vm,
  context: SandboxContext,
): SandboxLease["invoke"] {
  return async (command) => {
    const result = await vm.run(
      [command.executable, ...(command.arguments ?? [])],
      commandOptions(context, command),
    );
    return {
      status: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  };
}
```

Ajoutez les transferts et une libération idempotente, puis assemblez le fournisseur dans `vm-provider.ts`.

<!-- tabs -->

```ts title="transfer-vm.ts"
import type { Vm } from "./vm.types.ts";
import type { SandboxLease } from "@elie-laloum/outpost";
import { bounded } from "./deadline.ts";

export function transferVm(vm: Vm): Pick<SandboxLease, "upload" | "download"> {
  return {
    upload: (source, destination, options = {}) =>
      vm.put(source, destination, bounded(options)),
    download: (source, destination, options = {}) =>
      vm.get(source, destination, bounded(options)),
  };
}
```

```ts title="vm-lease.ts"
import type { Vm } from "./vm.types.ts";
import type { SandboxLease } from "@elie-laloum/outpost";
import { transferVm } from "./transfer-vm.ts";

export function createVmLease(
  vm: Vm,
  invoke: SandboxLease["invoke"],
  remove: () => Promise<void>,
): SandboxLease {
  let released: Promise<void> | undefined;
  return {
    root: "/workspace",
    home: "/home/agent",
    invoke,
    ...transferVm(vm),
    release: () => (released ??= remove()),
  };
}
```

```ts title="vm-provider.ts"
import { createRemoteSandboxProvider } from "@elie-laloum/outpost";
import { randomUUID } from "node:crypto";
import { vms } from "./vm-sdk.types.ts";
import { createVmLease } from "./vm-lease.ts";
import { invokeVm } from "./invoke-vm.ts";

export const vmSandboxProvider = createRemoteSandboxProvider({
  name: "vm",
  async acquire(context) {
    const name = `outpost-${randomUUID()}`;
    const vm = await vms.create(name, context.signal);
    return createVmLease(vm, invokeVm(vm, context), () => vms.remove(name));
  },
});
```

Passez `vmSandboxProvider` comme `sandboxProvider` à `dispatch()` ou `createSandbox()`. Outpost appelle `acquire()` une fois par sandbox, fait passer l’agent et vos commandes par `invoke()`, puis appelle `release()`.

## Implémenter les opérations

Référence API : [SandboxLease](../../reference/sandboxlease/), [SandboxContext](../../reference/sandboxcontext/) et [FileTransfers](../../reference/filetransfers/).

`invoke()` reçoit aussi `retain` (octets de fin de sortie à conserver), `interactive` et les flux `terminal` pour [`attach()`](../sandbox-sessions/), ainsi que `input` quand le bail déclare `liveInput`.

## Choisir le mode d’accès au dépôt

Les deux fonctions utilitaires prennent `name`, des `variables` facultatives et `acquire`, vérifient le nom et figent le résultat. Ils diffèrent par le `placement` qu’ils fixent, qui décide qui déplace le dépôt.

|                   | `createMountedSandboxProvider()`                                                           | `createRemoteSandboxProvider()`                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Votre `acquire()` | Monte `context.directory` sur `root` et `context.gitDirectories` pour que `git` fonctionne | Démarre un environnement vide                                                                               |
| Dépôt             | L’agent modifie directement le worktree de l’hôte                                          | Outpost lance `git init` dans `root`, envoie l’historique, puis télécharge et applique les nouveaux commits |
| CLI de l’agent    | Fournie par votre image                                                                    | Installée dans `home` si elle manque, sauf avec `bootstrap: false`                                          |
| Branche           | Tout [mode de branche](../repository-and-branch/)                                          | `named` ou `integrate`, `integrate` par défaut                                                              |
| Exemples intégrés | Docker et Podman ([Docker et Podman](../containers/))                                      | Vercel, Daytona, Firecracker ([Sandboxes cloud](../cloud-sandboxes/))                                       |

## Respecter les obligations

La supervision, les reprises et la récupération d’Outpost reposent sur ces comportements. Un utilisateur voit chacun d’eux quand il est cassé.

<!-- features -->

- **Statut de sortie**: `invoke()` se résout quand le processus se termine, avec son vrai statut, même si stdout et stderr se sont fermés avant.
- **Annulation**: `signal` et `deadlineMs` arrêtent le groupe de processus et ses descendants ; la sandbox reste utilisable.
- **Limites de transfert**: `upload()` et `download()` respectent eux aussi `signal` et `deadlineMs`.
- **Octets exacts**: Les transferts copient les données binaires sans décodage texte et conservent les modes pris en charge et les liens symboliques.
- **Staging sûr**: Rejeter les destinations qui sortent de leur cible ; supprimer le staging temporaire en cas de succès, d’échec et d’annulation.
- **Libération idempotente**: Un second `release()` se résout sans erreur.

:::caution
Un fournisseur de conteneurs doit transférer via un processus à l’intérieur du conteneur, par exemple un `tar` en flux. `docker cp` ne voit ni les tmpfs ni les autres montages actifs.
:::

## Déclarer les capacités facultatives

Outpost n’utilise une capacité que si le fournisseur ou le bail la déclare ; il ne la déduit jamais du nom du fournisseur.

Référence API : [SandboxLease](../../reference/sandboxlease/).

Sans `liveInput`, réorienter un agent CLI qui sait reprendre sa conversation arrête son processus dès que la conversation est connue, puis la reprend dans la même sandbox.

## Préparer la récupération après un arrêt brutal

Une course durable enregistre chaque sandbox avant sa création, pour qu’un coordinateur relancé puisse la supprimer. Dans `acquire()`, attendez `context.registerRecovery(resourceId)` une seule fois, avant d’allouer. `recover(resourceId, { signal, deadlineMs })` supprime ensuite cette ressource.

<!-- tabs -->

```ts title="vm-lifecycle.types.ts"
import type { SandboxLease } from "@elie-laloum/outpost";

export declare function startVm(
  name: string,
  signal?: AbortSignal,
): Promise<SandboxLease>;
export declare function removeVm(
  name: string,
  signal?: AbortSignal,
): Promise<void>;
```

```ts title="durable-vm.ts"
import { createRemoteSandboxProvider } from "@elie-laloum/outpost";
import { randomUUID } from "node:crypto";
import { startVm, removeVm } from "./vm-lifecycle.types.ts";
import type { SandboxProvider } from "@elie-laloum/outpost";

export const provider = createRemoteSandboxProvider({
  name: "vm",
  async acquire(context) {
    const name = `outpost-${randomUUID()}`;
    await context.registerRecovery?.(name);
    return startVm(name, context.signal);
  },
});
export const durableVmProvider: SandboxProvider = {
  ...provider,
  recover: (resourceId, options) => removeVm(resourceId, options?.signal),
};
```

`registerRecovery` n’existe que pendant une course durable. S’il rejette, n’allouez rien. `recover()` doit réussir s’il est rappelé et ne supprimer que la sandbox, jamais les données du dépôt sur l’hôte.

## Tester sur l’environnement réel

`diagnoseSandbox()` sonde un bail : Node.js, Git, des flux de sortie séparés, un statut de sortie non nul, le répertoire personnel et, avec `transfers`, un envoi binaire vérifié par un processus dans la sandbox.

<!-- tabs -->

```ts title="diagnostic-lease.ts"
import type { SandboxProvider } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";
import { join } from "node:path";

export declare const vmSandboxProvider: SandboxProvider;
export function openDiagnosticLease() {
  return vmSandboxProvider.acquire({
    repository,
    directory: repository,
    gitDirectories: [join(repository, ".git")],
    variables: {},
  });
}
```

```ts title="diagnose.ts"
import { openDiagnosticLease, vmSandboxProvider } from "./diagnostic-lease.ts";
import { diagnoseSandbox } from "@elie-laloum/outpost";

export const lease = await openDiagnosticLease();
try {
  const report = await diagnoseSandbox(lease, {
    transfers: true,
    sandboxProvider: vmSandboxProvider,
  });
  console.log(report.hasFailures, report.checks);
} finally {
  await lease.release();
}
```

Le diagnostic vous laisse le bail : libérez-le vous-même. Lancez ensuite un vrai `dispatch()` sur une branche nommée ; [Diagnostic](../diagnostics/) explique le rapport.

:::caution
Les tests avec des mocks prouvent le protocole, pas l’environnement. Testez les montages, les terminaux et les restrictions réseau sur la vraie plateforme.
:::

## Limites

- **Pas de `recover` dans les fonctions utilitaires**: `createMountedSandboxProvider()` et `createRemoteSandboxProvider()` acceptent `name`, `variables` et `acquire` ; ajoutez `recover` en étalant le résultat, comme ci-dessus.
- **Le distant exige Git**: Une sandbox distante a besoin de `git` dans son `PATH` et d’un `root` accessible en écriture.
- **Sonde de transfert partielle**: `transfers: true` vérifie un seul fichier binaire. Liens symboliques, modes, dossiers et transferts par lots restent non vérifiés.

API : [SandboxProvider](../../reference/sandboxprovider/) · [SandboxLease](../../reference/sandboxlease/) · [SandboxContext](../../reference/sandboxcontext/) · [FileTransfers](../../reference/filetransfers/) · [createMountedSandboxProvider](../../reference/createmountedsandboxprovider/) · [createRemoteSandboxProvider](../../reference/createremotesandboxprovider/) · [diagnoseSandbox](../../reference/diagnosesandbox/).
