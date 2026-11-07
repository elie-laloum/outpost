---
title: "Utiliser Docker ou Podman"
description: "Configurez les conteneurs locaux, les montages du dépôt et l’utilisateur qui exécute les commandes."
---

## Prérequis

<!-- features -->

- **Docker ou Podman** : Installé et démarré. Sur macOS, démarrez une machine Podman avec `podman machine start`.
- [Une image d’agent](../agent-images/) : Contient les outils des agents que vous comptez utiliser.
- [Des fichiers de travail](../working-with-files/) : Cette procédure monte un checkout Git ; les sources répertoire et éphémères fonctionnent aussi sans Git.

Avant de lancer une tâche, vérifiez que le moteur de conteneurs répond et que l’image des agents est disponible :

```sh
npx outpost doctor --provider docker --image outpost-codex:dev
```

## Configurer

Les deux fournisseurs acceptent les mêmes options. Passez le fournisseur à `dispatch()`, `createSandbox()` ou à n’importe quelle tâche de workflow.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost-codex:dev",
  cpus: 2,
  memoryMb: 4096,
});
```

```ts
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";

export const sandboxProvider = createPodmanSandboxProvider({
  image: "outpost-codex:dev",
  cpus: 2,
  memoryMb: 4096,
});
```

Chaque allocation démarre un nouveau conteneur à partir de l’image. Fermer la sandbox le supprime.

Référence API : [ContainerOptions](../../reference/containeroptions/), [Volume](../../reference/volume/) et [DependencyCache](../../reference/dependencycache/).

## Accès au dépôt

Le conteneur monte le checkout de la tâche sur `/workspace` et les métadonnées Git du dépôt sous `/outpost/git`. Les modifications et commits de l’agent arrivent directement sur l’hôte, dans le worktree préparé par Outpost.

<!-- features -->

- **Répertoire personnel privé** : `/home/agent` est un tmpfs en mode `0700`, appartenant à l’utilisateur configuré et supprimé avec le conteneur. Le harness y copie les [identifiants](../authentication/) de l’agent.
- **Privilèges réduits** : Les capacités Linux sont retirées (`CHOWN` reste pour attribuer le répertoire personnel Podman, ou quand les caches, les montages de fichiers ou le Git privé en ont besoin) et `no-new-privileges` est activé.
- **Aucun accès au moteur** : Le socket Docker ou Podman n’est jamais monté.

Pour exposer d’autres chemins hôte, ajoutez des `volumes`. Une `source` relative part du dépôt ; une `target` qui commence par `~/` arrive dans le répertoire personnel de l’agent, toute autre `target` relative sous `/workspace`.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost-codex:dev",
  volumes: [{ source: "~/datasets", target: "/data", readOnly: true }],
});
```

Chaque montage, périphérique ou réseau ajouté élargit ce que l’agent peut atteindre. Pour garder les métadonnées Git de l’hôte hors du conteneur, utilisez le [Git privé](../private-git/).

## Podman

Podman rootless associe votre utilisateur hôte au conteneur avec `--userns keep-id` : les fichiers écrits par l’agent restent à vous. Définissez `userns: false` pour laisser la correspondance à votre configuration Podman. Quand Podman tourne en root, définissez `userns: "keep-id"` pour la demander.

Sur un hôte SELinux, gardez `label: "z"` si plusieurs conteneurs partagent les montages. Choisissez `"Z"` pour un montage privé à un seul conteneur, ou `false` si la politique de l’hôte gère déjà les labels. Ces réglages changent les labels du montage, pas les permissions du projet.

Référence API : [ContainerOptions](../../reference/containeroptions/).

`outpost image eject --engine podman` écrit un `Containerfile` au lieu d’un `Dockerfile`.

## Retrouver les sandboxes par label

