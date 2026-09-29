---
title: "Formats de conversation natifs"
description: "Donner à une CLI externe la capture native de ses conversations et leur reprise à froid, dans toute sandbox et par un transport."
---

## Choisir une brique

Un adaptateur qui renvoie un store natif dans `storage` obtient la même prise en charge des [conversations](../conversations/) que les agents intégrés : capture après chaque tour, reprise à froid dans une nouvelle sandbox et archivage par transport. Choisissez la brique qui correspond à la façon dont la CLI enregistre ses sessions.

| La CLI conserve                          | Brique                                      | Stores intégrés qui l’utilisent | Copie sur l’hôte                            |
| ---------------------------------------- | ------------------------------------------- | ------------------------------- | ------------------------------------------- |
| Une transcription JSONL par conversation | `createTranscriptConversations(layout)`     | Claude Code, Codex              | Le chemin renvoyé par votre layout          |
| Un dossier par session                   | `createSessionBundleConversations(profile)` | Copilot, Kimi                   | `.outpost/conversations/<format>/<id>.json` |

## Décrire le layout d’une transcription

Le layout indique à Outpost où se trouve la transcription, sur l’hôte et dans la sandbox. Cet adaptateur pour une CLI fictive `mycli` reprend avec `--resume <id>` et signale l’identifiant de session dans un événement `session`.

```ts
import { basename, join, posix } from "node:path";
import {
  createAgent,
  createTranscriptConversations,
  type AgentAdapter,
  type TranscriptConversationLayout,
} from "@elie-laloum/outpost";

const sessions = (home: string) => join(home, ".mycli", "sessions");

const layout: TranscriptConversationLayout = {
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

const adapter: AgentAdapter = {
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

Les fonctions côté hôte reçoivent votre dossier personnel, ou `conversationHome` si vous le définissez. `remoteSearchRoot` reçoit le home de l’agent dans la sandbox, et `remotePath` le `SandboxLease`.

| Option                        | Où       | Ce qu’elle renvoie                                                  |
| ----------------------------- | -------- | ------------------------------------------------------------------- |
| `format`                      | Les deux | Le nom stable du format.                                            |
| `searchRoot`, `matches`       | Hôte     | Le dossier où chercher une transcription, et le test d’un fichier.  |
| `preferredPath` (facultatif)  | Hôte     | Un chemin vérifié avant la recherche.                               |
| `directory`                   | Hôte     | Le dossier des transcriptions capturées d’un dépôt.                 |
| `capturePath`                 | Hôte     | L’emplacement où la capture écrit la transcription.                 |
| `remoteSearchRoot`, `pattern` | Sandbox  | Le dossier et le motif `find -name` utilisés à la capture.          |
| `remotePath`                  | Sandbox  | L’emplacement où la restauration écrit la transcription.            |
| `sidecars`                    | Les deux | Si les transcriptions enfants sous `<id>/subagents/` suivent aussi. |

## Suivre le chemin du workspace

Une transcription enregistre le dossier où la CLI s’exécutait. La capture remplace chaque champ `cwd` égal au premier `cwd` enregistré (ou `payload.cwd`) par le chemin du dépôt sur l’hôte. La restauration les remplace par le workspace de la nouvelle sandbox : la CLI reprend dans le bon dossier.

## Empaqueter un dossier de session

`createSessionBundleConversations()` regroupe un dossier de session en un seul bundle JSON. Un script Node.js exécuté dans la sandbox réalise l’empaquetage ; la restauration déploie le bundle dans la nouvelle sandbox.

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

<!-- features -->

- **Emplacement** : Le home de la CLI est `$MYCLI_HOME` s’il est défini, sinon `.mycli` sous le home de l’agent.
  - `root`
  - `sessions`
- **Sélection** : Chemins relatifs au dossier de session ; un dossier doit correspondre pour que ses fichiers soient lus.
  - `include`
  - `exclude`
- **Complétude** : Une session à laquelle manque un fichier obligatoire, ou que `validate` rejette, est refusée.
  - `required`
  - `validate`
- **Relocalisation** : Les fichiers listés passent par `relocate` sous forme de texte à la restauration ; les autres sont copiés octet par octet.
  - `relocated`
  - `relocate`
- **Buckets** : Sessions rangées dans `<sessions>/<bucket>/<id>`, le bucket étant calculé à partir du workspace.
  - `buckets`
  - `bucket`
- **Format** : Le nom utilisé pour la copie sur l’hôte sous `.outpost/conversations/`.
  - `format`

La restauration écrit d’abord chaque fichier dans un dossier de préparation. Une session existante de même identifiant est déplacée dans `.outpost-recovery/`, dans le home de la CLI, avant que la nouvelle prenne sa place.

## Écrire les fonctions exécutées dans la sandbox

`validate`, `bucket` et `relocate` s’exécutent dans la sandbox à partir de leur texte source, pas dans votre processus.

- **Expressions uniquement** : Écrivez une fonction fléchée ou une expression `function`. Une méthode est refusée à la création du store.
- **Autonomes** : Utilisez les arguments, `helpers.join`, `helpers.sha256` et les objets natifs de JavaScript. Un import ou une variable de votre module échoue à l’exécution de la fonction.
- **Valeurs de retour** : `validate` renvoie un message d’erreur ou `undefined`. `relocate` renvoie le nouveau texte ; une exception interrompt la restauration et conserve la session existante.
- **Buckets** : `bucket` est obligatoire avec `buckets: true`.

## Garder le format stable

`format` nomme les enregistrements de conversation, les clés de transport et les dossiers sur l’hôte. Un store refuse de restaurer un enregistrement capturé sous un autre format : le renommer rend les conversations précédentes inutilisables.

Les presets intégrés acceptent un store de remplacement par leur option `conversations`. Son `format` doit correspondre à l’agent (`"claude"`, `"codex"`…), sinon la création du harness échoue. Un `ConversationStore` personnalisé sans `format` est accepté tel quel.

## Archiver par un transport

Enveloppez le store natif pour archiver chaque capture, comme pour un agent intégré : `createTransportConversations(storage, { transporter, namespace })`. [Conversations](../conversations/) montre la configuration complète avec un transport partagé.

## Limites

- **Taille des bundles** : Un bundle de session contient au plus 64 Mio et 4 096 fichiers.
- **Entrées refusées** : Les liens symboliques et les fichiers modifiés pendant la capture font échouer la capture avec le code `session`.
- **Node.js dans la sandbox** : Les bundles de session exécutent un script Node.js : l’image de la sandbox doit fournir `node`.
- **Expressions régulières** : `include` et `exclude` ne peuvent pas utiliser l’option `g` ou `y`.
- **Fichiers de transcription** : La recherche sur l’hôte et les transcriptions enfants ne prennent en compte que les fichiers `.jsonl`. L’échec de la capture d’une transcription enfant produit seulement un avertissement.
- **Transport** : `createTransportConversations()` exige un store doté d’un `format`.
- **Identifiants de conversation** : Seuls les lettres, les chiffres, `_` et `-` sont acceptés.

API : [createTranscriptConversations](../../reference/createtranscriptconversations/) · [TranscriptConversationLayout](../../reference/transcriptconversationlayout/) · [createSessionBundleConversations](../../reference/createsessionbundleconversations/) · [SessionBundleProfile](../../reference/sessionbundleprofile/) · [SessionBundleHelpers](../../reference/sessionbundlehelpers/) · [NativeConversationStore](../../reference/nativeconversationstore/) · [createTransportConversations](../../reference/createtransportconversations/) · [AgentAdapter](../../reference/agentadapter/).
