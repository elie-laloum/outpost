---
title: "Rejouer une exécution enregistrée"
description: "Rejouez un journal et ses commits enregistrés sans envoyer de requête au modèle."
---

## Enregistrer une exécution et la rejouer

Enregistrez une tâche dans un [journal](../journals/), puis utilisez un agent de rejeu pour reproduire ses événements et ses commits enregistrés. Le rejeu n’envoie aucune requête au modèle ; ses champs de consommation reprennent les compteurs d’origine, sans nouvelle consommation.

<!-- tabs -->

```ts title="record-settings.ts"
import { createLocalTransport } from "@elie-laloum/outpost";

export const transporter = createLocalTransport({
  directory: ".outpost/storage",
});
export const brief = { text: "Fix the failing parser test." };
```

```ts title="record.ts"
import { dispatch, readJournal } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";
import { brief, transporter } from "./record-settings.ts";

export const recorded = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief,
  branch: { mode: "named", name: "recorded-fix" },
  logging: { transporter, replayable: true },
});
export const journal = await readJournal({
  transporter,
  reference: recorded.logReference!,
});
```

```ts title="replay.ts"
import { reportValue } from "./reporter.ts";
import { createReplayAgent, dispatch } from "@elie-laloum/outpost";
import { journal } from "./record.ts";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { brief } from "./record-settings.ts";

export const replaying = createReplayAgent({ journal });
export const replayed = await dispatch({
  repository,
  sandboxProvider,
  agent: replaying,
  brief,
  branch: { mode: "named", name: "replayed-fix" },
});
reportValue(replayed.commits, replaying.remainingTurns);
// Example output: [ { oid: '8f3a21c…', subject: 'Fix the failing test' } ] 0
```

Les deux branches partent du même commit : les commits rejoués ont donc les mêmes identifiants que les commits enregistrés. Depuis un autre commit qui a le même arbre, les arbres et les messages sont identiques mais les identifiants diffèrent.

## Enregistrer une exécution rejouable

`logging: { replayable: true }` ajoute un événement `workspace-commits` au journal à la fin d’un dispatch en sandbox, y compris en échec ou annulé.

Référence API : [WorkspaceCommitsEvent](../../reference/workspacecommitsevent/).

:::caution
Les patchs mettent du contenu du dépôt dans le journal. Conservez et partagez les journaux rejouables comme le code lui-même.
:::

Quand l’historique ne peut pas être enregistré, l’événement garde la baseline, donne la raison dans `unavailable`, et le dispatch émet un avertissement. Le résultat du dispatch ne change jamais. C’est le cas avec :

- des commits de merge, ou un historique réécrit depuis la baseline ;
- plus de 8 Mio de patchs et de messages ;
- un message de commit dans un autre encodage qu’UTF-8 ;
- un patch qui ne reproduit pas l’arbre de son commit.

## Ce que fait un rejeu

Passez le journal à `createReplayAgent()` et utilisez le résultat comme `agent` d’un `dispatch()` avec le même brief. Le rejeu avance tour par tour, dans l’ordre de l’enregistrement.

<!-- canvas -->

- **Vérifier**: Avant chaque tour.
  - Étapes
  - **Comparer le prompt**: Le prompt rendu doit être identique au prompt enregistré.
  - → **Réémettre**: puis
- **Réémettre**: À la place d’un appel au modèle.
  - Étapes
  - **Rejouer les événements**: Les événements de l’agent ou du harness, puis le texte et l’usage enregistrés. Un journal `verbose` rejoue aussi les lignes brutes et les deltas.
    - `observe`
  - → **Reconstruire**: puis
- **Reconstruire**: Au dernier tour du dispatch.
  - Étapes
  - **Vérifier la baseline**: L’arbre du workspace doit correspondre à la baseline enregistrée.
    - sandbox
  - **Appliquer chaque patch**: `git apply --index`, puis comparer l’arbre obtenu.
    - sandbox
  - **Recréer le commit**: Avec les identités, les dates et le message enregistrés.
    - sandbox
  - → **Terminer**: puis
- **Terminer**: Comme le tour enregistré.
  - Étapes
  - **Relancer l’échec**: Un tour en échec à l’enregistrement lève son code et son message d’erreur.
  - **Renvoyer le résultat**: Sinon, le dispatch renvoie le texte, l’usage et les commits enregistrés.

Les commits sont reconstruits via la sandbox : le rejeu fonctionne donc aussi avec les sandboxes cloud. La sandbox a besoin de `git`.

## Rejouer les réparations, les passes et les agents de secours

