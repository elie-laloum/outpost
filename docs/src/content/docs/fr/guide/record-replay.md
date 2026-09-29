---
title: "Rejouer sans modèle"
description: "Enregistrer un dispatch réel, puis rejouer ses événements, son résultat et ses commits sans appeler de modèle : pour reproduire un bug ou transformer une exécution en test déterministe."
---

## Enregistrer une exécution et la rejouer

```ts
import {
  dispatch,
  createLocalTransport,
  readJournal,
  createReplayAgent,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const brief = { text: "Fix the failing parser test." };
const recorded = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief,
  branch: { mode: "named", name: "recorded-fix" },
  logging: { transporter, replayable: true },
});

const journal = await readJournal({
  transporter,
  reference: recorded.logReference!,
});
const replaying = createReplayAgent({ journal });
const replayed = await dispatch({
  repository,
  sandboxProvider,
  agent: replaying,
  brief,
  branch: { mode: "named", name: "replayed-fix" },
});
console.log(replayed.commits, replaying.remainingTurns); // mêmes commits, 0
```

Le premier dispatch appelle le modèle et écrit un [journal](../journals/). Le second rejoue ce journal : mêmes événements, texte, usage et commits, sans consommer de token.

Les deux branches partent du même commit : les commits rejoués ont donc les mêmes identifiants que les commits enregistrés. Depuis un autre commit qui a le même arbre, les arbres et les messages sont identiques mais les identifiants diffèrent.

## Enregistrer une exécution rejouable

`logging: { replayable: true }` ajoute un événement `workspace-commits` au journal à la fin d’un dispatch en sandbox, y compris en échec ou annulé.

| Champ                               | Contenu                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------- |
| `baseline`                          | Le commit et l’arbre de départ du workspace.                               |
| `commits[].author`, `.committer`    | Nom, e-mail et date de chaque identité.                                    |
| `commits[].message`                 | Le message de commit exact.                                                |
| `commits[].patch`, `commits[].tree` | Un patch Git binaire, vérifié contre l’arbre du commit à l’enregistrement. |

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

<!-- flow -->

1. **Vérifier**: Avant chaque tour.
   - **Comparer le prompt**: Le prompt rendu doit être identique au prompt enregistré.
2. **Réémettre**: À la place d’un appel au modèle.
   - **Rejouer les événements**: Les événements de l’agent ou du harness, puis le texte et l’usage enregistrés. Un journal `verbose` rejoue aussi les lignes brutes et les deltas.
     - `observe`
3. **Reconstruire**: Au dernier tour du dispatch.
   - **Vérifier la baseline**: L’arbre du workspace doit correspondre à la baseline enregistrée.
     - sandbox
   - **Appliquer chaque patch**: `git apply --index`, puis comparer l’arbre obtenu.
     - sandbox
   - **Recréer le commit**: Avec les identités, les dates et le message enregistrés.
     - sandbox
4. **Terminer**: Comme le tour enregistré.
   - **Relancer l’échec**: Un tour en échec à l’enregistrement lève son code et son message d’erreur.
   - **Renvoyer le résultat**: Sinon, le dispatch renvoie le texte, l’usage et les commits enregistrés.

Les commits sont reconstruits via la sandbox : le rejeu fonctionne donc aussi avec les sandboxes cloud. La sandbox a besoin de `git`.

## Rejouer les réparations, les passes et les agents de secours

Les réparations de réponses typées et les `passes` supplémentaires se rejouent comme des tours distincts. `replaying.remainingTurns` compte les tours restants ; un agent de rejeu ne sert qu’une fois, créez-en un par rejeu.

Le passage de relais d’un [agent de secours](../fallback-agents/) se rejoue dans le même tour : les événements du candidat arrêté, l’événement `fallback`, puis le tour du candidat suivant. Le prompt du candidat suivant n’est pas comparé, puisqu’il est reparti du brief d’origine. Le résultat contient le texte du candidat retenu, les commits de tous les candidats et leur usage cumulé, mais pas de `result.fallback`.

## Traiter les divergences

Quand le rejeu s’écarte de son journal, il lève [`ReplayDivergence`](../../reference/replaydivergence/), une `OutpostError` de code `replay`.

| `kind`       | Cause                                                                          |
| ------------ | ------------------------------------------------------------------------------ |
| `prompt`     | Le prompt rendu diffère du prompt enregistré.                                  |
| `baseline`   | Le workspace part d’un arbre différent.                                        |
| `tree`       | Un patch ne s’applique pas, ou produit un arbre différent.                     |
| `exhausted`  | Le dispatch demande plus de tours que le journal n’en contient.                |
| `unrecorded` | Le journal ne contient pas de commits du workspace, ou ils sont `unavailable`. |

```ts
import {
  dispatch,
  createReplayAgent,
  ReplayDivergence,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

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
  console.log(error.kind, error.turn, error.expected, error.actual);
}
```

`turn`, `expected`, `actual` et `commit` situent l’écart. `divergence: "warn"` transforme les écarts `prompt`, `baseline`, `tree` et `unrecorded` en avertissements et poursuit le rejeu. Un patch qui ne s’applique pas et un journal épuisé lèvent toujours l’erreur.

Avec `warn`, un journal enregistré sans `replayable` rejoue ses événements sans commits.

## Rejouer un brief qui nomme sa branche

Un brief qui utilise `{{WORK_BRANCH}}` met le nom de la branche dans le prompt. Une branche `integrate` reçoit un nouveau nom généré à chaque exécution : son prompt ne correspond donc jamais.

Rejouez sur une branche `named` portant le nom enregistré, supprimée au préalable pour repartir de la baseline, ou rejouez avec `divergence: "warn"`.

## Transformer une exécution en test

Enregistrez une fois le journal dans `fixtures/parser-fix.json` avec `JSON.stringify(journal)`, et posez le tag `parser-fix-base` sur le commit de départ de la branche enregistrée. Le test le rejoue sur une nouvelle branche issue de ce tag.

```ts title="parser-fix.test.mts"
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { createReplayAgent, dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

test("the parser fix replays", async () => {
  const journal = JSON.parse(
    await readFile("fixtures/parser-fix.json", "utf8"),
  );
  const agent = createReplayAgent({ journal });
  const result = await dispatch({
    repository,
    sandboxProvider,
    agent,
    brief: { text: "Fix the failing parser test." },
    branch: {
      mode: "named",
      name: `replay/${randomUUID()}`,
      from: "parser-fix-base",
    },
  });
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
