---
title: "Ajouter un provider de sandbox"
description: "Exécuter des agents dans un environnement qu’Outpost ne prend pas encore en charge : l’allouer, y lancer des commandes, transférer des fichiers et le libérer. Outpost continue de gérer Git, les agents et les conversations."
---

## Écrire un provider minimal

Un `SandboxProvider` alloue un environnement par sandbox et renvoie un `SandboxLease` qui y exécute des commandes et y transfère des fichiers. Ce squelette enveloppe une plateforme de machines virtuelles ; `vms` représente son SDK.

```ts title="vm-provider.mts"
import { randomUUID } from "node:crypto";
import {
  createRemoteSandboxProvider,
  type TransferOptions,
} from "@elie-laloum/outpost";

// Le SDK de votre plateforme.
interface Vm {
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
declare const vms: {
  create(name: string, signal?: AbortSignal): Promise<Vm>;
  remove(name: string, signal?: AbortSignal): Promise<void>;
};

const bounded = ({ signal, deadlineMs }: TransferOptions) =>
  AbortSignal.any([
    ...(signal ? [signal] : []),
    ...(deadlineMs ? [AbortSignal.timeout(deadlineMs)] : []),
  ]);

export const vmSandboxProvider = createRemoteSandboxProvider({
  name: "vm",
  async acquire(context) {
    const name = `outpost-${randomUUID()}`;
    const vm = await vms.create(name, context.signal);
    let released: Promise<void> | undefined;
    return {
      root: "/workspace",
      home: "/home/agent",
      async invoke(command) {
        const result = await vm.run(
          [command.executable, ...(command.arguments ?? [])],
          {
            cwd: command.directory ?? "/workspace",
            env: { ...context.variables, ...command.variables },
            stdin: command.stdin,
            signal: bounded(command),
            onOutput: command.observe,
          },
        );
        return {
          status: result.exitCode,
          stdout: result.stdout,
          stderr: result.stderr,
        };
      },
      upload: (source, destination, options = {}) =>
        vm.put(source, destination, bounded(options)),
      download: (source, destination, options = {}) =>
        vm.get(source, destination, bounded(options)),
      release: () => (released ??= vms.remove(name)),
    };
  },
});
```

Passez `vmSandboxProvider` comme `sandboxProvider` à `dispatch()` ou `createSandbox()`. Outpost appelle `acquire()` une fois par sandbox, fait passer l’agent et vos commandes par `invoke()`, puis appelle `release()`.

## Remplir le contrat

| Membre                  | Ce qu’Outpost attend                                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                  | Un identifiant pour les diagnostics et l’activité des ressources.                                                                                  |
| `placement`             | Comment la sandbox voit le checkout : `"mounted"`, `"remote"` ou `"host"`. Fixé par les helpers ci-dessous.                                        |
| `variables`             | Des déclarations qu’Outpost résout dans `context.variables` ([Variables d’environnement](../environment-variables/)).                              |
| `acquire(context)`      | Allouer l’environnement, respecter `context.signal`, appliquer `context.variables` à chaque commande et renvoyer le bail.                          |
| `lease.root`            | Le chemin du checkout dans la sandbox. Les commandes s’y exécutent par défaut.                                                                     |
| `lease.home`            | Le home privé de l’agent, où Outpost installe les identifiants et les réglages de la CLI.                                                          |
| `lease.invoke(command)` | Lancer `executable` avec `arguments`, `stdin`, `directory` et `variables` ; diffuser la sortie vers `observe` ; renvoyer le vrai statut de sortie. |
| `lease.upload()`        | Copier un fichier ou un dossier de l’hôte dans la sandbox.                                                                                         |
| `lease.download()`      | Copier un fichier ou un dossier de la sandbox vers l’hôte.                                                                                         |
| `lease.release()`       | Détruire l’environnement.                                                                                                                          |

`invoke()` reçoit aussi `retain` (octets de fin de sortie à conserver), `interactive` et les flux `terminal` pour [`attach()`](../sandbox-sessions/), ainsi que `input` quand le bail déclare `liveInput`.

## Choisir monté ou distant

