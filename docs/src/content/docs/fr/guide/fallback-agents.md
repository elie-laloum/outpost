---
title: "Utiliser un agent de secours"
description: "Confiez le travail à un autre agent lorsqu’une erreur de quota ou de disponibilité prévue survient."
---

## Composer un agent de secours

Créez un agent de secours avec une liste ordonnée de candidats et les types d’erreur attendus dans `on`. Outpost passe au candidat suivant uniquement si l’agent courant rencontre une erreur de quota ou de disponibilité couverte par cette liste.

<!-- tabs -->

```ts title="fallback.ts"
import {
  createClaudeHarness,
  createFallbackAgent,
  createAgent,
} from "@elie-laloum/outpost";
import { coder } from "./outpost.config.ts";

export const claude = createClaudeHarness({ authentication: "account" });
export const agent = createFallbackAgent(
  [
    createAgent({ harness: claude, model: "opus" }),
    createAgent({ harness: claude, model: "sonnet" }),
    coder,
  ],
  { on: ["quota", "unavailable"] },
);
```

```ts title="run.ts"
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { agent } from "./fallback.ts";

export const result = await dispatch({
  repository,
  sandboxProvider,
  agent,
  brief: { text: "Fix the failing tests." },
});
reportValue(result.fallback?.selected.name);
// Example output: claude
```

Un agent de secours s’utilise partout où un agent est accepté, y compris `createSandbox()`, les tâches d’agent et les [candidats concurrents](../speculation/). Chaque candidat garde sa propre [authentification](../authentication/) : un abonnement peut ainsi se replier sur une clé d’API.

## Choisir quand passer la main

`on` est obligatoire et nomme une catégorie ou les deux.

Référence API : [FallbackAgentOptions](../../reference/fallbackagentoptions/).

Tout autre échec, y compris une annulation ou un délai dépassé, est relancé immédiatement. Exception : un délai dépassé après que l’agent a signalé un échec de connexion compte comme une panne. Une panne garde son code (`process`, `provider` ou `timeout`) ; détectez-la avec `unavailableFault(error)`.

## Ce que voit le candidat suivant

<!-- features -->

- **Même workspace** : Les fichiers et commits laissés par le candidat en échec restent en place ; rien n’est réinitialisé.
- **Brief d’origine** : Il démarre une nouvelle conversation à partir du brief ; la conversation en échec reste capturée pour la [récupération](../recovery/).
- **Préparation à la demande** : Il n’est préparé et authentifié que lorsque son tour arrive.

:::note
Le candidat suivant n’est pas informé du travail partiel. Si cela compte, précisez dans le brief que le workspace peut déjà contenir des changements.
:::

## Savoir quel candidat a répondu

Après un passage de relais, vous pouvez examiner les candidats essayés et celui qui a répondu.

Référence API : [DispatchResult](../../reference/dispatchresult/) et [FallbackAttempt](../../reference/fallbackattempt/).

Chaque passage de relais émet un [événement d’agent](../progress/) `fallback` avec `from`, `to`, `failure` et `message`. `result.usage` et les [budgets](../budgets/) de workflow incluent les tokens des candidats en échec. `resume()` et `fork()` sur le résultat continuent avec le candidat retenu.

## Quand tous les candidats échouent

La dernière erreur est relancée, et `recoveryDetails(error).fallback` liste les candidats arrêtés. S’ils ont tous atteint une limite, l’erreur a le code `quota` et porte la réinitialisation la plus proche, à condition que chaque candidat en ait indiqué une.

Avec [`onQuota`](../quota-pauses/), le workflow se met en pause jusqu’à cette réinitialisation. La tentative reprise repart du premier candidat, avec le brief d’origine :

| Tâche                                 | Tentative reprise                                                           |
| ------------------------------------- | --------------------------------------------------------------------------- |
| `defineAgentTask`                     | S’exécute dans la sandbox de la tâche, sur le travail déjà présent.         |
| `defineIsolatedTask` avec intégration | Repart de la branche interrompue ; `quotaResume: "restart"` repart de zéro. |

Parmi des [candidats concurrents](../speculation/), un agent de secours prend le statut `quota` quand l’erreur qui termine sa liste est une limite.

## Limites

- Seuls les messages de limite et de panne reconnus passent la main. Un avis de nouvelle tentative, affiché par la CLI pendant qu’elle réessaie, ne compte pas.
- Chaque candidat doit prendre en charge les options du dispatch, comme le pilotage ou les réparations de réponse ; c’est vérifié avant le démarrage du premier.
- Dans un conteneur ou sur l’hôte, la CLI de chaque candidat doit déjà être installée. Seules les [sandboxes cloud](../cloud-sandboxes/) installent une CLI manquante quand le candidat est essayé.
- Une conversation appartient à un seul agent : un agent de secours refuse une `continuation` explicite et `attach()`.
- Un [rejeu](../record-replay/) reproduit un passage de relais enregistré, mais ne renvoie pas `result.fallback`.

API : [createFallbackAgent](../../reference/createfallbackagent/) · [FallbackAgentOptions](../../reference/fallbackagentoptions/) · [FallbackRecord](../../reference/fallbackrecord/) · [unavailableFault](../../reference/unavailablefault/) · [recoveryDetails](../../reference/recoverydetails/)
