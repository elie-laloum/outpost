---
title: "Prendre en charge un format de conversation"
description: "Enregistrez et restaurez les sessions natives d’un agent en ligne de commande ajouté à Outpost."
---

## Choisir le format de stockage

Un adaptateur d’agent peut déclarer son stockage de sessions dans `storage`. Outpost l’utilise alors pour enregistrer les conversations après les échanges, les restaurer dans une autre sandbox et les archiver via un transport. Choisissez la fonction adaptée à la façon dont votre outil enregistre ses sessions.

| La CLI conserve                          | Fonction                                    | Stockages intégrés qui l’utilisent | Copie sur l’hôte                                        |
| ---------------------------------------- | ------------------------------------------- | ---------------------------------- | ------------------------------------------------------- |
| Une transcription JSONL par conversation | `createTranscriptConversations(layout)`     | Claude Code, Codex                 | Le chemin renvoyé par la configuration des emplacements |
| Un dossier par session                   | `createSessionBundleConversations(profile)` | Copilot, Kimi                      | `.outpost/conversations/<format>/<id>.json`             |

## Décrire l’emplacement d’une transcription

La configuration indique à Outpost où trouver la transcription, sur l’hôte et dans la sandbox. Cet adaptateur pour une CLI fictive `mycli` reprend avec `--resume <id>` et signale l’identifiant de session dans un événement `session`.

<!-- tabs -->

```ts title="conversation-layout.ts"
import { join, basename, posix } from "node:path";
import type { TranscriptConversationLayout } from "@elie-laloum/outpost";

export const sessions = (home: string) => join(home, ".mycli", "sessions");
export const layout: TranscriptConversationLayout = {
  format: "mycli",
  sidecars: false,
  searchRoot: sessions,
  matches: (file, id) => basename(file) === `${id}.jsonl`,
  directory: (_repository, home) => sessions(home),
  capturePath: (id, _repository, home) => join(sessions(home), `${id}.jsonl`),
  remoteSearchRoot: (home) => posix.join(home, ".mycli", "sessions"),
  pattern: (id) => `${id}.jsonl`,
  remotePath: (id, sandbox) =>
    posix.join(sandbox.home, ".mycli", "sessions", `${id}.jsonl`),
};
```

```ts title="conversation-events.ts"
import type { AgentEvent } from "@elie-laloum/outpost";

export function events(line: string): AgentEvent[] {
  const event = JSON.parse(line);
  if (event.session) return [{ kind: "conversation", id: event.session }];
  return [{ kind: "text", text: String(event.text ?? "") }];
}
```

```ts title="adapter.ts"
import type { AgentAdapter } from "@elie-laloum/outpost";
import { createTranscriptConversations } from "@elie-laloum/outpost";
import { layout } from "./conversation-layout.ts";
import { events } from "./conversation-events.ts";

export const adapter: AgentAdapter = {
  name: "mycli",
  resumable: true,
  storage: createTranscriptConversations(layout),
  request: ({ text, continuation }) => ({
    executable: "mycli",
    arguments: [
      "--json",
      ...(continuation ? ["--resume", continuation.id] : []),
    ],
    stdin: text ?? "",
  }),
  events,
};
```

```ts title="agent.ts"
import { createAgent } from "@elie-laloum/outpost";
import { adapter } from "./adapter.ts";

export const agent = createAgent({
  harness: { kind: "cli", bind: () => adapter },
});
```

Les fonctions côté hôte reçoivent votre dossier personnel, ou `conversationHome` si vous le définissez. `remoteSearchRoot` reçoit le répertoire personnel de l’agent dans la sandbox, et `remotePath` le `SandboxLease`.

Référence API : [TranscriptConversationLayout](../../reference/transcriptconversationlayout/).

## Suivre le chemin du workspace

Une transcription enregistre le dossier où la CLI s’exécutait. La capture remplace chaque champ `cwd` égal au premier `cwd` enregistré (ou `payload.cwd`) par le chemin du dépôt sur l’hôte. La restauration les remplace par le workspace de la nouvelle sandbox : la CLI reprend dans le bon dossier.

## Archiver un dossier de session

