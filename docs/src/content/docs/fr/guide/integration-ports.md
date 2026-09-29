---
title: "Intégrations personnalisées"
description: "Étendre une capacité sans remplacer le runtime."
---

Implémentez le contrat responsable du comportement voulu. Gardez indépendants protocoles CLI, environnements d’exécution et persistance.

| Contrat                            | Responsabilité                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `AgentAdapter`                     | Construire les requêtes CLI, planifier les identifiants et décoder les événements. |
| `SandboxProvider` / `SandboxLease` | Allouer, invoquer, transférer et libérer.                                          |
| `ConversationStore`                | Localiser, capturer et restaurer les transcriptions.                               |
| `ModelProvider`                    | Valider les réglages de modèle et échanger des messages bornés.                    |
| `Transport`                        | Lire, lister et modifier conditionnellement les objets binaires versionnés.        |
| `TaskQueue`                        | Persister les requêtes et protéger baux et résultats des workers.                  |

## Ajouter un harness CLI

Un `CliHarness` expose `kind: "cli"` et `bind(model)`, qui renvoie un `AgentAdapter`. Composez-le avec `createAgent({ harness })`. Séparez construction des requêtes et décodage des événements, déclarez honnêtement les capacités de continuation et fournissez un store uniquement si la restauration fonctionne.

Seuls `name`, `request()` et `events()` sont obligatoires. Chaque membre optionnel active une capacité : `resumable`, `forkable` et `fork()` pour la continuation, `storage` pour les conversations portables, `credentials()` et `configuration()` pour le home de l’agent, `quota()` et `unavailable()` pour le [repli](../agent-fallback/) et les pauses de quota, `usage` pour le décompte des tokens et `liveInput` pour le [pilotage](../steering/) d’un tour en cours. Outpost supervise le processus, la sandbox, l’annulation et les nouvelles tentatives de la même façon pour chaque adapter.

## Formats de conversation natifs

Une CLI externe obtient la capture native, la reprise à froid et l’archivage par transport en renvoyant un store natif dans `storage`. Deux briques couvrent les organisations courantes ; les stores intégrés de Claude, Codex, Copilot et Kimi en sont construits.

`createTranscriptConversations()` prend en charge les CLI qui conservent un transcript JSONL par conversation. Le layout indique à Outpost où trouver le transcript sur l’hôte et dans la sandbox :

```ts
import { basename, join, posix } from "node:path";
import {
  createAgent,
  createTranscriptConversations,
  type AgentAdapter,
} from "@elie-laloum/outpost";

const sessions = (home: string) => join(home, ".mycli", "sessions");

const adapter: AgentAdapter = {
  name: "mycli",
  resumable: true,
  storage: createTranscriptConversations({
    format: "mycli",
    sidecars: false,
    searchRoot: sessions,
    remoteSearchRoot: (home) => posix.join(home, ".mycli", "sessions"),
    pattern: (id) => `${id}.jsonl`,
    matches: (file, id) => basename(file) === `${id}.jsonl`,
    directory: (_repository, home) => sessions(home),
    capturePath: (id, _repository, home) => join(sessions(home), `${id}.jsonl`),
    remotePath: (id, sandbox) =>
      posix.join(sandbox.home, ".mycli", "sessions", `${id}.jsonl`),
  }),
  request: ({ text, continuation }) => ({
    executable: "mycli",
    arguments: [
      "--json",
      ...(continuation ? ["--resume", continuation.id] : []),
    ],
    stdin: text ?? "",
  }),
  events: (line) => {
    const event = JSON.parse(line);
    if (event.session) return [{ kind: "conversation", id: event.session }];
    return [{ kind: "text", text: String(event.text ?? "") }];
  },
};

export const agent = createAgent({
  harness: { kind: "cli", bind: () => adapter },
});
```

Capture et restauration réécrivent les valeurs `cwd` enregistrées égales au workspace d’origine, pour que le transcript suive le dépôt dans une autre sandbox.

`createSessionBundleConversations()` prend en charge les CLI qui conservent chaque session dans un dossier. Son profil nomme le home de la CLI et le dossier des sessions, sélectionne les fichiers par expressions régulières et liste les fichiers dont une session ne peut se passer. Un script exécuté dans la sandbox regroupe la session en un bundle JSON, limité à 64 Mio et 4 096 fichiers, et refuse les liens symboliques et les fichiers modifiés pendant la capture. La restauration prépare chaque fichier et conserve toute session précédente sous `.outpost-recovery/`.

`validate`, `bucket` et `relocate` s’exécutent dans la sandbox à partir de leur texte source. Écrivez-les comme des expressions fléchées ou de fonction autonomes : elles ne peuvent utiliser ni imports ni variables de votre module, seulement leurs arguments et les `helpers` fournis par Outpost. Une méthode ou une expression régulière avec l’option `g` ou `y` est refusée à la création du store ; une référence à une variable extérieure échoue à la capture d’une session.

Gardez `format` stable une fois des conversations capturées : il nomme les enregistrements de conversation, les clés de transport et les dossiers de bundles. Enveloppez le store avec `createTransportConversations()` pour l’archiver comme un format intégré.

## Ajouter un fournisseur de sandbox

Renvoyez un bail avec `root`, `home`, invocation, upload/download et libération idempotente. Préservez le statut de sortie après fermeture des flux, l’annulation des processus et les transferts binaires. `createMountedSandboxProvider()` et `createRemoteSandboxProvider()` aident à composer les stratégies correspondantes.

## Valider l’intégration

Testez les échecs observables, la propriété et le nettoyage. Des tests de protocole simulés n’établissent pas le comportement réel des montages, terminaux ou de l’isolation réseau. Les SDK optionnels appartiennent à leur point d’entrée d’intégration pour conserver un cœur léger.

Pour contribuer au dépôt, l’arborescence sépare contrats de domaine, orchestration applicative, adaptateurs, fournisseurs, infrastructure et CLI. Chaque agent intégré vit dans son propre dossier `src/adapters/agents/<agent>/`, avec un descripteur enregistré dans le catalogue des agents, dont dérivent `outpost init`, `outpost doctor`, le bootstrap distant et l’image générée. Suivez les consignes du dépôt et exécutez les contrôles pertinents pour la frontière modifiée.

API : [CliHarness](../../reference/cliharness/) · [AgentAdapter](../../reference/agentadapter/) · [SandboxProvider](../../reference/sandboxprovider/) · [ConversationStore](../../reference/conversationstore/) · [createTranscriptConversations](../../reference/createtranscriptconversations/) · [createSessionBundleConversations](../../reference/createsessionbundleconversations/).
