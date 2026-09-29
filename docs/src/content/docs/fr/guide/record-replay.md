---
title: "Enregistrer et rejouer"
description: "Conserver un dispatch réel et le rejouer sans appeler de modèle."
---

`createReplayAgent()` rejoue le journal enregistré d’un dispatch. Il est disponible depuis la 8.0.0. Le rejeu réémet les événements enregistrés, renvoie le texte et l’usage enregistrés et reconstruit les commits enregistrés. Il n’appelle jamais de modèle. Utilisez-le pour reproduire un bug ou pour transformer une exécution réelle en test déterministe.

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

Les deux branches nommées partent du même commit : les commits rejoués ont donc les mêmes identifiants que les commits enregistrés.

## Enregistrer un run rejouable

`logging.replayable` ajoute un événement `workspace-commits` à la fin de chaque dispatch en sandbox. Pour chaque commit, il conserve l’arbre, les identités et dates de l’auteur et du committer, le message exact et un patch Git binaire. Pendant l’enregistrement, Outpost applique chaque patch à un index temporaire : un événement qui contient des patchs reproduit donc à coup sûr l’arbre de chaque commit.

L’enregistrement est optionnel : ces patchs mettent du contenu du dépôt dans le journal. Conservez et partagez les journaux rejouables avec le même soin que le code.

Certains historiques ne sont pas enregistrés. L’événement garde alors la baseline et donne la raison dans `unavailable`, et le dispatch émet un avertissement :

- commits de merge, ou historique réécrit depuis la baseline ;
- plus de 8 Mio de patchs et de messages ;
- commits dont le message utilise un encodage autre qu’UTF-8 ;
- patch qui ne reproduit pas son arbre, par exemple quand un `.gitattributes` du dépôt impose un diff texte sur un contenu non UTF-8.

Un échec d’enregistrement ne change jamais le résultat du dispatch. Les dispatchs en échec ou annulés enregistrent aussi leurs commits, et `dispatch-finished` gagne un champ `error` avec le code et le message.

## Ce que fait un rejeu

L’agent de rejeu travaille tour par tour, dans l’ordre de l’enregistrement :

1. Il compare le prompt rendu au prompt enregistré.
2. Il réémet les événements enregistrés de l’agent ou du harness, en gardant la source d’observation du harness. Un journal `verbose` rejoue aussi les lignes brutes, les deltas et la sortie des outils.
3. Au dernier tour d’un dispatch en sandbox, il reconstruit les commits dans la sandbox. Il vérifie l’arbre de la baseline, applique chaque patch avec `git apply --index` et compare l’arbre obtenu. Il recrée ensuite le commit avec les identités et le message enregistrés. Tout passe par la sandbox : cela fonctionne aussi avec les fournisseurs distants.
4. Si le tour enregistré a échoué, il relance le code et le message d’erreur enregistrés après avoir rejoué ses événements et ses commits.

Le passage de relais d’un [agent de secours](../agent-fallback/) est rejoué dans le même tour : après les événements du candidat arrêté, le rejeu réémet l’événement `fallback` et enchaîne sur le tour enregistré du candidat suivant. Son prompt n’est pas comparé, car ce candidat est reparti du brief d’origine. Le résultat rejoué contient le texte du candidat retenu, les commits de tous les candidats et leur usage cumulé, mais pas de `result.fallback` : le dispatch ne voit que l’agent de rejeu.

Les réparations de réponses structurées et les passes multiples sont rejouées tour par tour. L’usage rapporté est l’usage enregistré ; aucun token n’est consommé. Un agent de rejeu ne sert qu’une fois : `remainingTurns` compte les tours qui restent à rejouer. Créez-en un nouveau pour chaque rejeu.

Le workspace a besoin de `git`, comme tout agent qui commite. Avec le même commit de départ, les identifiants des commits rejoués sont identiques. Depuis un autre commit qui a le même arbre, les arbres et les messages sont les mêmes mais les identifiants diffèrent. Les commits signés sont reconstruits sans leur signature.

## Divergences

Quand le rejeu diffère de son journal, il lève `ReplayDivergence`, une `OutpostError` de code `replay` :

| `kind`       | Cause                                                                          |
| ------------ | ------------------------------------------------------------------------------ |
| `prompt`     | Le prompt rendu diffère du prompt enregistré.                                  |
| `baseline`   | La sandbox part d’un arbre différent.                                          |
| `tree`       | Un patch ne s’applique pas, ou produit un arbre différent.                     |
| `exhausted`  | Le dispatch demande plus de tours que le journal n’en contient.                |
| `unrecorded` | Le journal ne contient pas de commits du workspace, ou ils sont `unavailable`. |

`turn`, `expected`, `actual` et `commit` situent l’écart. `divergence: "warn"` transforme les écarts `prompt`, `baseline`, `tree` et `unrecorded` en avertissements et continue. Un patch qui ne s’applique pas et un journal épuisé échouent toujours. Avec `warn`, un journal enregistré sans `replayable` rejoue ses événements sans commits.

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

Un brief qui utilise `{{WORK_BRANCH}}` rend un prompt différent à chaque run. Rejouez-le avec `divergence: "warn"`.

## Limites

- Un journal correspond à un dispatch. Rejouer un workflow entier sort du périmètre.
- Seuls les commits sont rejoués. Les modifications laissées non commitées dans le worktree ne sont pas enregistrées.
- Un rejeu ne peut être ni repris ni forké, et il n’a pas de conversation à capturer.

API : [createReplayAgent](../../reference/createreplayagent/) · [ReplayAgent](../../reference/type-replayagent/) · [ReplayDivergence](../../reference/replaydivergence/) · [WorkspaceCommitsEvent](../../reference/workspacecommitsevent/) · [Logging](../../reference/logging/).
