---
title: "Exécuter sans dépôt Git"
description: "Traiter un dossier copié, un montage explicite ou un espace vide."
---

:::note[Compatibilité des agents]
Les variantes d’agents CLI doivent démontrer leur compatibilité avec le mode fichiers ; les autres sont refusées.
:::

Installez Outpost dans un projet ESM avec Node.js 24+. L’exemple de commande utilise Docker et `node:24-slim`, sans connexion à un agent ni dépôt Git.

Téléchargez l’image avant d’ouvrir la sandbox ; Outpost vérifie sa présence locale.

```sh
docker pull node:24-slim
```

Un workspace `ephemeral` commence vide. Une source `directory` copie par défaut les fichiers ordinaires, en excluant `.git`, `.outpost` et le répertoire de contrôle du run. La sélection de copie n'applique pas `.gitignore`. Les entrées JSON restent des paramètres ; les entrées de dossier ou de snapshot explicitement déclarées fournissent des fichiers.

Les nouvelles copies, snapshots et publications préservent les contenus binaires, les permissions portables, les dossiers vides et les liens relatifs dont la cible reste dans la sélection. La validation développe les aliases capturés avant de traiter les segments parents ; les cibles absentes et les aliases exclus sont refusés. Le parcours ne suit pas les liens. Les liens sortants et les fichiers spéciaux sont refusés. Un montage expose toute sa source et ne peut pas déclarer une sélection de copie.

## Exécuter une commande dans un workspace éphémère

Créez une racine vide avec une conservation locale pour retrouver les fichiers après la fermeture.

```ts title="empty-workspace.ts"
import { createWorkspace } from "@elie-laloum/outpost/workspaces";

export function openEmptyWorkspace() {
  return createWorkspace({
    source: { kind: "ephemeral" },
    runtime: { directory: "./.outpost", namespace: "documents" },
    retention: { policy: "local" },
  });
}
```

Exécutez la commande et vérifiez son statut de sortie.

```ts title="ephemeral.ts"
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { openEmptyWorkspace } from "./empty-workspace.ts";

await using workspace = await openEmptyWorkspace();
await using sandbox = await workspace.sandbox({
  sandboxProvider: createDockerSandboxProvider({ image: "node:24-slim" }),
});
const result = await sandbox.command({
  executable: "node",
  arguments: ["-e", "require('fs').writeFileSync('result.json', '{}')"],
});
if (result.status !== 0) throw new Error(result.stderr);
console.log(workspace.directory);
```

Ce script crée `result.json` dans `workspace.directory`. La conservation `local` garde ce dossier après réussite ou échec. La page [Publier les fichiers produits](../publishing-files/) montre comment copier les résultats vers une destination.

Les workspaces TypeScript de fichiers utilisent par défaut `.outpost` sous le répertoire courant. L'exécution Git legacy conserve `<repository>/.outpost`. Les modes de fichiers ne recherchent pas de dépôt et ne chargent pas les variables d'environnement d'un `.env` du dossier de données.

Docker et Podman nécessitent Node.js 24+, le moteur choisi et `tar` sur l'hôte pour les transferts streamés actuels. L'image de conteneur est explicite. Git est nécessaire uniquement pour les fonctionnalités Git ou une commande choisie par le appelant. Un workflow sans opération de sandbox peut utiliser directement le moteur de workflows.

## Monter une source explicitement

Déclarez le sous-répertoire exposé et choisissez explicitement si la sandbox peut écrire dans la source.

```ts title="mounted-documents.ts"
import { createWorkspace } from "@elie-laloum/outpost/workspaces";

export function openMountedDocuments() {
  return createWorkspace({
    source: {
      kind: "directory",
      directory: "./documents",
      access: { mode: "mount", target: "input", readOnly: false },
    },
  });
}
```

La racine de travail possédée reste distincte ; la source apparaît sous `input/`. `readOnly: true` empêche la sandbox de la modifier. Un montage inscriptible modifie immédiatement la source. Le cleanup de la sandbox ou du workspace ne la supprime pas et n'annule pas ces modifications. La restitution vers une source montée en écriture est refusée ; publier les fichiers produits dans la racine possédée vers une autre destination reste possible.

