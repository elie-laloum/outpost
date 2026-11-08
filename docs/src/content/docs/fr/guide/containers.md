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

## Monter des outils depuis une autre image

Définissez `imageMounts` pour monter dans la sandbox des fichiers d’une autre image, en lecture seule. Vos utilisateurs peuvent alors fournir leur propre image de sandbox tandis que votre plateforme y ajoute son lanceur, Outpost ou une CLI depuis une image d’outillage qu’elle contrôle. Chaque entrée désigne une `image`, un `path` absolu facultatif dans cette image et une `target` dans la sandbox.

```ts
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";

export const sandboxProvider = createPodmanSandboxProvider({
  image: "registry.example.com/team/sandbox:3",
  repositoryMode: "isolated",
  imageMounts: [
    {
      image: "registry.example.com/platform/run:1.4",
      path: "/opt/platform",
      target: "/opt/platform",
    },
  ],
});
```

Les écritures dans le montage échouent avec `Read-only file system`. Une cible est un chemin absolu, ou un chemin `~/` dans le répertoire personnel de l’agent, hors du workspace, de `/tmp` et de `/outpost` ; une entrée invalide échoue à la création du fournisseur. [ContainerImageMount](../../reference/containerimagemount/) liste toutes les règles.

<!-- features -->

- **Image déjà sur l’hôte du moteur** : Outpost ne télécharge jamais une image montée et ne la vérifie pas au préalable. Quand elle manque, le moteur ne parvient pas à démarrer la sandbox : Podman signale `image not known`, Docker `No such image`.
- **Versions des moteurs** : Docker Engine 28.0 avec le stockage d’images containerd, que Docker exige pour les montages d’image et active par défaut sur les nouvelles installations de Docker 29, ou Podman 2.2. Un `path` demande Podman 5.1 ; Docker le prend en charge dès 28.0.
- **État de la validation** : Le comportement de Podman a été vérifié avec Podman 5.4 rootless sous Linux, y compris le client distant via `CONTAINER_HOST`. La syntaxe Docker suit la documentation Docker et le code source de Moby, mais n’a pas encore été validée par une exécution réelle de Docker.

Vérifiez ces points avant de vous appuyer sur un montage :

<!-- features -->

- **Outillage autonome** : Les fichiers montés s’exécutent avec les bibliothèques de l’image de la sandbox. Fournissez des binaires liés statiquement ou un runtime embarqué à côté du programme : un binaire lié à la glibc ne s’exécute pas dans une image musl comme Alpine, et une CLI qui demande Node.js échoue dans une image de sandbox sans Node.js.
- **Cibles dans le répertoire personnel** : Choisissez un enfant direct du répertoire personnel, comme `~/tools`, ou un chemin en dehors, comme `/opt/tools`. Pour une cible plus profonde comme `~/.local/bin`, le moteur crée les dossiers manquants avec root pour propriétaire, si bien que l’agent ne peut pas écrire à côté du montage, par exemple dans `~/.local/share`. Un volume d’un seul fichier ne peut pas se trouver sous un montage d’image dans le répertoire personnel, car Outpost prépare ses dossiers parents dans l’image en lecture seule.
- **Montages imbriqués** : Un montage bind ou d’image sous la cible d’un montage d’image exige que son point de montage existe déjà dans l’image en lecture seule ; sinon le conteneur ne démarre pas, avec `Read-only file system`.
- **Moteurs distants** : Les montages d’image ne lisent aucun chemin sur la machine qui exécute Outpost : ils conviennent à un moteur joint via `CONTAINER_HOST` ou `podman --remote`. `volumes`, le `repositoryMode: "mounted"` par défaut et les workspaces de fichiers liés en `mount-readonly` ou `mount-write` lisent toujours le disque de l’appelant ; avec un moteur distant, utilisez `repositoryMode: "isolated"` ([Git privé](../private-git/)) et aucun `volumes`.

Référence API : [ContainerOptions](../../reference/containeroptions/) et [ContainerImageMount](../../reference/containerimagemount/).

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
