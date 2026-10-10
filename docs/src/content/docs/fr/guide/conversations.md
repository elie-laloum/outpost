---
title: "Poursuivre une conversation"
description: "Reprenez le contexte enregistré d’un agent ou créez une nouvelle conversation à partir de celui-ci."
---

Après une [première tâche réussie](../first-request/), reprenez sa conversation pour une nouvelle demande. Conservez aussi la branche ou les fichiers nécessaires : la conversation garde le dialogue, pas un processus actif ni une copie de tous les fichiers du workspace.

## Poursuivre une conversation

Appelez `result.resume()` pour envoyer une nouvelle demande dans la conversation créée par une tâche. Le contexte enregistré contient les messages précédents : l’agent peut ainsi poursuivre son travail.

```ts
import { writeFile } from "node:fs/promises";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const first = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Inspect the parser and explain its edge cases." },
});
if (!first.conversation) throw new Error("No portable conversation captured");
await writeFile("conversation-id.txt", first.conversation);
const next = await first.resume({
  brief: { text: "Which edge case deserves a regression test first?" },
});
console.log(next.text);
// Example output: Add a regression test for empty parser input.
```

`resume()` lance un nouveau dispatch dans une sandbox neuve, avec les réglages du premier : dépôt, fournisseur de sandbox, branche. Outpost y restaure d’abord la conversation enregistrée. Passez un réglage pour le remplacer.

## Reprendre plus tard à partir de l’identifiant

`result.conversation` contient l’identifiant de la conversation. Pour reprendre depuis un autre script, passez `continuation: { id }` à `dispatch()`. Outpost la retrouve dans le stockage de l’agent sur cet hôte ou, une fois archivée via un transport, sur n’importe quelle machine.

Conservez `first.conversation` dans `conversation-id.txt` après le premier appel. Le script suivant lit cet identifiant ; utilisez le même dépôt et la même branche que l’exécution initiale.

```ts title="resume-conversation.ts"
import { readFile } from "node:fs/promises";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const id = (await readFile("conversation-id.txt", "utf8")).trim();
const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  continuation: { id },
  brief: { text: "Summarize the edge cases you found earlier." },
});
console.log(result.text);
```

Exécutez `node resume-conversation.ts`. La réponse reprend le contexte enregistré. Une conversation archivée ne transporte pas le worktree : rendez aussi ses fichiers disponibles avant de reprendre.

## Dériver une conversation

`result.fork()` démarre une nouvelle conversation à partir d’une copie de la première. L’originale reste intacte : vous pouvez explorer deux pistes depuis le même contexte. Donnez au fork sa propre branche pour séparer ses commits.

```ts
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
console.log(alternative.conversation, alternative.branch);
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

<span id="où-les-conversations-sont-stockées"></span>
<span id="archiver-et-partager-via-un-transport"></span>
<span id="désactiver-la-capture"></span>

Pour cette étape, suivez [Conserver et partager les conversations](../conversation-storage/).

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