Les verrous communs à l'hôte coordonnent les sources et les destinations qui se chevauchent, entre différentes racines de runtime pour un même utilisateur. Deux montages qui se chevauchent sont refusés si l'un est inscriptible. La capture d'une copie est refusée lorsqu'un writer Outpost possède la source. Les chemins canoniques, les aliases connus et les relations parent/enfant participent aux contrôles. Ces verrous coordonnent les processus Outpost coopérants ; les modifications externes sont détectées et préservées.

## Vérifier l’environnement d’exécution

| Environnement          | Copie / éphémère              | Montage de source                         |
| ---------------------- | ----------------------------- | ----------------------------------------- |
| Docker / Podman montés | Oui                           | Lecture seule ou écriture                 |
| Docker / Podman isolés | Transferts                    | Refus                                     |
| Local                  | Fichiers hôte, sans isolation | Refus                                     |
| Vercel / Daytona       | Transferts                    | Refus                                     |
| Firecracker            | Transferts expérimentaux      | Refus                                     |
| Memory testing         | Commandes scriptées           | Simulation seulement ; transferts refusés |

Le dispatch de fichiers prend en charge le harness Outpost et les adapters custom/scriptés compatibles. Dispatch CLI natif, attachement interactif, continuation, réparation et live input exigent une capacité déclarée et validée pour la variante épinglée de l'adapter. Les variantes natives non démontrées sont refusées. Les validations live cloud et Firecracker restent séparées. La restauration de fichiers n'ajoute pas une récupération automatique d'allocation abandonnée aux fournisseurs isolés ou cloud.

### Inspecter avant d’allouer

`inspectExecution()` lit les mêmes options que `createSandbox()`, ainsi que des réglages de dispatch facultatifs, et renvoie le plan sans allouer de sandbox ni démarrer d’agent.

```ts title="inspect-mount.ts"
import {
  createAgent,
  createClaudeHarness,
  inspectExecution,
} from "@elie-laloum/outpost/core";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const plan = inspectExecution(
  {
    workspaceSource: {
      kind: "directory",
      directory: "./documents",
      access: { mode: "mount", target: "input", readOnly: true },
    },
    sandboxProvider: createDockerSandboxProvider({ image: "outpost-claude" }),
    agent: createAgent({ harness: createClaudeHarness() }),
  },
  { continuation: { id: "previous-session" } },
);

for (const diagnostic of plan.diagnostics)
  console.error(`${diagnostic.code}: ${diagnostic.message}`);
```

`plan.workspace.binding` vaut `mount-readonly` ; `plan.sandbox.bindings` liste ce que le fournisseur prend en charge ; `plan.requirements` ajoute `dispatch` et `continuation` pour `claude`. Un `plan.diagnostics` vide signifie que la création de la sandbox et le dispatch accepteraient ces options. Sinon, chaque entrée porte un `code` stable et le message exact que l’exécution lèverait. Les fournisseurs d’extension sont inspectés à travers leurs capacités d’exécution déclarées.

### État de validation des CLI natives

Les validations réelles dans Docker couvrent les quatre variantes : workspaces éphémères, copies de répertoires, montages de sources en lecture seule et montages en écriture. Les déclarations ci-dessous appartiennent à chaque adapter épinglé ; aucun wrapper autour de `harness.bind` n’est nécessaire. La prise en charge de Git et un précontrôle de conteneur réussi ne démontrent pas le fonctionnement en mode fichiers.

Claude utilisait `claude-haiku-4-5-20251001` avec un jeton de compte. Codex utilisait `gpt-5.6-luna` avec une clé API d’environnement via sa variante existante de fournisseur Responses personnalisé. Copilot, Kimi (région internationale) et Antigravity utilisaient leurs sessions de compte locales et la sélection native du modèle par défaut. Ces campagnes ne valident pas toutes les combinaisons d’authentification, de modèle et de fournisseur.