Les réparations de réponses typées et les `passes` supplémentaires se rejouent comme des tours distincts. `replaying.remainingTurns` compte les tours restants ; un agent de rejeu ne sert qu’une fois, créez-en un par rejeu.

Le passage de relais d’un [agent de secours](../fallback-agents/) se rejoue dans le même tour : les événements du candidat arrêté, l’événement `fallback`, puis le tour du candidat suivant. Le prompt du candidat suivant n’est pas comparé, puisqu’il est reparti du brief d’origine. Le résultat contient le texte du candidat retenu, les commits de tous les candidats et leur usage cumulé, mais pas de `result.fallback`.

## Traiter les divergences

Quand le rejeu s’écarte de son journal, il lève [`ReplayDivergence`](../../reference/replaydivergence/), une `OutpostError` de code `replay`.

Référence API : [ReplayDivergenceKind](../../reference/replaydivergencekind/).

```ts
import { reportValue } from "./reporter.ts";
import {
  dispatch,
  createReplayAgent,
  ReplayDivergence,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
declare const journal: readonly unknown[];
try {
  await dispatch({
    repository,
    sandboxProvider,
    agent: createReplayAgent({ journal }),
    brief: { text: "Fix the failing parser test." },
  });
} catch (error) {
  if (!(error instanceof ReplayDivergence)) throw error;
  reportValue(error.kind, error.turn, error.expected, error.actual);
  // Example output: prompt 0 Expected brief Actual brief
}
```

`turn`, `expected`, `actual` et `commit` situent l’écart. `divergence: "warn"` transforme les écarts `prompt`, `baseline`, `tree` et `unrecorded` en avertissements et poursuit le rejeu. Un patch qui ne s’applique pas et un journal épuisé lèvent toujours l’erreur.

Avec `warn`, un journal enregistré sans `replayable` rejoue ses événements sans commits.

## Rejouer un brief qui nomme sa branche

Un brief qui utilise `{{WORK_BRANCH}}` met le nom de la branche dans le prompt. Une branche `integrate` reçoit un nouveau nom généré à chaque exécution : son prompt ne correspond donc jamais.

Rejouez sur une branche `named` portant le nom enregistré, supprimée au préalable pour repartir de la baseline, ou rejouez avec `divergence: "warn"`.

## Transformer une exécution en test

Enregistrez une fois le journal dans `fixtures/parser-fix.json` avec `JSON.stringify(journal)`, et posez le tag `parser-fix-base` sur le commit de départ de la branche enregistrée. Le test le rejoue sur une nouvelle branche issue de ce tag.

<!-- tabs -->

```ts title="replay-fixture.ts"
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

export const journal = JSON.parse(
  await readFile("fixtures/parser-fix.json", "utf8"),
);
export const branch = {
  mode: "named",
  name: `replay/${randomUUID()}`,
  from: "parser-fix-base",
} as const;
```

```ts title="replay-parser.ts"
import { createReplayAgent, dispatch } from "@elie-laloum/outpost";
import { journal, branch } from "./replay-fixture.ts";
import { repository, sandboxProvider } from "./outpost.config.ts";

export async function replayParser() {
  const agent = createReplayAgent({ journal });
  const result = await dispatch({
    repository,
    sandboxProvider,
    agent,
    brief: { text: "Fix the failing parser test." },
    branch,
  });
  return { agent, result };
}
```

```ts title="parser-fix.test.ts"
import { test } from "node:test";
import { replayParser } from "./replay-parser.ts";
import assert from "node:assert/strict";

test("the parser fix replays", async () => {
  const { agent, result } = await replayParser();
  assert.equal(agent.remainingTurns, 0);
  assert.equal(result.commits.length, 1);
});
```

Le test échoue avec une `ReplayDivergence` quand le brief ou la baseline change. Chaque exécution laisse sa branche `replay/…` derrière elle.

## Limites

- Un journal correspond à un dispatch. Un workflow entier ne se rejoue pas.
- Seuls les commits sont rejoués. Les modifications non commitées du worktree ne sont pas enregistrées.
- Un rejeu ne peut être ni repris, ni forké, ni réorienté, et il n’a pas de conversation à capturer.
- Les commits signés sont reconstruits sans leur signature : leurs identifiants diffèrent.

API : [createReplayAgent](../../reference/createreplayagent/) · [ReplayAgent](../../reference/type-replayagent/) · [ReplayDivergence](../../reference/replaydivergence/) · [WorkspaceCommitsEvent](../../reference/workspacecommitsevent/) · [Logging](../../reference/logging/) · [readJournal](../../reference/readjournal/)
