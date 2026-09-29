---
title: "Formats de conversation natifs"
description: "Donner à une CLI externe la capture et la reprise natives de ses conversations."
---

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