Définissez `labels` pour étiqueter chaque sandbox créée par un fournisseur. La commande `create` qui crée le conteneur les pose, de même que celle qui crée son [compagnon egress](../network-restrictions/) : un conteneur n’existe donc jamais sans ses labels.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost-codex:dev",
  repositoryMode: "isolated",
  labels: { "com.example.app": "reviews", "com.example.job": "job-42" },
});
```

Un processus de nettoyage peut ensuite retrouver les sandboxes de votre application, y compris celles dont il n’a jamais enregistré le nom. `listDockerSandboxes()` renvoie chaque sandbox Outpost qui porte tous les labels donnés, avec son nom et ses labels. `removeDockerSandbox()` supprime une sandbox avec son compagnon egress et réussit quand ils ont déjà disparu. Podman dispose de `listPodmanSandboxes()` et `removePodmanSandbox()`.

```ts title="reap.ts"
import {
  listDockerSandboxes,
  removeDockerSandbox,
} from "@elie-laloum/outpost/providers/docker";

declare function isJobActive(job: string): Promise<boolean>;

const sandboxes = await listDockerSandboxes({
  labels: { "com.example.app": "reviews" },
});
for (const sandbox of sandboxes) {
  const job = sandbox.labels["com.example.job"];
  if (job && (await isJobActive(job))) continue;
  await removeDockerSandbox(sandbox.name, { deadlineMs: 30_000 });
}
```

<!-- features -->

- **Tout mode de dépôt** : Les deux fonctions s’utilisent sans le fournisseur, quel que soit le `repositoryMode` qui a créé les sandboxes.
- **Conteneurs Outpost uniquement** : Seuls les conteneurs nommés `outpost-<uuid>` sont listés ou supprimés, jamais d’autres conteneurs portant les mêmes labels.
- **Votre décision** : La suppression ne vérifie pas si une exécution utilise encore la sandbox. Une sandbox étiquetée est listée dès que ses conteneurs sont créés, avant le retour de `acquire()` : marquez le job actif avant `acquire()` et retirez cette marque seulement après `release()`. Les commandes suivantes d’une sandbox supprimée échouent et sa libération réussit toujours.
- **Préfixe réservé** : Les clés qui commencent par `io.outpost.` appartiennent à Outpost et sont exclues des labels listés. Des labels invalides, y compris des valeurs entourées d’espaces, échouent à la création du fournisseur.

La liste exige au moins un label. Le moteur rapporte aussi les labels de l’image : choisissez des clés que vos images ne définissent pas.

Référence API : [ContainerOptions](../../reference/containeroptions/), [listDockerSandboxes](../../reference/listdockersandboxes/), [removeDockerSandbox](../../reference/removedockersandbox/) et [ContainerSandbox](../../reference/containersandbox/).

## Limites

- Le fournisseur ne bascule jamais vers une exécution sur l’hôte. Si le moteur ou l’image manque, l’allocation échoue ; lancez les [Diagnostics](../diagnostics/).
- L’image doit fournir `sh`, `setsid`, `kill`, `tar` et `cp`. Les images générées les fournissent.
- Si l’image déclare un utilisateur numérique différent de l’UID demandé, l’allocation échoue. Reconstruisez l’image avec votre UID ou définissez `user`.
- `egress` n’accepte que `deny-all`. Une liste de domaines autorisés demande une [sandbox cloud](../cloud-sandboxes/) ou un pare-feu externe.
- Un fichier isolé ne peut être monté que dans le répertoire personnel de l’agent ; montez son dossier pour les autres destinations.
- Le checkout et les métadonnées Git montés sont accessibles en écriture : ce n’est pas une frontière contre un agent hostile ([Sécurité](../security/)).

API : [createDockerSandboxProvider](../../reference/createdockersandboxprovider/) · [createPodmanSandboxProvider](../../reference/createpodmansandboxprovider/) · [listDockerSandboxes](../../reference/listdockersandboxes/) · [listPodmanSandboxes](../../reference/listpodmansandboxes/) · [removeDockerSandbox](../../reference/removedockersandbox/) · [removePodmanSandbox](../../reference/removepodmansandbox/) · [ContainerOptions](../../reference/containeroptions/) · [Volume](../../reference/volume/) · [DependencyCache](../../reference/dependencycache/).
