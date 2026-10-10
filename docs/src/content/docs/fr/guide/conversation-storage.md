---
title: "Conserver et partager les conversations"
description: "Conservez les conversations capturées et archivez-les via un transport."
---

Partez de [conversations](../conversations/) et de sa configuration. Conservez les conversations capturées et archivez-les via un transport.

## Où les conversations sont stockées

Après chaque tour, Outpost copie la conversation de la sandbox vers l’hôte. `result.transcript` contient le chemin de cette copie.

| Agent           | Store par défaut               | Emplacement sur l’hôte                      |
| --------------- | ------------------------------ | ------------------------------------------- |
| Claude Code     | `createClaudeConversations()`  | `~/.claude/projects/<project>/<id>.jsonl`   |
| Codex           | `createCodexConversations()`   | `~/.codex/sessions/<yyyy>/<mm>/<dd>/`       |
| Copilot CLI     | `createCopilotConversations()` | `.outpost/conversations/copilot/<id>.json`  |
| Kimi Code       | `createKimiConversations()`    | `.outpost/conversations/kimi/<id>.json`     |
| Harness intégré | `createHarnessConversations()` | `.outpost/conversations/harness/<id>.jsonl` |

Copilot et Kimi conservent une session sous forme de dossier : Outpost la regroupe en une archive JSON. L’option `conversationHome` de `dispatch()` ou de `createSandbox()` remplace `~`, ou le dépôt pour les archives, comme racine de ces chemins.

La restauration réécrit les chemins du dépôt enregistrés dans la conversation vers ceux de la nouvelle sandbox. Pour doter une CLI que vous ajoutez de son propre stockage, voir [Formats de conversation natifs](../conversation-formats/).

## Archiver et partager via un transport

`createTransportConversations()` enveloppe le stockage d’un agent et archive en plus chaque capture via un [transport](../storage/). Une conversation reprend alors sur une autre machine, ou après suppression du dossier `.outpost` du dépôt.

```ts
import {
  createAgent,
  createCodexConversations,
  createCodexHarness,
  createLocalTransport,
  createTransportConversations,
} from "@elie-laloum/outpost";

const conversations = createTransportConversations(createCodexConversations(), {
  transporter: createLocalTransport({ directory: "/mnt/shared/outpost" }),
  namespace: "my-project",
});

export const coder = createAgent({
  harness: createCodexHarness({ authentication: "account", conversations }),
});
```

<!-- features -->

- **Format identique**: Enveloppez le stockage du même agent, par exemple `createHarnessConversations()` pour `createHarness()`. Un format différent échoue dès la création du harness.
- **Namespace stable**: Utilisez le même nom de projet sur toutes les machines qui partagent ces conversations.
- **Transport partagé**: Utilisez [S3 ou R2](../object-storage/) entre plusieurs hôtes ; un transport local ne coordonne les écritures que sur une seule machine.

`result.transcriptReference` identifie la copie archivée. Les configurations prédéfinies Claude Code, Codex, Copilot et Kimi, ainsi que `createHarness()`, acceptent `conversations`.

## Désactiver la capture

`saveConversations: false` sur Claude Code ou Codex laisse les conversations dans la sandbox : seule une reprise à chaud peut les poursuivre. `conversations: false` sur `createHarness()` n’enregistre aucune transcription et refuse reprise, fork et réparations de réponse. Copilot et Kimi capturent toujours.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

export const reviewer = createAgent({
  harness: createClaudeHarness({
    authentication: "account",
    saveConversations: false,
  }),
});
```
