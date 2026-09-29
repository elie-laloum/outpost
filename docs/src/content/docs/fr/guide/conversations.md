---
title: "Conversations"
description: "Continuer une conversation d’agent ou en dériver une autre."
---

Codex, Claude Code, Copilot et Kimi peuvent capturer leurs conversations natives. Le fork est pris en charge par Codex, Claude Code et Kimi. Continuez-en une avec `result.resume()` ou créez une conversation distincte avec `result.fork()`.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const first = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Inspect the parser and explain its edge cases." },
});
const next = await first.resume({
  sandboxProvider,
  brief: { text: "Which edge case deserves a regression test first?" },
});
console.log(next.text);
```

## Choix de continuation

Dans une sandbox ouverte, utilisez `sandbox.resume(id, options)` ou `sandbox.fork(id, options)`. Un résultat à froid restaure sa conversation capturée dans un environnement ultérieur. L’identifiant de conversation et sa transcription sont distincts de la branche et du workspace Git.

Désactiver la capture empêche le résultat de fournir une conversation enregistrée pour restauration ultérieure. Antigravity reprend seulement une conversation émise dans la même sandbox ouverte ; il refuse la reprise à froid et le fork automatisé. Copilot refuse le fork automatisé.

## Stockage

Chaque preset CLI capture ses sessions dans son store natif : `createClaudeConversations()`, `createCodexConversations()`, `createCopilotConversations()` et `createKimiConversations()` créent directement ces stores. `createHarnessConversations()` stocke les transcriptions de la boucle intégrée. `createTransportConversations()` enveloppe n’importe lequel de ces stores pour archiver ses captures via un transport. La restauration réécrit les chemins de workspace pris en charge lorsque la transcription se déplace. Pour donner une capture native à un harness CLI externe, voir [les formats de conversation natifs](../conversation-formats/).

Passez `conversations` à `createClaudeHarness()`, `createCodexHarness()`, `createCopilotHarness()`, `createKimiHarness()` ou `createHarness()` pour capturer les sessions de cet agent dans n’importe quel `ConversationStore` au lieu du store natif par défaut :

```ts
import {
  createAgent,
  createKimiConversations,
  createKimiHarness,
  createLocalTransport,
  createTransportConversations,
} from "@elie-laloum/outpost";

const conversations = createTransportConversations(createKimiConversations(), {
  transporter: createLocalTransport({ directory: "/mnt/shared/outpost" }),
  namespace: "my-project",
});

export const coder = createAgent({
  harness: createKimiHarness({ authentication: "account", conversations }),
});
```

Une session capturée par un dispatch peut alors être reprise, ou forkée avec Kimi, depuis une autre machine ou après suppression du dossier `.outpost` local du dépôt. Utilisez un `createS3Transport()` pour la partager entre hôtes. Le `format` du store doit correspondre à l’agent : envelopper `createKimiConversations()` pour Kimi et `createHarnessConversations()` pour `createHarness()`. Un format incompatible, une valeur qui n’est pas un store, ou `saveConversations: false` combiné à `conversations` échoue dès la création du harness, avant toute allocation de sandbox. Un store personnalisé sans `format` est accepté tel quel. Sans l’option, chaque agent conserve son store natif. `createAntigravityHarness()` refuse `conversations`, car Antigravity n’a pas de capture portable.

Les conversations archivées contiennent prompts, contenu du dépôt et sorties d’outils. Outpost ne les chiffre ni ne les authentifie ; restreignez l’accès au transport comme celui du dépôt.

Séparez l’accès aux transcriptions de l’authentification. Une conversation enregistrée ne fournit pas d’identifiants de compte, et supprimer les identifiants ne supprime pas le contenu des conversations.

Copilot et Kimi capturent un bundle JSON par session sous `.outpost/conversations/<format>/` dans le dépôt (ou sous `conversationHome` si fourni). `createCopilotConversations()`, `createKimiConversations()` et `createTransportConversations()` prennent ces bundles en charge. `transcript` désigne le bundle, pas un historique JSONL unique. La capture est limitée à 64 Mio de données et 4 096 fichiers ; fichiers obligatoires absents, liens symboliques et métadonnées non prises en charge sont explicitement refusés. La restauration prépare et valide tous les fichiers avant de remplacer une session existante, en conservant son ancien dossier sous `.outpost-recovery/` dans le home de la CLI.

La capture Kimi exclut logs de diagnostic, tâches de fond, tâches cron, notifications et fichiers de verrou. Elle restaure la conversation, pas les processus ou planifications. Une session Kimi déjà présente sous un autre workspace dans le home cible est refusée ; utilisez un home de sandbox privé pour une continuation portable. Fournissez séparément les identifiants et la configuration personnalisée des outils/modèles. L’exécution locale partage le stockage natif de l’hôte ; une restauration peut y relocaliser les métadonnées de session.

API : [DispatchResult](../../reference/dispatchresult/) · [ConversationStore](../../reference/conversationstore/) · [NativeConversationStore](../../reference/nativeconversationstore/) · [createKimiConversations](../../reference/createkimiconversations/) · [createTransportConversations](../../reference/createtransportconversations/).