`createSessionBundleConversations()` regroupe un dossier de session en une seule archive JSON. Un script Node.js exécuté dans la sandbox crée cette archive ; la restauration en extrait les fichiers dans la nouvelle sandbox.

```ts
import { createSessionBundleConversations } from "@elie-laloum/outpost";

export const storage = createSessionBundleConversations({
  format: "mycli",
  root: { variable: "MYCLI_HOME", directory: ".mycli" },
  sessions: "sessions",
  include: /^(?:session\.json|events\.jsonl|files(?:\/|$))/,
  exclude: /\.lock$/,
  required: ["session.json", "events.jsonl"],
  relocated: ["session.json"],
  validate: (files, id) =>
    JSON.parse(files.text("session.json") ?? "null")?.id === id
      ? undefined
      : "Unsupported mycli session",
  relocate: (_path, text, { cwd }) =>
    JSON.stringify({ ...JSON.parse(text), cwd }),
});
console.log(storage.format); // mycli
```

<!-- check:run -->

Référence API : [SessionBundleProfile](../../reference/sessionbundleprofile/).

La restauration écrit d’abord chaque fichier dans un dossier de préparation. Une session existante de même identifiant est déplacée dans `.outpost-recovery/`, dans le répertoire personnel de la CLI, avant que la nouvelle prenne sa place.

## Écrire les fonctions exécutées dans la sandbox

`validate`, `bucket` et `relocate` s’exécutent dans la sandbox à partir de leur texte source, pas dans votre processus.

- **Expressions uniquement** : Écrivez une fonction fléchée ou une expression `function`. Une méthode est refusée à la création du stockage.
- **Autonomes** : Utilisez les arguments, `helpers.join`, `helpers.sha256` et les objets natifs de JavaScript. Un import ou une variable de votre module échoue à l’exécution de la fonction.
- **Valeurs de retour** : `validate` renvoie un message d’erreur ou `undefined`. `relocate` renvoie le nouveau texte ; une exception interrompt la restauration et conserve la session existante.
- **Buckets** : `bucket` est obligatoire avec `buckets: true`.

## Garder le format stable

`format` nomme les enregistrements de conversation, les clés de transport et les dossiers sur l’hôte. Un stockage refuse de restaurer un enregistrement capturé sous un autre format : le renommer rend les conversations précédentes inutilisables.

Les configurations intégrées acceptent un stockage de remplacement par leur option `conversations`. Son `format` doit correspondre à l’agent (`"claude"`, `"codex"`…), sinon la création du harness échoue. Un `ConversationStore` personnalisé sans `format` est accepté tel quel.

## Archiver par un transport

Enveloppez le stockage natif pour archiver chaque capture, comme pour un agent intégré : `createTransportConversations(storage, { transporter, namespace })`. [Conversations](../conversations/) montre la configuration complète avec un transport partagé.

## Limites

- **Taille des archives** : Une archive de session contient au plus 64 Mio et 4 096 fichiers.
- **Entrées refusées** : Les liens symboliques et les fichiers modifiés pendant la capture font échouer la capture avec le code `session`.
- **Node.js dans la sandbox** : La capture et la restauration des archives utilisent un script Node.js : l’image de la sandbox doit fournir `node`.
- **Expressions régulières** : `include` et `exclude` ne peuvent pas utiliser l’option `g` ou `y`.
- **Fichiers de transcription** : La recherche sur l’hôte et les transcriptions enfants ne prennent en compte que les fichiers `.jsonl`. L’échec de la capture d’une transcription enfant produit seulement un avertissement.
- **Transport** : `createTransportConversations()` exige un stockage doté d’un `format`.
- **Identifiants de conversation** : Seuls les lettres, les chiffres, `_` et `-` sont acceptés.

API : [createTranscriptConversations](../../reference/createtranscriptconversations/) · [TranscriptConversationLayout](../../reference/transcriptconversationlayout/) · [createSessionBundleConversations](../../reference/createsessionbundleconversations/) · [SessionBundleProfile](../../reference/sessionbundleprofile/) · [SessionBundleHelpers](../../reference/sessionbundlehelpers/) · [NativeConversationStore](../../reference/nativeconversationstore/) · [createTransportConversations](../../reference/createtransportconversations/) · [AgentAdapter](../../reference/agentadapter/).