La validation interactive utilise un vrai terminal et les confirmations natives. Les préférences d’accueil de Claude et la confiance de Claude/Codex pour le répertoire temporaire sont préparées dans le répertoire personnel privé. Un nouveau répertoire personnel peut encore afficher les dialogues de configuration ; les déclarations de capacités ne les remplissent pas. Kimi démarre les sessions interactives sans brief initial : sa première demande est saisie dans le terminal. La validation du terminal Antigravity termine l’accueil natif en désactivant la collecte facultative des interactions, confirme la confiance du workspace possédé et approuve chaque outil. Les premiers délais dépassés provenaient de dialogues de configuration et de permission non traités.

| Agent          | CLI épinglée | Dispatch | Réparations | Reprise  | Entrée en cours d’exécution | Interactif |
| -------------- | ------------ | -------- | ----------- | -------- | --------------------------- | ---------- |
| Claude Code    | 2.1.280      | Déclaré  | Déclarées   | Déclarée | Déclarée                    | Déclaré    |
| Codex          | 0.156.1      | Déclaré  | Déclarées   | Déclarée | Déclarée                    | Déclaré    |
| GitHub Copilot | 1.0.88       | Déclaré  | Déclarées   | Déclarée | Déclarée                    | Déclaré    |
| Kimi Code      | 2.1.1        | Déclaré  | Déclarées   | Déclarée | Déclarée                    | Déclaré    |
| Antigravity    | 1.2.12       | Déclaré  | Déclarées   | Refusée  | Refusée                     | Déclaré    |

Les contributeurs peuvent utiliser `scripts/cli-file-live.mjs` depuis le dépôt pour valider une CLI épinglée dans Docker. Le mode `--preflight` vérifie la version installée et les sources de fichiers sans appel de modèle. Le mode explicite `--live` effectue des appels payants avec les identifiants d’environnement sélectionnés ou des sessions de compte locales explicitement autorisées ; il est exclu des tests courants et de la CI. Valider le dispatch avant les réparations pour toute autre variante. Un contrôle préalable réussi ou un test de protocole simulé ne constitue pas une preuve de validation réelle. Consulter la [procédure de validation](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/docs/audit/cli-file-workspaces.md) avant de lancer le script.

Le dispatch de fichiers capture les conversations natives sous son répertoire d’exécution et les restaure à l’emplacement natif du nouveau sandbox. Les tests synthétiques vérifient le confinement dans le runtime ; Claude, Codex et Kimi ont aussi démontré la reprise et le fork à chaud, puis la restauration et le fork dans de nouveaux conteneurs. Copilot a démontré la reprise à chaud et à froid ; le fork automatisé reste indisponible. Antigravity a démontré uniquement la reprise à chaud et ne dispose pas de capture portable : la capacité générale de reprise reste donc refusée. Copilot injecte les consignes via son serveur RPC natif ; Kimi utilise son serveur local authentifié dans la sandbox. Leurs configurations avec hooks natifs ou MCP conservent le protocole existant et le steering par interruption/reprise en attendant la validation de ces combinaisons serveur. Antigravity utilise aussi l’interruption/reprise : son entrée en streaming démarre des tours distincts et ne démontre pas l’injection dans un tour actif. Le steering par reprise a réussi sur les quatre variantes de fichiers pour Copilot, Kimi et Antigravity. Voir [le steering](../steering/) pour les modes de livraison.

Branches, commits, guards Git, intégration, conflits et spéculation restent des fonctionnalités Git. Les résultats de fichiers utilisent `workspaceInfo` et `fileOutputs` ; les résultats Git conservent `branch` et `commits` obligatoires. Les rapports d'agent de fichiers utilisent la version 2 ; les rapports Git gardent la version 1. Sélectionner explicitement le filesystem avec `createHarnessFileTools({ selection: "filesystem" })` et `createHarnessSearchTools({ selection: "filesystem" })` ; les appels existants de ces outils sélectionnent Git par défaut.

## Pour continuer

- [Publier les fichiers produits](../publishing-files/)

## Pour aller plus loin

- [Conserver et reprendre les fichiers](../resuming-file-workspaces/)
- [Exécuter des tâches de fichiers indépendantes](../queued-workflows/)

<span id="conserver-et-reprendre-les-fichiers"></span>

<span id="exécuter-des-jobs-indépendants"></span>

<span id="vérifier-les-capacités-et-récupérer-une-publication"></span>
