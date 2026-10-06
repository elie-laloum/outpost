---
title: "Poursuivre une conversation"
description: "Reprenez le contexte enregistré d’un agent ou créez une nouvelle conversation à partir de celui-ci."
---

## Poursuivre une conversation

Appelez `result.resume()` pour envoyer une nouvelle demande dans la conversation créée par une tâche. Le contexte enregistré contient les messages précédents : l’agent peut ainsi poursuivre son travail.

```ts
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const first = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Inspect the parser and explain its edge cases." },
});
const next = await first.resume({
  brief: { text: "Which edge case deserves a regression test first?" },
});
reportValue(next.text);
// Example output: Add a regression test for empty parser input.
```

`resume()` lance un nouveau dispatch dans une sandbox neuve, avec les réglages du premier : dépôt, fournisseur de sandbox, branche. Outpost y restaure d’abord la conversation enregistrée. Passez un réglage pour le remplacer.

## Reprendre plus tard à partir de l’identifiant

`result.conversation` contient l’identifiant de la conversation. Pour reprendre depuis un autre script, passez `continuation: { id }` à `dispatch()`. Outpost la retrouve dans le stockage de l’agent sur cet hôte ou, une fois archivée via un transport, sur n’importe quelle machine.

## Dériver une conversation

`result.fork()` démarre une nouvelle conversation à partir d’une copie de la première. L’originale reste intacte : vous pouvez explorer deux pistes depuis le même contexte. Donnez au fork sa propre branche pour séparer ses commits.

```ts
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const first = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Inspect the parser and explain its edge cases." },
});
const alternative = await first.fork({
  branch: { mode: "named", name: "outpost/parser-state-machine" },
  brief: { text: "Rewrite the parser as a state machine and commit it." },
});
reportValue(alternative.conversation, alternative.branch);
// Example output: session-2 outpost/parser-state-machine
```

À partir d’un identifiant, `continuation: { id, fork: true }` produit le même effet.

## Poursuivre dans une sandbox ouverte

Dans une [session de sandbox](../sandbox-sessions/), `result.resume()` et `result.fork()` continuent dans la même sandbox, sans restauration. Ils n’acceptent que les options du brief et du tour : les réglages de la sandbox sont figés.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
const plan = await sandbox.dispatch({
  brief: { text: "Propose a fix for the flaky login test. Do not edit files." },
});
const tests = await sandbox.command({ executable: "npm", arguments: ["test"] });
await plan.resume({
  brief: { text: `Apply your fix. Current test output:\n${tests.stdout}` },
});
```

`sandbox.resume(id, options)` et `sandbox.fork(id, options)` prennent un identifiant, y compris celui d’une conversation capturée par un dispatch antérieur.

## Ce que chaque agent prend en charge

À froid signifie dans une nouvelle sandbox (`dispatch()`, `result.resume()` sur un résultat de `dispatch()`) ; à chaud, dans la même sandbox ouverte. [Choisir un agent](../choose-an-agent/) compare les autres capacités.

| Agent                          | Reprise à froid | Reprise à chaud         | Fork |
| ------------------------------ | --------------- | ----------------------- | ---- |
| Claude Code, Codex, Kimi       | Oui             | Oui                     | Oui  |
| GitHub Copilot CLI             | Oui             | Oui                     | Non  |
| [Harness intégré](../harness/) | Oui             | Oui                     | Oui  |
| Antigravity                    | Non             | Même sandbox uniquement | Non  |

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

## Limites

- **Taille des archives** : une session Copilot ou Kimi est limitée à 64 Mio et 4 096 fichiers. Liens symboliques, fichiers obligatoires absents et fichiers modifiés pendant la capture échouent avec le code `session`.
- **État Kimi** : la capture exclut logs, tâches de fond, tâches cron, notifications et fichiers de verrou. Une session reprise restaure la conversation, pas les processus en cours ni les planifications.
- **Antigravity** : rien n’est capturé, l’option `conversations` est donc refusée.
- **Pas de chiffrement** : les conversations contiennent prompts, contenu du dépôt et sorties d’outils, stockés et archivés sans chiffrement ni authentification. Restreignez leur accès comme celui du dépôt.
- **Identifiants à part** : une conversation ne transporte aucun identifiant. L’agent qui reprend a besoin de sa propre [authentification](../authentication/), et supprimer les identifiants laisse les conversations en place.
- **Exécution sur l’hôte** : avec l’[exécution sur l’hôte](../host-process/), les agents utilisent vos propres stockages de sessions. Kimi refuse de restaurer une session déjà présente sous un autre workspace.
- **Agents de repli** : un [agent de repli](../fallback-agents/) n’accepte pas `continuation`. `result.resume()` poursuit avec le candidat qui a répondu.

API : [DispatchResult](../../reference/dispatchresult/) · [WarmDispatchResult](../../reference/warmdispatchresult/) · [Sandbox](../../reference/sandbox/) · [ConversationStore](../../reference/conversationstore/) · [createTransportConversations](../../reference/createtransportconversations/) · [createKimiConversations](../../reference/createkimiconversations/) · [createHarnessConversations](../../reference/createharnessconversations/).

## Reprendre un harness routé

Le [routage de modèles](../model-routing/) enregistre chaque sélection effective dans les transcripts de version 2 en conservant le format de stockage `harness`. Les transcripts de version 1 restent lisibles et sont convertis lorsqu’une continuation active le routage. Reprise et fork restaurent les messages ; l’étape suivante évalue le routeur sans rejouer les appels de modèles ou d’outils terminés. Le replay du journal émet les sélections enregistrées sans contacter Jev ou Laya.