Les deux helpers prennent `name`, des `variables` facultatives et `acquire`, vérifient le nom et figent le résultat. Ils diffèrent par le `placement` qu’ils fixent, qui décide qui déplace le dépôt.

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
Un provider de conteneurs doit transférer via un processus à l’intérieur du conteneur, par exemple un `tar` en flux. `docker cp` ne voit ni les tmpfs ni les autres montages actifs.
:::

## Déclarer les capacités facultatives

Outpost n’utilise une capacité que si le provider ou le bail la déclare ; il ne la déduit jamais du nom du provider.

| Membre                                                  | Active                                                                                                                                                                     | Détails                                                                                                                  |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `lease.fileTransfers` (`manifest()`, `downloadBatch()`) | La synchronisation distante ne télécharge que les fichiers modifiés, par lots, et vérifie leur SHA-256.                                                                    | [FileTransfers](../../reference/filetransfers/)                                                                          |
| `lease.fileTransfers.uploadBatch()`                     | Les fichiers envoyés à une sandbox distante partent en un seul lot au lieu d’un `upload()` chacun.                                                                         | [Sandboxes cloud](../cloud-sandboxes/)                                                                                   |
| `lease.liveInput: true`                                 | `invoke()` transmet `command.input` au processus en cours : la réorientation atteint les agents dotés d’un protocole `liveInput` et les serveurs MCP du harness démarrent. | [Réorienter un agent en cours](../steering/), [Ajouter un agent CLI](../custom-agents/), [Serveurs MCP](../mcp-servers/) |
| `provider.recover()`                                    | Les courses durables de `speculate()` peuvent nettoyer après un crash.                                                                                                     | [Candidats concurrents](../speculation/)                                                                                 |

Sans `liveInput`, réorienter un agent CLI qui sait reprendre sa conversation arrête son processus dès que la conversation est connue, puis la reprend dans la même sandbox.

## Survivre au crash d’une course durable

Une course durable enregistre chaque sandbox avant sa création, pour qu’un coordinateur relancé puisse la supprimer. Dans `acquire()`, attendez `context.registerRecovery(resourceId)` une seule fois, avant d’allouer. `recover(resourceId, { signal, deadlineMs })` supprime ensuite cette ressource.

```ts
import { randomUUID } from "node:crypto";
import {
  createRemoteSandboxProvider,
  type SandboxLease,
  type SandboxProvider,
} from "@elie-laloum/outpost";

// Démarre la VM et construit son bail, comme plus haut.
declare function startVm(
  name: string,
  signal?: AbortSignal,
): Promise<SandboxLease>;
// Se résout aussi quand la VM n’existe plus.
declare function removeVm(name: string, signal?: AbortSignal): Promise<void>;

const provider = createRemoteSandboxProvider({
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

`diagnoseSandbox()` sonde un bail : Node.js, Git, des flux de sortie séparés, un statut de sortie non nul, le home et, avec `transfers`, un envoi binaire vérifié par un processus dans la sandbox.

```ts
import { join } from "node:path";
import { diagnoseSandbox, type SandboxProvider } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.mts";

declare const vmSandboxProvider: SandboxProvider;

const lease = await vmSandboxProvider.acquire({
  repository,
  directory: repository,
  gitDirectories: [join(repository, ".git")],
  variables: {},
});
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

- **Pas de `recover` dans les helpers**: `createMountedSandboxProvider()` et `createRemoteSandboxProvider()` acceptent `name`, `variables` et `acquire` ; ajoutez `recover` en étalant le résultat, comme ci-dessus.
- **Le distant exige Git**: Une sandbox distante a besoin de `git` dans son `PATH` et d’un `root` accessible en écriture.
- **Sonde de transfert partielle**: `transfers: true` vérifie un seul fichier binaire. Liens symboliques, modes, dossiers et transferts par lots restent non vérifiés.

API : [SandboxProvider](../../reference/sandboxprovider/) · [SandboxLease](../../reference/sandboxlease/) · [SandboxContext](../../reference/sandboxcontext/) · [FileTransfers](../../reference/filetransfers/) · [createMountedSandboxProvider](../../reference/createmountedsandboxprovider/) · [createRemoteSandboxProvider](../../reference/createremotesandboxprovider/) · [diagnoseSandbox](../../reference/diagnosesandbox/).
